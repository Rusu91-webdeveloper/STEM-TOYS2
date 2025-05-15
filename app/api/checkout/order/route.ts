import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Order validation schema
const shippingAddressSchema = z.object({
  fullName: z.string(),
  addressLine1: z.string(),
  addressLine2: z.string().optional(),
  city: z.string(),
  state: z.string(),
  postalCode: z.string(),
  country: z.string(),
  phone: z.string(),
});

const shippingMethodSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  estimatedDelivery: z.string(),
});

const paymentDetailsSchema = z.object({
  cardNumber: z.string(),
  cardholderName: z.string(),
  expiryDate: z.string(),
  cvv: z.string(),
});

const orderSchema = z.object({
  shippingAddress: shippingAddressSchema,
  shippingMethod: shippingMethodSchema,
  paymentDetails: paymentDetailsSchema,
  billingAddressSameAsShipping: z.boolean().default(true),
  billingAddress: shippingAddressSchema.optional(),
  orderDate: z.string().datetime(),
  status: z.string(),
});

// POST /api/checkout/order - Create a new order
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();

    // Validate request body
    const orderData = orderSchema.parse(body);

    // In a real app, this would:
    // 1. Store the order in the database
    // 2. Process the payment with Stripe
    // 3. Send order confirmation emails
    // 4. Clear the user's cart

    // For this demo, we'll just generate a random order ID
    const orderId = Math.random().toString(36).substring(2, 12).toUpperCase();

    return NextResponse.json({
      success: true,
      orderId,
      message: "Order created successfully",
    });
  } catch (error) {
    console.error("Failed to create order:", error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid order data",
          error: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create order",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
