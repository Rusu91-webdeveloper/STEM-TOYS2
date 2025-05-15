import Stripe from "stripe";

// Initialize Stripe with the secret key from environment variable
// In a real app, this would be set in .env.local
const stripeSecretKey =
  process.env.STRIPE_SECRET_KEY || "sk_test_your_test_key";

// Create a Stripe instance
const stripe = new Stripe(stripeSecretKey);

export default stripe;
