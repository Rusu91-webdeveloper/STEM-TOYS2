"use client";

import React from "react";
import { useCart } from "@/features/cart";

interface CheckoutSummaryProps {
  shippingCost?: number;
}

export function CheckoutSummary({ shippingCost = 0 }: CheckoutSummaryProps) {
  const { cartItems, getCartTotal, isLoading } = useCart();

  const subtotal = getCartTotal();
  const tax = subtotal * 0.1; // 10% tax for example
  const total = subtotal + tax + shippingCost;

  if (isLoading) {
    return (
      <div className="border rounded-lg p-6 space-y-4 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/2"></div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex gap-4">
              <div className="h-16 w-16 bg-gray-200 rounded"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-2 pt-4 border-t">
          <div className="flex justify-between">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
          <div className="flex justify-between">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
          <div className="flex justify-between">
            <div className="h-5 bg-gray-200 rounded w-1/3"></div>
            <div className="h-5 bg-gray-200 rounded w-1/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
        <p className="text-gray-500">Your cart is empty</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-6 space-y-4 sticky top-4">
      <h2 className="text-xl font-semibold">Order Summary</h2>

      <div className="space-y-4 max-h-80 overflow-y-auto">
        {cartItems.map((item) => (
          <div
            key={item.id}
            className="flex gap-4">
            {item.image ? (
              <img
                src={item.image}
                alt={item.name}
                className="h-16 w-16 object-cover rounded"
              />
            ) : (
              <div className="h-16 w-16 bg-gray-200 rounded"></div>
            )}
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
              <p className="text-sm">${item.price.toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2 pt-4 border-t">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Tax (10%)</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Shipping</span>
          <span>${shippingCost.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-semibold text-lg pt-2 border-t">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
