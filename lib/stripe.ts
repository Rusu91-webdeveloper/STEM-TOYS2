import { loadStripe, Stripe } from "@stripe/stripe-js";

// Load the Stripe public key from environment variable
// Set a fallback for development/testing
const stripePublicKey =
  process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || "pk_test_dummy_key_for_testing";

// Create a promise that resolves to the Stripe object
let stripePromise: Promise<Stripe | null>;

// Function to get the Stripe promise
export const getStripe = () => {
  if (!stripePromise) {
    // In development, return a mock Stripe object if needed
    if (
      process.env.NODE_ENV !== "production" &&
      !stripePublicKey.startsWith("pk_")
    ) {
      console.warn("Using dummy Stripe key for testing");
    }
    stripePromise = loadStripe(stripePublicKey);
  }
  return stripePromise;
};
