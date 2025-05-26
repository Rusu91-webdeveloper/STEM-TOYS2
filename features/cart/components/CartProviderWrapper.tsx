"use client";

import React, { ReactNode, useEffect } from "react";
import { CartProvider } from "../context/CartContext";
import { SessionProvider, useSession } from "next-auth/react";
import { CheckoutTransitionProvider } from "../context/CheckoutTransitionContext";

// Debug component to log authentication state
function AuthDebugger() {
  const { data: session, status } = useSession();

  useEffect(() => {
    // Log authentication state to console
    console.log("AUTH STATE:", {
      status,
      isAuthenticated: status === "authenticated",
      user: session?.user?.email || "none",
      hostname: window.location.hostname,
      port: window.location.port,
      origin: window.location.origin,
    });

    // Also log cookies for debugging
    console.log("COOKIES:", document.cookie);
  }, [session, status]);

  return null; // This component doesn't render anything
}

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
      <CartProvider>
        <CheckoutTransitionProvider>
          <AuthDebugger />
          {children}
        </CheckoutTransitionProvider>
      </CartProvider>
    </SessionProvider>
  );
}
