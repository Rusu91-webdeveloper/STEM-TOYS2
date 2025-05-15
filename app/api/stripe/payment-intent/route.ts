import { NextResponse } from "next/server";
import Stripe from "stripe";

// Initialize Stripe with secret key (from environment variables in production)
const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY || "sk_test_your_test_key"
);

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
