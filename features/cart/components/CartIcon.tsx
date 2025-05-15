"use client";

import React from "react";
import { ShoppingCart } from "lucide-react";
import { useShoppingCart } from "../hooks/useShoppingCart";

interface CartIconProps {
  className?: string;
}

export function CartIcon({ className = "" }: CartIconProps) {
  const { getCount } = useShoppingCart();
  const itemCount = getCount();

  return (
    <div className={`relative ${className}`}>
      <ShoppingCart className="h-6 w-6" />
      {itemCount > 0 && (
        <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </div>
  );
}
