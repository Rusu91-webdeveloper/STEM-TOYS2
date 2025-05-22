import React from "react";
import { auth } from "@/lib/auth";
import { OrderHistory } from "@/features/account/components/OrderHistory";

export const metadata = {
  title: "Orders | My Account",
  description: "View your order history and track recent purchases",
};

export default async function OrdersPage() {
  const session = await auth();

  if (!session?.user) {
    // This should never happen since layout handles auth check
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">My Orders</h2>
        <p className="text-sm text-muted-foreground">
          View your order history and track recent purchases
        </p>
      </div>
      <OrderHistory />
    </div>
  );
}
