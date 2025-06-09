"use client";

import React from "react";
import { CheckoutData, CheckoutStep } from "../types";
import { Button } from "@/components/ui/button";
import { useCart } from "@/features/cart";
import { Edit, AlertCircle } from "lucide-react";
import { useCurrency } from "@/lib/currency";
import { CheckoutSummary } from "./CheckoutSummary";

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
  const { getCartTotal } = useCart();
  const { formatPrice } = useCurrency();

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
            Te rugăm să verifici comanda înainte de a o plasa.
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
              Editează
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
            <p className="text-red-500">
              Nu a fost furnizată o adresă de livrare
            </p>
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
              Editează
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
                {formatPrice(checkoutData.shippingMethod.price)}
              </p>
            </div>
          ) : (
            <p className="text-red-500">
              Nu a fost selectată o metodă de livrare
            </p>
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
              Editează
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
            <p className="text-red-500">
              Nu au fost furnizate detalii de plată
            </p>
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
              Editează
            </Button>
          </div>

          {checkoutData.billingAddressSameAsShipping ? (
            <p className="text-sm">Aceeași cu adresa de livrare</p>
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
            <p className="text-red-500">
              Nu a fost furnizată o adresă de facturare
            </p>
          )}
        </div>
      </div>

      {/* Order Summary - Using the CheckoutSummary component */}
      <CheckoutSummary shippingCost={shippingCost} />

      {/* Error Message */}
      {orderError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-red-800">
              Eroare la plasarea comenzii
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
          type="button"
          className="bg-indigo-600 hover:bg-indigo-700"
          onClick={onPlaceOrder}
          disabled={isProcessingOrder}>
          {isProcessingOrder ? "Processing..." : "Place Order"}
        </Button>
      </div>
    </div>
  );
}
