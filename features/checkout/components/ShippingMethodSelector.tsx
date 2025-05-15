"use client";

import React, { useState } from "react";
import { ShippingMethod } from "../types";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface ShippingMethodSelectorProps {
  initialMethod?: ShippingMethod;
  onSubmit: (method: ShippingMethod) => void;
  onBack: () => void;
}

// Sample shipping method data - in a real app, this would come from an API
const shippingMethods: ShippingMethod[] = [
  {
    id: "standard",
    name: "Standard Shipping",
    description: "Delivery in 3-5 business days",
    price: 5.99,
    estimatedDelivery: "3-5 business days",
  },
  {
    id: "express",
    name: "Express Shipping",
    description: "Delivery in 1-2 business days",
    price: 12.99,
    estimatedDelivery: "1-2 business days",
  },
  {
    id: "priority",
    name: "Priority Shipping",
    description: "Delivery in 24 hours",
    price: 19.99,
    estimatedDelivery: "24 hours",
  },
];

export function ShippingMethodSelector({
  initialMethod,
  onSubmit,
  onBack,
}: ShippingMethodSelectorProps) {
  const [selectedMethodId, setSelectedMethodId] = useState<string>(
    initialMethod?.id || "standard"
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedMethod = shippingMethods.find(
      (method) => method.id === selectedMethodId
    );
    if (selectedMethod) {
      onSubmit(selectedMethod);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6">
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-xl font-semibold mb-4">Shipping Method</h2>

        <RadioGroup
          value={selectedMethodId}
          onValueChange={setSelectedMethodId}
          className="space-y-4">
          {shippingMethods.map((method) => (
            <div
              key={method.id}
              className="flex items-center space-x-2 border p-4 rounded-lg">
              <RadioGroupItem
                value={method.id}
                id={method.id}
              />
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <Label
                    htmlFor={method.id}
                    className="font-medium">
                    {method.name}
                  </Label>
                  <span className="font-semibold">
                    ${method.price.toFixed(2)}
                  </span>
                </div>
                <p className="text-sm text-gray-500">{method.description}</p>
                <p className="text-sm text-gray-500">
                  Estimated delivery: {method.estimatedDelivery}
                </p>
              </div>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}>
          Back to Shipping Address
        </Button>
        <Button type="submit">Continue to Payment</Button>
      </div>
    </form>
  );
}
