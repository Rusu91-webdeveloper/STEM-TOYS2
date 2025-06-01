"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ShoppingCart, X, Trash2, Plus, Minus, Loader2 } from "lucide-react";
import { useShoppingCart } from "../hooks/useShoppingCart";
import { useSession } from "next-auth/react";
import { useCheckoutTransition } from "../context/CheckoutTransitionContext";
import { useCurrency } from "@/lib/currency";

interface MiniCartProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MiniCart({ isOpen, onClose }: MiniCartProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { startTransition } = useCheckoutTransition();
  const {
    items,
    getTotal,
    updateItemQuantity,
    removeItem,
    isEmpty,
    clearCart,
    isLoading,
    syncWithServer,
  } = useShoppingCart();
  const { formatPrice } = useCurrency();

  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [checkoutStatus, setCheckoutStatus] = useState<string>("idle");

  if (!isOpen) {
    return null;
  }

  const handleCheckout = () => {
    // Close the cart immediately before starting the transition
    onClose();

    // Then initiate checkout
    setIsCheckoutLoading(true);
    setCheckoutStatus("processing");

    // Sync cart with server first
    syncWithServer();

    // First wait to ensure session is fully loaded
    if (status === "loading") {
      console.log("Session status is loading, waiting...");
      const checkInterval = setInterval(() => {
        if (status !== "loading") {
          clearInterval(checkInterval);
          // Now we have the final authentication status
          proceedWithCheckout();
        }
      }, 100);
    } else {
      // Session is already loaded, proceed directly
      proceedWithCheckout();
    }
  };

  // Separate function to handle checkout after session is loaded
  const proceedWithCheckout = () => {
    try {
      // Check if the user is authenticated
      if (status === "authenticated") {
        // User is logged in, create a transition to checkout
        console.log("User is authenticated, proceeding to checkout");
        setCheckoutStatus("redirecting");
        startTransition("checkout");
      } else {
        // User is not logged in, create a transition to login
        console.log("User is not authenticated, redirecting to login");
        setCheckoutStatus("auth_required");

        // Make sure we get the current origin for correct port
        const origin = window.location.origin;
        console.log("Current origin:", origin);

        startTransition("login", "/checkout");
      }
    } catch (error) {
      console.error("Error during checkout transition:", error);
      // Fallback to direct navigation with correct origin
      const origin = window.location.origin;
      window.location.href =
        status === "authenticated"
          ? `${origin}/checkout`
          : `${origin}/auth/login?callbackUrl=${encodeURIComponent("/checkout")}`;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Cart panel */}
      <div className="relative w-full max-w-md bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 p-6 shadow-xl overflow-y-auto animate-in slide-in-from-right-1/2 duration-300">
        <div className="flex items-center justify-between mb-6 border-b pb-4 border-indigo-200">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-indigo-900">
            <ShoppingCart className="h-5 w-5 text-indigo-700" />
            Your Cart
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-white/50 transition-colors text-indigo-700 hover:text-indigo-900"
            aria-label="Close cart">
            <X className="h-5 w-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-700 mb-4" />
            <p className="text-indigo-700">Loading your cart...</p>
          </div>
        ) : isEmpty ? (
          <div className="py-12 text-center">
            <p className="text-indigo-700 mb-6">Your cart is empty</p>
            <Link
              href="/products"
              className="inline-block rounded-md bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 px-6 py-2 text-white hover:from-indigo-700 hover:to-purple-800 shadow-md hover:shadow-lg transition-all"
              onClick={onClose}>
              Continue Shopping
            </Link>
          </div>
        ) : (
          <>
            <ul className="divide-y divide-indigo-100">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="py-4 flex gap-4">
                  {item.image ? (
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-indigo-100 shadow-sm">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover object-center"
                      />
                    </div>
                  ) : (
                    <div className="h-16 w-16 flex-shrink-0 rounded-md border border-indigo-100 bg-white flex items-center justify-center shadow-sm">
                      <ShoppingCart className="h-8 w-8 text-indigo-300" />
                    </div>
                  )}

                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between text-base font-medium">
                      <h3 className="text-indigo-900">{item.name}</h3>
                      <p className="ml-4 text-indigo-700 font-bold">
                        {formatPrice(item.price)}
                      </p>
                    </div>

                    <div className="mt-1 flex items-center justify-between">
                      <div className="flex items-center border rounded-md bg-white border-indigo-100 shadow-sm">
                        <button
                          onClick={() =>
                            updateItemQuantity(item.id, item.quantity - 1)
                          }
                          className="p-1.5 hover:bg-indigo-50 transition-colors rounded-l-md text-indigo-700"
                          aria-label={`Decrease quantity of ${item.name}`}>
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="px-3 py-1 text-sm font-medium text-indigo-900 border-x border-indigo-100 bg-indigo-50">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateItemQuantity(item.id, item.quantity + 1)
                          }
                          className="p-1.5 hover:bg-indigo-50 transition-colors rounded-r-md text-indigo-700"
                          aria-label={`Increase quantity of ${item.name}`}>
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-indigo-400 hover:text-red-500 transition-colors p-1.5 rounded-full hover:bg-white"
                        aria-label={`Remove ${item.name} from cart`}>
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t pt-6 mt-6 border-indigo-200">
              <div className="flex justify-between text-base font-medium">
                <p className="text-indigo-900">Subtotal</p>
                <p className="text-indigo-700 font-bold">
                  {formatPrice(getTotal())}
                </p>
              </div>
              <p className="mt-1 text-sm text-indigo-600">
                Shipping and taxes calculated at checkout.
              </p>

              <div className="mt-6 space-y-3">
                <button
                  onClick={handleCheckout}
                  disabled={isCheckoutLoading}
                  className={`flex w-full items-center justify-center rounded-md bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 px-6 py-3 text-base font-medium text-white shadow-md transition-all ${
                    isCheckoutLoading
                      ? "opacity-90 cursor-not-allowed"
                      : "hover:shadow-lg hover:from-indigo-700 hover:to-purple-800"
                  }`}
                  aria-disabled={isCheckoutLoading}>
                  {isCheckoutLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      {checkoutStatus === "processing" && "Processing..."}
                      {checkoutStatus === "redirecting" &&
                        "Going to checkout..."}
                      {checkoutStatus === "auth_required" &&
                        "Taking you to login..."}
                    </>
                  ) : (
                    "Checkout"
                  )}
                </button>

                <button
                  onClick={() => {
                    clearCart();
                    onClose();
                  }}
                  className="flex w-full items-center justify-center rounded-md border border-indigo-300 px-6 py-3 text-base font-medium text-indigo-700 shadow-sm hover:bg-white transition-colors hover:border-indigo-400">
                  Clear Cart
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
