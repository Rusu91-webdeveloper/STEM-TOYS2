import { NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY || "sk_test_your_test_key"
);
const webhookSecret =
  process.env.STRIPE_WEBHOOK_SECRET || "whsec_your_webhook_secret";

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = headers();
  const signature = headersList.get("stripe-signature") || "";

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 }
    );
  }

  // Handle the event
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log(`PaymentIntent for ${paymentIntent.amount} was successful!`);
      // Handle successful payment (update order status, send confirmation email, etc.)
      await handleSuccessfulPayment(paymentIntent);
      break;

    case "payment_intent.payment_failed":
      const failedPaymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log(
        `Payment failed: ${failedPaymentIntent.last_payment_error?.message}`
      );
      // Handle failed payment (notify customer, update order status, etc.)
      await handleFailedPayment(failedPaymentIntent);
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

// Function to handle successful payment
async function handleSuccessfulPayment(paymentIntent: Stripe.PaymentIntent) {
  // Extract order ID from metadata if available
  const orderId = paymentIntent.metadata.orderId;
  const userEmail = paymentIntent.metadata.userEmail;

  if (orderId) {
    // Update order status to "paid" in database
    // In a real implementation, you would update the order in your database
    console.log(`Updating order ${orderId} to paid status`);

    // Send confirmation email to customer if we have their email
    if (userEmail) {
      try {
        // Get order details from database (mocked here)
        const orderDetails = {
          id: orderId,
          items: [
            {
              name: "Example Product",
              quantity: 1,
              price: paymentIntent.amount / 100, // Convert from cents to dollars
            },
          ],
          total: paymentIntent.amount / 100, // Convert from cents to dollars
        };

        // Send email using our email API
        await fetch("/api/email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "orderConfirmation",
            data: {
              to: userEmail,
              order: orderDetails,
            },
          }),
        });

        console.log(
          `Confirmation email sent to ${userEmail} for order ${orderId}`
        );
      } catch (error) {
        console.error(
          `Failed to send confirmation email: ${(error as Error).message}`
        );
      }
    }
  }
}

// Function to handle failed payment
async function handleFailedPayment(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata.orderId;
  const userEmail = paymentIntent.metadata.userEmail;

  if (orderId) {
    // Update order status to "payment_failed" in database
    console.log(`Updating order ${orderId} to payment_failed status`);

    // Notify customer about failed payment if we have their email
    if (userEmail) {
      // Send an email notification about the failed payment
      // Implement this using the email API
      console.log(
        `Sending payment failure notification to ${userEmail} for order ${orderId}`
      );
    }
  }
}
