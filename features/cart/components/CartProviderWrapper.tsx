"use client";

import React, { ReactNode } from "react";
import { CartProvider } from "../context/CartContext";
import { SessionProvider } from "next-auth/react";

interface CartProviderWrapperProps {
  children: ReactNode;
}

/**
 * Component to wrap the application with CartProvider
 * Add this to your root layout to make the cart available throughout the app
 */
export function CartProviderWrapper({ children }: CartProviderWrapperProps) {
  return (
    <SessionProvider>
      <CartProvider>{children}</CartProvider>
    </SessionProvider>
  );
}
