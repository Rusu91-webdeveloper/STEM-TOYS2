import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { differenceInDays } from "date-fns";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be logged in to initiate a return" },
        { status: 401 }
      );
    }

    const { orderItemIds, reason, details } = await request.json();

    if (
      !orderItemIds ||
      !Array.isArray(orderItemIds) ||
      orderItemIds.length === 0
    ) {
      return NextResponse.json(
        { error: "Please select at least one item to return" },
        { status: 400 }
      );
    }

    // Find all order items with proper relationships
    const orderItems = await db.orderItem.findMany({
      where: {
        id: { in: orderItemIds },
      },
      include: {
        order: true,
        product: {
          select: {
            name: true,
            sku: true,
            images: true,
          },
        },
        book: {
          select: {
            name: true,
            author: true,
          },
        },
      },
    });

    if (orderItems.length !== orderItemIds.length) {
      return NextResponse.json(
        { error: "Some items were not found" },
        { status: 404 }
      );
    }

    // Check if any items are digital books (not returnable)
    // Use type assertion to access isDigital property
    const digitalItems = orderItems.filter((item) => (item as any).isDigital);
    if (digitalItems.length > 0) {
      return NextResponse.json(
        {
          error:
            "Digital books cannot be returned as they are instantly delivered products",
        },
        { status: 400 }
      );
    }

    // Verify all items belong to the same order and user owns them
    const orderId = orderItems[0].orderId;
    const userId = orderItems[0].order.userId;

    if (userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized to initiate this return" },
        { status: 403 }
      );
    }

    // Check if all items belong to the same order
    const allSameOrder = orderItems.every((item) => item.orderId === orderId);
    if (!allSameOrder) {
      return NextResponse.json(
        { error: "All items must be from the same order" },
        { status: 400 }
      );
    }

    // Check if any return already exists for these order items
    const existingReturns = await db.return.findMany({
      where: {
        orderItemId: { in: orderItemIds },
        userId: session.user.id,
      },
    });

    if (existingReturns.length > 0) {
      return NextResponse.json(
        {
          error:
            "You have already requested a return for one or more of these items.",
        },
        { status: 400 }
      );
    }

    // Only allow returns for delivered items
    if (orderItems[0].order.status !== "DELIVERED") {
      return NextResponse.json(
        { error: "You can only return items from delivered orders." },
        { status: 400 }
      );
    }

    // Check if the return is within 14 days of delivery
    const order = orderItems[0].order;

    // Use deliveredAt if available, otherwise fall back to order creation date
    // This matches the frontend logic for return eligibility
    const referenceDate = order.deliveredAt
      ? order.deliveredAt
      : order.createdAt;

    const daysSinceReference = differenceInDays(new Date(), referenceDate);
    if (daysSinceReference > 14) {
      const dateType = order.deliveredAt ? "delivery" : "order placement";
      return NextResponse.json(
        { error: `Returns are only allowed within 14 days of ${dateType}` },
        { status: 400 }
      );
    }

    // Create return records for all items in a transaction
    const returnRecords = await db.$transaction(async (tx) => {
      // Create return records
      const returns = await Promise.all(
        orderItems.map((item) =>
          tx.return.create({
            data: {
              userId: session.user.id,
              orderId: item.orderId,
              orderItemId: item.id,
              reason,
              details: reason === "OTHER" ? details : null,
              status: "PENDING",
            },
          })
        )
      );

      // Update order item statuses
      await Promise.all(
        orderItems.map((item) =>
          tx.orderItem.update({
            where: { id: item.id },
            data: { returnStatus: "REQUESTED" },
          })
        )
      );

      return returns;
    });

    // Get user details for email
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true },
    });

    // Get store settings for admin email
    const storeSettings = await db.storeSettings.findFirst();
    const adminEmail = storeSettings?.contactEmail || "info@techtots.com";

    // Map reason code to human-readable text
    const reasonLabels = {
      DOES_NOT_MEET_EXPECTATIONS: "Does not meet expectations",
      DAMAGED_OR_DEFECTIVE: "Damaged or defective",
      WRONG_ITEM_SHIPPED: "Wrong item shipped",
      CHANGED_MIND: "Changed my mind",
      ORDERED_WRONG_PRODUCT: "Ordered wrong product",
      OTHER: "Other reason",
    };

    // Send consolidated emails
    try {
      // Send admin notification for bulk return
      console.log(
        "Sending bulk return admin notification email to:",
        adminEmail
      );
      await import("@/lib/nodemailer").then(async ({ sendMail }) => {
        const itemsList = orderItems
          .map(
            (item) =>
              `• ${item.name} (SKU: ${item.product?.sku || "N/A"}) - Qty: ${item.quantity}`
          )
          .join("<br>");

        await sendMail({
          to: adminEmail,
          subject: `Bulk Return Request - Order #${order.orderNumber}`,
          html: `<div style='font-family: sans-serif; max-width: 600px; margin: 0 auto;'>
            <h1 style='color: #e74c3c;'>Bulk Return Request</h1>
            <p><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p><strong>Customer:</strong> ${user?.name || user?.email}</p>
            <p><strong>Email:</strong> ${user?.email}</p>
            <p><strong>Items to Return:</strong></p>
            <div style='background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 10px 0;'>
              ${itemsList}
            </div>
            <p><strong>Reason:</strong> ${reasonLabels[reason as keyof typeof reasonLabels] || reason}</p>
            ${details ? `<p><strong>Details:</strong> ${details}</p>` : ""}
            <p><strong>Number of Items:</strong> ${orderItems.length}</p>
            <p><strong>Return IDs:</strong> ${returnRecords.map((r) => r.id).join(", ")}</p>
            <p>Please process this bulk return request.</p>
          </div>`,
        });
      });

      // Send customer confirmation email
      const userEmail = session.user.email;
      if (typeof userEmail === "string" && userEmail) {
        console.log(
          "Sending bulk return customer confirmation email to:",
          userEmail
        );
        await import("@/lib/nodemailer").then(async ({ sendMail }) => {
          const itemsList = orderItems
            .map((item) => `• ${item.name} - Qty: ${item.quantity}`)
            .join("<br>");

          await sendMail({
            to: userEmail,
            subject: `Bulk Return Request Received - Order #${order.orderNumber}`,
            html: `<div style='font-family: sans-serif; max-width: 600px; margin: 0 auto;'>
              <h1 style='color: #333;'>Return Request Received</h1>
              <p>Hello,</p>
              <p>We have received your return request for ${orderItems.length} item(s) from order <strong>#${order.orderNumber}</strong>.</p>
              <p><strong>Items to Return:</strong></p>
              <div style='background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 10px 0;'>
                ${itemsList}
              </div>
              <p><strong>Reason:</strong> ${reasonLabels[reason as keyof typeof reasonLabels] || reason}</p>
              ${details ? `<p><strong>Additional Details:</strong> ${details}</p>` : ""}
              <p>Our team will review your request and send you further instructions soon.</p>
              <p>You can track your return status in your account.</p>
              <p>Thank you for shopping with us!</p>
            </div>`,
          });
        });
      } else {
        console.warn(
          "User email is missing or invalid, skipping return confirmation email."
        );
      }
    } catch (emailError) {
      console.error("Error sending bulk return emails:", emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message: `Successfully initiated return for ${orderItems.length} item(s)`,
      data: {
        returnIds: returnRecords.map((r) => r.id),
        orderNumber: order.orderNumber,
        itemCount: orderItems.length,
      },
    });
  } catch (error) {
    console.error("Error initiating bulk return:", error);
    return NextResponse.json(
      { error: "Failed to initiate return" },
      { status: 500 }
    );
  }
}
