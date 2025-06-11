"use client";

import React, { useState } from "react";
import { CheckoutStep, CheckoutData } from "../types";
import { ShippingAddressForm } from "./ShippingAddressForm";
import { ShippingMethodSelector } from "./ShippingMethodSelector";
import { PaymentForm } from "./PaymentForm";
import { OrderReview } from "./OrderReview";
import { CheckoutSummary } from "./CheckoutSummary";
import { CheckoutStepper } from "./CheckoutStepper";
import { createOrder } from "../lib/checkoutApi";
import { useRouter } from "next/navigation";
import { useCart } from "@/features/cart";
import { useTranslation } from "@/lib/i18n";

export function CheckoutFlow() {
  const router = useRouter();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] =
    useState<CheckoutStep>("shipping-address");
  const [checkoutData, setCheckoutData] = useState<CheckoutData>({
    billingAddressSameAsShipping: true,
  });
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  const updateCheckoutData = (data: Partial<CheckoutData>) => {
    setCheckoutData((prev) => ({ ...prev, ...data }));
  };

  const goToNextStep = () => {
    if (currentStep === "shipping-address") setCurrentStep("shipping-method");
    else if (currentStep === "shipping-method") setCurrentStep("payment");
    else if (currentStep === "payment") setCurrentStep("review");
  };

  const goToPreviousStep = () => {
    if (currentStep === "shipping-method") setCurrentStep("shipping-address");
    else if (currentStep === "payment") setCurrentStep("shipping-method");
    else if (currentStep === "review") setCurrentStep("payment");
  };

  const goToStep = (step: CheckoutStep) => {
    // Only allow navigating to steps that come before the current step
    // or the next step if the current step is complete
    if (
      step === "shipping-address" ||
      (step === "shipping-method" && checkoutData.shippingAddress) ||
      (step === "payment" &&
        checkoutData.shippingAddress &&
        checkoutData.shippingMethod) ||
      (step === "review" &&
        checkoutData.shippingAddress &&
        checkoutData.shippingMethod &&
        checkoutData.paymentDetails)
    ) {
      setCurrentStep(step);
    }
  };

  const handlePlaceOrder = async () => {
    setIsProcessingOrder(true);
    setOrderError(null);

    try {
      // Calculate amounts
      const subtotal = getCartTotal();
      const vatRate = 0.19; // 19% VAT for Romania
      const tax = subtotal * vatRate;
      const shippingCost = checkoutData.shippingMethod?.price || 0;
      const total = subtotal + tax + shippingCost;

      // Create order data with financial information
      const orderData = {
        ...checkoutData,
        orderDate: new Date().toISOString(),
        status: "pending",
        subtotal,
        tax,
        shippingCost,
        total,
        items: cartItems.map((item) => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
      };

      // Create order in the database
      const result = await createOrder(orderData);

      if (!result) {
        throw new Error(t("failedToCreateOrder", "Failed to create order"));
      }

      // Clear the cart
      clearCart();

      // Redirect to order confirmation page
      router.push(`/checkout/confirmation?orderId=${result.orderId}`);
    } catch (error) {
      setOrderError(
        (error as Error).message ||
          t(
            "orderProcessingError",
            "An error occurred while placing your order"
          )
      );
      setIsProcessingOrder(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-2 space-y-8">
        <CheckoutStepper
          currentStep={currentStep}
          onStepClick={goToStep}
          checkoutData={checkoutData}
        />

        {currentStep === "shipping-address" && (
          <ShippingAddressForm
            initialData={checkoutData.shippingAddress}
            onSubmit={(address) => {
              updateCheckoutData({ shippingAddress: address });
              goToNextStep();
            }}
          />
        )}

        {currentStep === "shipping-method" && (
          <ShippingMethodSelector
            initialMethod={checkoutData.shippingMethod}
            onSubmit={(method) => {
              updateCheckoutData({ shippingMethod: method });
              goToNextStep();
            }}
            onBack={goToPreviousStep}
          />
        )}

        {currentStep === "payment" && (
          <PaymentForm
            initialData={checkoutData.paymentDetails}
            billingAddressSameAsShipping={
              checkoutData.billingAddressSameAsShipping
            }
            shippingAddress={checkoutData.shippingAddress}
            billingAddress={checkoutData.billingAddress}
            onSubmit={(paymentData) => {
              updateCheckoutData(paymentData);
              goToNextStep();
            }}
            onBack={goToPreviousStep}
          />
        )}

        {currentStep === "review" && (
          <OrderReview
            checkoutData={checkoutData}
            onEditStep={goToStep}
            onBack={goToPreviousStep}
            onPlaceOrder={handlePlaceOrder}
            isProcessingOrder={isProcessingOrder}
            orderError={orderError}
          />
        )}
      </div>

      <div className="md:col-span-1">
        <CheckoutSummary
          shippingCost={checkoutData.shippingMethod?.price || 0}
        />
      </div>
    </div>
  );
}
