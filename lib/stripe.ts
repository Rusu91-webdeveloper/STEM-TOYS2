import { loadStripe, Stripe } from "@stripe/stripe-js";

// Load the Stripe public key from environment variable
// In a real app, this would be set in .env.local
const stripePublicKey =
  process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || "pk_test_your_test_key";

// Create a promise that resolves to the Stripe object
let stripePromise: Promise<Stripe | null>;

// Function to get the Stripe promise
export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(stripePublicKey);
  }
  return stripePromise;
};
