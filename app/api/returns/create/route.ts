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
