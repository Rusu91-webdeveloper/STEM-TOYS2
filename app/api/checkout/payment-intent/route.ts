import { NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { cookies } from "next/headers";

// Initialize Stripe with a dummy key for testing if not provided
const stripeSecretKey =
  process.env.STRIPE_SECRET_KEY || "sk_test_dummy_key_for_testing";
const stripe = new Stripe(stripeSecretKey);

// Schema for validating the request body
const paymentIntentSchema = z.object({
  amount: z.number().positive(),
});

// POST /api/checkout/payment-intent - Create a Stripe payment intent
export async function POST(request: Request) {
  try {
    const session = await auth();
    const body = await request.json();

    // Validate the request
    const { amount } = paymentIntentSchema.parse(body);

    // In development, simulate a successful payment intent without calling Stripe
    if (process.env.NODE_ENV !== "production") {
      return NextResponse.json({
        clientSecret: "pi_dummy_client_secret_for_testing",
      });
    }

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      // Verify your integration by passing this to metadata
      metadata: {
        integration_check: "nextcommerce_payment",
        userId: session?.user?.id,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Payment intent error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
