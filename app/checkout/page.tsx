import React from "react";
import { Metadata } from "next";
import { CheckoutFlow } from "@/features/checkout/components/CheckoutFlow";

export const metadata: Metadata = {
  title: "Checkout | NextCommerce",
  description: "Complete your purchase",
};

export default function CheckoutPage() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      <CheckoutFlow />
    </div>
  );
}
