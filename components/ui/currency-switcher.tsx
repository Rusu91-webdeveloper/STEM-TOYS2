"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Coins } from "lucide-react";
import { currencies, useCurrency } from "@/lib/currency";

export function CurrencySwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const { currency, setCurrency } = useCurrency();

  const switchCurrency = (currencyCode: string) => {
    // Update the currency in the context
    setCurrency(currencyCode);

    // Check if we're on a protected route like checkout
    const isProtectedRoute = pathname.startsWith("/checkout");

    // For protected routes, use a smoother approach without a full refresh
    if (isProtectedRoute) {
      // Just update the local state without triggering a navigation
      // The currency context will update the UI
      return;
    }

    // For other routes, refresh the page to apply currency changes globally
    router.refresh();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1.5 h-9 px-3 bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700 hover:border-indigo-700 shadow-sm transition-all">
          <Coins className="h-4 w-4" />
          <span className="hidden md:inline-block text-xs font-medium">
            {currency.code}
          </span>
          <span className="inline-block md:hidden text-xs">
            {currency.code}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-40 bg-white border border-gray-200 shadow-lg rounded-md p-1">
        {currencies.map((curr) => (
          <DropdownMenuItem
            key={curr.code}
            onClick={() => switchCurrency(curr.code)}
            className={`cursor-pointer rounded-sm px-2 py-1.5 text-sm ${
              currency.code === curr.code
                ? "font-medium bg-indigo-50 text-indigo-700"
                : "text-gray-700 hover:bg-gray-50"
            } transition-colors`}>
            <span className="mr-2 font-medium">{curr.code}</span>
            <span className="text-gray-500">({curr.symbol})</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
