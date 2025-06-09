import { NextResponse } from "next/server";
import Stripe from "stripe";

// Initialize Stripe with a dummy key for testing if not provided
const stripeSecretKey =
  process.env.STRIPE_SECRET_KEY || "sk_test_dummy_key_for_testing";
const stripe = new Stripe(stripeSecretKey);

export async function POST(request: Request) {
  try {
    const {
      amount,
      currency = "usd",
      payment_method_types = ["card"],
    } = await request.json();

    // Validate the request
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      payment_method_types,
      metadata: {
        integration_check: "accept_a_payment",
      },
    });

    // Return the client secret
    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    return NextResponse.json(
      { error: "Error creating payment intent" },
      { status: 500 }
    );
  }
}
