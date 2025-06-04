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
      },
    });

    if (!orderItem) {
      return NextResponse.json(
        { error: "Order item not found" },
        { status: 404 }
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
    });

    // Update the order item status to reflect return requested
    await prisma.orderItem.update({
      where: { id: orderItem.id },
      data: { returnStatus: "REQUESTED" },
    });

    // Send return confirmation email
    try {
      const userEmail = session.user.email;
      if (typeof userEmail === "string" && userEmail) {
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
      console.error("Error sending return confirmation email:", emailError);
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
