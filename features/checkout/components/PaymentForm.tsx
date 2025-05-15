"use client";

import React, { useState } from "react";
import { PaymentDetails, ShippingAddress } from "../types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ShippingAddressForm } from "./ShippingAddressForm";
import { StripeProvider } from "./StripeProvider";
import { StripePaymentForm } from "./StripePaymentForm";
import { useCart } from "@/features/cart";

interface PaymentFormProps {
  initialData?: PaymentDetails;
  billingAddressSameAsShipping?: boolean;
  shippingAddress?: ShippingAddress;
  billingAddress?: ShippingAddress;
  onSubmit: (data: {
    paymentDetails: PaymentDetails;
    billingAddressSameAsShipping: boolean;
    billingAddress?: ShippingAddress;
  }) => void;
  onBack: () => void;
}

export function PaymentForm({
  initialData,
  billingAddressSameAsShipping = true,
  shippingAddress,
  billingAddress,
  onSubmit,
  onBack,
}: PaymentFormProps) {
  const { getCartTotal } = useCart();
  const [useSameAddress, setUseSameAddress] = useState<boolean>(
    billingAddressSameAsShipping
  );
  const [showBillingForm, setShowBillingForm] = useState<boolean>(
    !billingAddressSameAsShipping
  );
  const [currentBillingAddress, setCurrentBillingAddress] = useState<
    ShippingAddress | undefined
  >(
    billingAddress ||
      (billingAddressSameAsShipping ? shippingAddress : undefined)
  );
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const handleCheckboxChange = (checked: boolean) => {
    setUseSameAddress(checked);
    setShowBillingForm(!checked);

    // If checking the box, use shipping address as billing address
    if (checked && shippingAddress) {
      setCurrentBillingAddress(shippingAddress);
    }
  };

  const handlePaymentSuccess = (paymentDetails: PaymentDetails) => {
    onSubmit({
      paymentDetails,
      billingAddressSameAsShipping: useSameAddress,
      billingAddress: !useSameAddress ? currentBillingAddress : undefined,
    });
  };

  const handlePaymentError = (error: string) => {
    setPaymentError(error);
  };

  // Convert shipping address to Stripe format for billing details
  const getBillingDetails = () => {
    const address = useSameAddress ? shippingAddress : currentBillingAddress;
    if (!address) return undefined;

    return {
      name: address.fullName,
      email: "", // We should have this from the user's account
      address: {
        line1: address.addressLine1,
        line2: address.addressLine2 || "",
        city: address.city,
        state: address.state,
        postal_code: address.postalCode,
        country: address.country,
      },
    };
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-xl font-semibold mb-4">Payment Information</h2>

        <StripeProvider>
          <StripePaymentForm
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentError={handlePaymentError}
            total={getCartTotal()}
            billingDetails={getBillingDetails()}
          />
        </StripeProvider>

        {paymentError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
            {paymentError}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-xl font-semibold mb-4">Billing Address</h2>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="sameAsShipping"
              checked={useSameAddress}
              onCheckedChange={handleCheckboxChange}
            />
            <Label htmlFor="sameAsShipping">Same as shipping address</Label>
          </div>

          {showBillingForm && (
            <div className="mt-4">
              <ShippingAddressForm
                initialData={currentBillingAddress}
                onSubmit={(address) => setCurrentBillingAddress(address)}
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}>
          Back to Shipping Method
        </Button>
      </div>
    </div>
  );
}
