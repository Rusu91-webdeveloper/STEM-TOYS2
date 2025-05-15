/**
 * API functions for interacting with the checkout backend
 */

/**
 * Create a payment intent
 */
export async function createPaymentIntent(
  amount: number,
  metadata?: Record<string, string>
): Promise<{ clientSecret: string } | null> {
  try {
    const response = await fetch("/api/checkout/payment-intent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
        metadata,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to create payment intent: ${response.statusText}`
      );
    }

    const data = await response.json();
    return { clientSecret: data.clientSecret };
  } catch (error) {
    console.error("Error creating payment intent:", error);
    return null;
  }
}

/**
 * Create an order
 */
export async function createOrder(
  orderData: any
): Promise<{ orderId: string } | null> {
  try {
    const response = await fetch("/api/checkout/order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create order: ${response.statusText}`);
    }

    const data = await response.json();
    return { orderId: data.orderId };
  } catch (error) {
    console.error("Error creating order:", error);
    return null;
  }
}
