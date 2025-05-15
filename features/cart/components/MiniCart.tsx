"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, X, Trash2, Plus, Minus, Loader2 } from "lucide-react";
import { useShoppingCart } from "../hooks/useShoppingCart";

interface MiniCartProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MiniCart({ isOpen, onClose }: MiniCartProps) {
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

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Cart panel */}
      <div className="relative w-full max-w-md bg-background p-6 shadow-xl overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Your Cart
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-muted"
            aria-label="Close cart">
            <X className="h-5 w-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading your cart...</p>
          </div>
        ) : isEmpty ? (
          <div className="py-12 text-center">
            <p className="text-muted-foreground mb-6">Your cart is empty</p>
            <Link
              href="/products"
              className="inline-block rounded-md bg-primary px-6 py-2 text-primary-foreground"
              onClick={onClose}>
              Continue Shopping
            </Link>
          </div>
        ) : (
          <>
            <ul className="divide-y">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="py-4 flex gap-4">
                  {item.image ? (
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover object-center"
                      />
                    </div>
                  ) : (
                    <div className="h-16 w-16 flex-shrink-0 rounded-md border bg-muted flex items-center justify-center">
                      <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}

                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between text-base font-medium">
                      <h3>{item.name}</h3>
                      <p className="ml-4">${item.price.toFixed(2)}</p>
                    </div>

                    <div className="mt-1 flex items-center justify-between">
                      <div className="flex items-center border rounded-md">
                        <button
                          onClick={() =>
                            updateItemQuantity(item.id, item.quantity - 1)
                          }
                          className="p-1 hover:bg-muted"
                          aria-label={`Decrease quantity of ${item.name}`}>
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="px-2 py-1 text-sm">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateItemQuantity(item.id, item.quantity + 1)
                          }
                          className="p-1 hover:bg-muted"
                          aria-label={`Increase quantity of ${item.name}`}>
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-muted-foreground hover:text-destructive"
                        aria-label={`Remove ${item.name} from cart`}>
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t pt-6 mt-6">
              <div className="flex justify-between text-base font-medium">
                <p>Subtotal</p>
                <p>${getTotal().toFixed(2)}</p>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Shipping and taxes calculated at checkout.
              </p>

              <div className="mt-6 space-y-3">
                <Link
                  href="/checkout"
                  className="flex w-full items-center justify-center rounded-md bg-primary px-6 py-3 text-base font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
                  onClick={() => {
                    syncWithServer();
                    onClose();
                  }}>
                  Checkout
                </Link>

                <button
                  onClick={() => {
                    clearCart();
                    onClose();
                  }}
                  className="flex w-full items-center justify-center rounded-md border border-destructive px-6 py-3 text-base font-medium text-destructive shadow-sm hover:bg-destructive hover:text-destructive-foreground">
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
