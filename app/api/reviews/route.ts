import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// Schema for validating review submission
const reviewSchema = z.object({
  orderItemId: z.string(),
  productId: z.string(),
  rating: z.number().int().min(1).max(5),
  title: z.string().min(3).max(100),
  content: z.string().min(10).max(1000),
});

export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to submit a review." },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validatedData = reviewSchema.parse(body);

    // Check if the order item belongs to the user and is in "delivered" status
    const orderItem = await db.orderItem.findUnique({
      where: {
        id: validatedData.orderItemId,
      },
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

    // Verify that the order belongs to the user
    if (orderItem.order.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only review items from your own orders" },
        { status: 403 }
      );
    }

    // Verify that the order is delivered
    if (orderItem.order.status !== "DELIVERED") {
      return NextResponse.json(
        { error: "You can only review items from delivered orders" },
        { status: 403 }
      );
    }

    // Check if the user has already reviewed this order item
    const existingReview = await db.review.findFirst({
      where: {
        userId: session.user.id,
        orderItemId: validatedData.orderItemId,
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "You have already reviewed this item" },
        { status: 409 }
      );
    }

    // Create the review
    const review = await db.review.create({
      data: {
        userId: session.user.id,
        productId: validatedData.productId,
        orderItemId: validatedData.orderItemId,
        rating: validatedData.rating,
        title: validatedData.title,
        content: validatedData.content,
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error("Error creating review:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid review data", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const productId = url.searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const reviews = await db.review.findMany({
      where: {
        productId,
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Format the reviews for the frontend
    const formattedReviews = reviews.map((review) => ({
      id: review.id,
      productId: review.productId,
      userId: review.userId,
      userName: review.user.name || "Anonymous",
      rating: review.rating,
      title: review.title,
      content: review.content,
      date: review.createdAt.toISOString(),
      verified: true, // Since we verify that the user purchased the item
    }));

    return NextResponse.json(formattedReviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}
