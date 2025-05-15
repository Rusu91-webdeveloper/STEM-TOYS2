"use client";

import React, { useState } from "react";
import { CartIcon } from "./CartIcon";
import { MiniCart } from "./MiniCart";
import { useShoppingCart } from "../hooks/useShoppingCart";
import { Loader2 } from "lucide-react";

interface CartButtonProps {
  className?: string;
}

export function CartButton({ className = "" }: CartButtonProps) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { isLoading } = useShoppingCart();

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  return (
    <>
      <button
        onClick={openCart}
        className={`flex items-center justify-center ${className}`}
        aria-label="Open cart"
        disabled={isLoading}>
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <CartIcon />
        )}
      </button>

      <MiniCart
        isOpen={isCartOpen}
        onClose={closeCart}
      />
    </>
  );
}
