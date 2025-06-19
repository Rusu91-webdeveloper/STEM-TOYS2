import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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

    const { orderItemId, reason, details } = await request.json();

    // Find the order item
    const orderItem = await prisma.orderItem.findUnique({
      where: { id: orderItemId },
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

    if (!orderItem) {
      return NextResponse.json(
        { error: "Order item not found" },
        { status: 404 }
      );
    }

    // Check if item is a digital book (not returnable)
    if (orderItem.isDigital) {
      return NextResponse.json(
        {
          error:
            "Digital books cannot be returned as they are instantly delivered products",
        },
        { status: 400 }
      );
    }

    // Verify the user owns this order
    if (
      orderItem.order.userId !== session.user.id &&
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json(
        { error: "Unauthorized to initiate this return" },
        { status: 403 }
      );
    }

    // Check if a return already exists for this order item
    const existingReturn = await prisma.return.findFirst({
      where: {
        orderItemId: orderItem.id,
        userId: session.user.id,
      },
    });
    if (existingReturn) {
      return NextResponse.json(
        { error: "You have already requested a return for this item." },
        { status: 400 }
      );
    }

    // Only allow returns for delivered items
    if (orderItem.order.status !== "DELIVERED") {
      return NextResponse.json(
        { error: "You can only return items from delivered orders." },
        { status: 400 }
      );
    }

    // Check if the return is within 30 days
    const daysSinceOrder = differenceInDays(
      new Date(),
      orderItem.order.createdAt
    );

    if (daysSinceOrder > 30) {
      return NextResponse.json(
        { error: "Returns are only allowed within 30 days of purchase" },
        { status: 400 }
      );
    }

    // Create the return record
    const returnRecord = await prisma.return.create({
      data: {
        userId: session.user.id,
        orderId: orderItem.orderId,
        orderItemId: orderItem.id,
        reason,
        details: reason === "OTHER" ? details : null,
        status: "PENDING",
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Update the order item status to reflect return requested
    await prisma.orderItem.update({
      where: { id: orderItem.id },
      data: { returnStatus: "REQUESTED" },
    });

    // Get store settings for admin email
    const storeSettings = await prisma.storeSettings.findFirst();
    const adminEmail = storeSettings?.contactEmail || "info@techtots.com";

    // Log environment variables for debugging
    console.log("==== RETURN EMAIL DEBUG INFO ====");
    console.log("EMAIL_FROM env:", process.env.EMAIL_FROM);
    console.log("BREVO_API_KEY available:", !!process.env.BREVO_API_KEY);
    console.log("BREVO_SMTP_KEY available:", !!process.env.BREVO_SMTP_KEY);
    console.log("Admin email from store settings:", adminEmail);
    console.log("================================");

    // Map reason code to human-readable text
    const reasonLabels = {
      DOES_NOT_MEET_EXPECTATIONS: "Does not meet expectations",
      DAMAGED_OR_DEFECTIVE: "Damaged or defective",
      WRONG_ITEM_SHIPPED: "Wrong item shipped",
      CHANGED_MIND: "Changed my mind",
      ORDERED_WRONG_PRODUCT: "Ordered wrong product",
      OTHER: "Other reason",
    };

    // Send emails
    try {
      // Send admin notification using the dedicated template
      console.log("Sending admin notification email to:", adminEmail);
      await import("@/lib/nodemailer").then(async ({ emailTemplates }) => {
        try {
          const result = await emailTemplates.returnNotification({
            to: adminEmail,
            orderNumber: orderItem.order.orderNumber,
            productName: orderItem.name,
            productSku: orderItem.product.sku || undefined,
            customerName: returnRecord.user.name || returnRecord.user.email,
            customerEmail: returnRecord.user.email,
            reason: reasonLabels[reason as keyof typeof reasonLabels] || reason,
            details: details || undefined,
            returnId: returnRecord.id,
          });

          console.log("Admin notification email result:", result);
        } catch (error) {
          console.error("Failed to send admin notification email:", error);
        }
      });

      // Send customer confirmation email
      const userEmail = session.user.email;
      if (typeof userEmail === "string" && userEmail) {
        console.log("Sending customer confirmation email to:", userEmail);
        await import("@/lib/nodemailer").then(async ({ sendMail }) => {
          await sendMail({
            to: userEmail,
            subject: `Return Request Received - Order #${orderItem.order.orderNumber}`,
            html: `<div style='font-family: sans-serif; max-width: 600px; margin: 0 auto;'>
              <h1 style='color: #333;'>Return Request Received</h1>
              <p>Hello,</p>
              <p>We have received your return request for <strong>${orderItem.name}</strong> from order <strong>#${orderItem.order.orderNumber}</strong>.</p>
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
      console.error("Error sending return emails:", emailError);
      // Log more details about the error
      console.error("Error details:", JSON.stringify(emailError, null, 2));
    }

    return NextResponse.json({
      success: true,
      message: "Return initiated successfully",
      data: returnRecord,
    });
  } catch (error) {
    console.error("Error initiating return:", error);
    return NextResponse.json(
      { error: "Failed to initiate return" },
      { status: 500 }
    );
  }
}
