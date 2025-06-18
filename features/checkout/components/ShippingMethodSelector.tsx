"use client";

import React, { useState, useEffect } from "react";
import { ShippingMethod } from "../types";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useCurrency } from "@/lib/currency";
import { useTranslation } from "@/lib/i18n";
import { fetchShippingSettings } from "../lib/checkoutApi";
import { Loader2 } from "lucide-react";

interface ShippingMethodSelectorProps {
  initialMethod?: ShippingMethod;
  onSubmit: (method: ShippingMethod) => void;
  onBack: () => void;
}

export function ShippingMethodSelector({
  initialMethod,
  onSubmit,
  onBack,
}: ShippingMethodSelectorProps) {
  const [selectedMethodId, setSelectedMethodId] = useState<string>(
    initialMethod?.id || "standard"
  );
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { formatPrice } = useCurrency();
  const { t } = useTranslation();

  // Fetch shipping settings from the database
  useEffect(() => {
    async function loadShippingSettings() {
      try {
        const settings = await fetchShippingSettings();

        // Create shipping methods array from settings
        const methods: ShippingMethod[] = [];

        // Add standard shipping if active
        if (settings.standard && settings.standard.active) {
          methods.push({
            id: "standard",
            name: t("standardShipping", "Standard Shipping"),
            description: t("deliveryIn35Days", "Delivery in 3-5 business days"),
            price: parseFloat(settings.standard.price),
            estimatedDelivery: t("businessDays35", "3-5 business days"),
          });
        }

        // Add express shipping if active
        if (settings.express && settings.express.active) {
          methods.push({
            id: "express",
            name: t("expressShipping", "Express Shipping"),
            description: t("deliveryIn12Days", "Delivery in 1-2 business days"),
            price: parseFloat(settings.express.price),
            estimatedDelivery: t("businessDays12", "1-2 business days"),
          });
        }

        // Add priority shipping (hardcoded for now)
        methods.push({
          id: "priority",
          name: t("priorityShipping", "Priority Shipping"),
          description: t("deliveryIn24Hours", "Delivery in 24 hours"),
          price: 19.99,
          estimatedDelivery: t("hours24", "24 hours"),
        });

        setShippingMethods(methods);

        // If the previously selected method is no longer available, select the first available method
        if (
          methods.length > 0 &&
          !methods.some((m) => m.id === selectedMethodId)
        ) {
          setSelectedMethodId(methods[0].id);
        }
      } catch (error) {
        console.error("Error loading shipping settings:", error);
        // Fallback to default methods
        setShippingMethods([
          {
            id: "standard",
            name: t("standardShipping", "Standard Shipping"),
            description: t("deliveryIn35Days", "Delivery in 3-5 business days"),
            price: 5.99,
            estimatedDelivery: t("businessDays35", "3-5 business days"),
          },
          {
            id: "express",
            name: t("expressShipping", "Express Shipping"),
            description: t("deliveryIn12Days", "Delivery in 1-2 business days"),
            price: 12.99,
            estimatedDelivery: t("businessDays12", "1-2 business days"),
          },
          {
            id: "priority",
            name: t("priorityShipping", "Priority Shipping"),
            description: t("deliveryIn24Hours", "Delivery in 24 hours"),
            price: 19.99,
            estimatedDelivery: t("hours24", "24 hours"),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    }

    loadShippingSettings();
  }, [t, selectedMethodId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedMethod = shippingMethods.find(
      (method) => method.id === selectedMethodId
    );
    if (selectedMethod) {
      onSubmit(selectedMethod);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        <p className="ml-2 text-indigo-600">
          {t("loadingShippingOptions", "Loading shipping options...")}
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6">
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-xl font-semibold mb-4">
          {t("shippingMethod", "Shipping Method")}
        </h2>

        {shippingMethods.length > 0 ? (
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
                    <span className="font-medium text-indigo-700">
                      {formatPrice(method.price)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{method.description}</p>
                  <p className="text-sm text-gray-500">
                    {t("estimatedDelivery", "Estimated delivery")}:{" "}
                    {method.estimatedDelivery}
                  </p>
                </div>
              </div>
            ))}
          </RadioGroup>
        ) : (
          <p className="text-center text-gray-500 py-4">
            {t(
              "noShippingMethodsAvailable",
              "No shipping methods are currently available."
            )}
          </p>
        )}
      </div>

      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}>
          {t("backToShippingAddress", "Back to Shipping Address")}
        </Button>
        <Button
          type="submit"
          disabled={shippingMethods.length === 0}>
          {t("continueToPayment", "Continue to Payment")}
        </Button>
      </div>
    </form>
  );
}
