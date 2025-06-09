"use client";

import React, { useEffect, useState } from "react";
import { CheckoutFlow } from "@/features/checkout/components/CheckoutFlow";
import { Loader2 } from "lucide-react";

export function CheckoutContent() {
  const [isLoading, setIsLoading] = useState(true);

  // Simulate a small delay to show the loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="container py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">Finalizare comandă</h1>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600 mb-4" />
          <p className="text-indigo-600 text-lg font-medium">
            Se încarcă finalizarea comenzii...
          </p>
        </div>
      ) : (
        <CheckoutFlow />
      )}
    </div>
  );
}
