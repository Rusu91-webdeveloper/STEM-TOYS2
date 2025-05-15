"use client";

import React from "react";
import { CheckoutData, CheckoutStep } from "../types";
import { Button } from "@/components/ui/button";
import { useCart } from "@/features/cart/context/CartContext";
import { Edit, AlertCircle } from "lucide-react";

interface OrderReviewProps {
  checkoutData: CheckoutData;
  onEditStep: (step: CheckoutStep) => void;
  onBack: () => void;
  onPlaceOrder: () => void;
  isProcessingOrder?: boolean;
  orderError?: string | null;
}

export function OrderReview({
  checkoutData,
  onEditStep,
  onBack,
  onPlaceOrder,
  isProcessingOrder = false,
  orderError = null,
}: OrderReviewProps) {
  const { cartItems, getCartTotal } = useCart();

  // Calculate totals
  const subtotal = getCartTotal();
  const shippingCost = checkoutData.shippingMethod?.price || 0;
  const tax = subtotal * 0.1; // 10% tax for example
  const total = subtotal + tax + shippingCost;

  // Format a credit card number for display
  const formatCreditCard = (cardNumber: string) => {
    const last4 = cardNumber.slice(-4);
    return `•••• •••• •••• ${last4}`;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Order Review</h2>
          <p className="text-sm text-gray-500">
            Please review your order before placing it.
          </p>
        </div>

        {/* Shipping Address */}
        <div className="border-b pb-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium">Shipping Address</h3>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-primary"
              onClick={() => onEditStep("shipping-address")}>
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </div>

          {checkoutData.shippingAddress ? (
            <div className="text-sm">
              <p>{checkoutData.shippingAddress.fullName}</p>
              <p>{checkoutData.shippingAddress.addressLine1}</p>
              {checkoutData.shippingAddress.addressLine2 && (
                <p>{checkoutData.shippingAddress.addressLine2}</p>
              )}
              <p>
                {checkoutData.shippingAddress.city},{" "}
                {checkoutData.shippingAddress.state}{" "}
                {checkoutData.shippingAddress.postalCode}
              </p>
              <p>{checkoutData.shippingAddress.country}</p>
              <p>{checkoutData.shippingAddress.phone}</p>
            </div>
          ) : (
            <p className="text-red-500">No shipping address provided</p>
          )}
        </div>

        {/* Shipping Method */}
        <div className="border-b pb-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium">Shipping Method</h3>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-primary"
              onClick={() => onEditStep("shipping-method")}>
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </div>

          {checkoutData.shippingMethod ? (
            <div className="text-sm">
              <p className="font-medium">{checkoutData.shippingMethod.name}</p>
              <p>{checkoutData.shippingMethod.description}</p>
              <p>
                Estimated delivery:{" "}
                {checkoutData.shippingMethod.estimatedDelivery}
              </p>
              <p className="font-medium">
                ${checkoutData.shippingMethod.price.toFixed(2)}
              </p>
            </div>
          ) : (
            <p className="text-red-500">No shipping method selected</p>
          )}
        </div>

        {/* Payment Method */}
        <div className="border-b pb-4 mb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium">Payment Method</h3>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-primary"
              onClick={() => onEditStep("payment")}>
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </div>

          {checkoutData.paymentDetails ? (
            <div className="text-sm">
              <p>
                Credit Card:{" "}
                {formatCreditCard(checkoutData.paymentDetails.cardNumber)}
              </p>
              <p>Name on card: {checkoutData.paymentDetails.cardholderName}</p>
              <p>Expires: {checkoutData.paymentDetails.expiryDate}</p>
            </div>
          ) : (
            <p className="text-red-500">No payment details provided</p>
          )}
        </div>

        {/* Billing Address */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium">Billing Address</h3>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-primary"
              onClick={() => onEditStep("payment")}>
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </div>

          {checkoutData.billingAddressSameAsShipping ? (
            <p className="text-sm">Same as shipping address</p>
          ) : checkoutData.billingAddress ? (
            <div className="text-sm">
              <p>{checkoutData.billingAddress.fullName}</p>
              <p>{checkoutData.billingAddress.addressLine1}</p>
              {checkoutData.billingAddress.addressLine2 && (
                <p>{checkoutData.billingAddress.addressLine2}</p>
              )}
              <p>
                {checkoutData.billingAddress.city},{" "}
                {checkoutData.billingAddress.state}{" "}
                {checkoutData.billingAddress.postalCode}
              </p>
              <p>{checkoutData.billingAddress.country}</p>
              <p>{checkoutData.billingAddress.phone}</p>
            </div>
          ) : (
            <p className="text-red-500">No billing address provided</p>
          )}
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

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

        <div className="space-y-2 pt-4 mt-4 border-t">
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

      {/* Error Message */}
      {orderError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-red-800">
              Error placing order
            </h3>
            <p className="text-sm text-red-700 mt-1">{orderError}</p>
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isProcessingOrder}>
          Back to Payment
        </Button>
        <Button
          onClick={onPlaceOrder}
          disabled={isProcessingOrder}
          className="bg-green-600 hover:bg-green-700">
          {isProcessingOrder ? "Processing..." : "Place Order"}
        </Button>
      </div>
    </div>
  );
}
