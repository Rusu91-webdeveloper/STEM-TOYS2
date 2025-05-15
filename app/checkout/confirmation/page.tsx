import React from "react";
import Link from "next/link";
import { Check, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Order Confirmation | NextCommerce",
  description: "Your order has been placed successfully",
};

export default function OrderConfirmationPage({
  searchParams,
}: {
  searchParams: { orderId?: string };
}) {
  const orderId = searchParams.orderId || "123456789"; // Fallback for demo

  return (
    <div className="container max-w-4xl py-12">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Thank you for your order!</h1>
        <p className="text-gray-600 text-lg">
          Your order has been successfully placed.
        </p>
      </div>

      <div className="bg-white rounded-lg border shadow-sm p-8 mb-8">
        <div className="flex flex-col md:flex-row justify-between border-b pb-6 mb-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Order Details</h2>
            <p className="text-gray-600">Order #{orderId}</p>
            <p className="text-gray-600">
              Date: {new Date().toLocaleDateString()}
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-md inline-block">
              <p className="font-medium">Order Status: Processing</p>
            </div>
          </div>
        </div>

        <p className="mb-6">
          We have sent a confirmation email with order details to your email
          address. You can also view your order in your account dashboard.
        </p>

        <h3 className="font-semibold mb-2">What happens next?</h3>
        <ul className="space-y-2 mb-6 list-disc list-inside">
          <li>Your order is being prepared for shipment</li>
          <li>You'll receive an email when your order ships</li>
          <li>
            You can track your order status in your{" "}
            <Link
              href="/account/orders"
              className="text-primary underline">
              order history
            </Link>
          </li>
        </ul>

        <p className="text-gray-600 mb-6">
          If you have any questions about your order, please contact our
          customer service team at{" "}
          <a
            href="mailto:support@nextcommerce.com"
            className="text-primary underline">
            support@nextcommerce.com
          </a>
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Button
            asChild
            className="flex items-center gap-2">
            <Link href="/products">
              <ShoppingBag className="h-4 w-4" />
              Continue Shopping
            </Link>
          </Button>
          <Button
            asChild
            variant="outline">
            <Link href="/account/orders">View My Orders</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
