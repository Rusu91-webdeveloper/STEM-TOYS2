"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  fetchCart,
  saveCart,
  updateCartItemQuantity,
  removeCartItem,
  addItemToCart,
} from "../lib/cartApi";
import { mergeCarts, needsMerging } from "../lib/cartMerge";
import { useSession } from "next-auth/react";

// Define a specific type for CartItem based on our product structure
export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, "id">, quantity?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getItemCount: () => number;
  isLoading: boolean;
  syncWithServer: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

// Helper function to create a unique ID for cart items
const getCartItemId = (productId: string, variantId?: string) => {
  return `${productId}${variantId ? `_${variantId}` : ""}`;
};

export const CartProvider = ({ children }: CartProviderProps) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const previousAuthState = React.useRef(isAuthenticated);
  const initialLoadComplete = React.useRef(false);
  const serverFetchTimeout = React.useRef<NodeJS.Timeout | null>(null);

  // Load cart from localStorage immediately for better UX
  useEffect(() => {
    // Only load from localStorage on first render
    if (!initialLoadComplete.current && typeof window !== "undefined") {
      const storedCart = localStorage.getItem("nextcommerce_cart");
      if (storedCart) {
        try {
          const localCart = JSON.parse(storedCart);
          setCartItems(localCart);
        } catch (error) {
          console.error("Failed to parse cart from localStorage:", error);
          localStorage.removeItem("nextcommerce_cart");
        }
      }
      // Mark initial load as complete to prevent reloading from localStorage
      initialLoadComplete.current = true;
    }
  }, []);

  // Effect to handle auth state changes and cart merging
  useEffect(() => {
    // Skip if auth is still loading
    if (status === "loading") return;

    const handleAuthStateChange = async () => {
      try {
        // Check if auth state has changed
        if (previousAuthState.current !== isAuthenticated) {
          previousAuthState.current = isAuthenticated;

          if (isAuthenticated) {
            // User has logged in, we need to merge the carts
            // Don't block UI while merging, do it in background
            mergeCartsOnLogin().catch((error) => {
              console.error("Error merging carts on login:", error);
            });
          }
        } else if (isAuthenticated && initialLoadComplete.current) {
          // Fetch from server in the background, without blocking the UI
          fetchCartFromServer(false).catch((error) => {
            console.error("Error fetching cart from server:", error);
          });
        }
      } catch (error) {
        console.error("Error in auth state change handler:", error);
      }
    };

    // Start server fetch with a small delay to improve perceived performance
    if (serverFetchTimeout.current) {
      clearTimeout(serverFetchTimeout.current);
    }

    serverFetchTimeout.current = setTimeout(() => {
      handleAuthStateChange();
    }, 100); // Small delay to prioritize UI responsiveness

    return () => {
      // Clear timeout on cleanup
      if (serverFetchTimeout.current) {
        clearTimeout(serverFetchTimeout.current);
      }
    };
  }, [isAuthenticated, status]);

  // Function to merge local cart with server cart on login
  const mergeCartsOnLogin = async () => {
    if (!isAuthenticated) return;

    try {
      // Set loading state only if cart is empty
      if (cartItems.length === 0) {
        setIsLoading(true);
      }

      // Fetch server cart
      const serverCart = await fetchCart();

      // Check if carts need merging
      if (needsMerging(cartItems, serverCart)) {
        // Merge carts and update both local state and server
        const mergedCart = mergeCarts(cartItems, serverCart);
        setCartItems(mergedCart);
        await saveCart(mergedCart);
      } else if (serverCart.length > 0) {
        // If server cart exists but no merging needed, use server cart
        setCartItems(serverCart);
      }

      // Update localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "nextcommerce_cart",
          JSON.stringify(serverCart.length > 0 ? serverCart : cartItems)
        );
      }
    } catch (error) {
      console.error("Failed to merge carts on login:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch cart from server
  const fetchCartFromServer = async (setLoadingState = true) => {
    if (setLoadingState) {
      setIsLoading(true);
    }

    try {
      // Add timeout to prevent long-running requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5-second timeout

      const serverCart = await fetchCart();
      clearTimeout(timeoutId);

      // If server has items, use them
      if (serverCart.length > 0) {
        setCartItems(serverCart);

        // Update localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem("nextcommerce_cart", JSON.stringify(serverCart));
        }
      } else if (cartItems.length > 0) {
        // If local cart has items but server doesn't, sync to server
        await saveCart(cartItems);
      }
    } catch (error) {
      console.error("Failed to fetch cart from server:", error);
      // If the fetch fails, we still have the localStorage cart
      throw error;
    } finally {
      if (setLoadingState) {
        setIsLoading(false);
      }
    }
  };

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (
      initialLoadComplete.current &&
      !isLoading &&
      typeof window !== "undefined" &&
      (cartItems.length > 0 || localStorage.getItem("nextcommerce_cart"))
    ) {
      localStorage.setItem("nextcommerce_cart", JSON.stringify(cartItems));
    }
  }, [cartItems, isLoading]);

  // Sync cart with server
  const syncWithServer = async () => {
    if (cartItems.length > 0) {
      try {
        await saveCart(cartItems);
      } catch (error) {
        console.error("Failed to sync cart with server:", error);
      }
    }
  };

  const addToCart = async (
    itemToAdd: Omit<CartItem, "id">,
    quantity: number = 1
  ) => {
    const cartItemId = getCartItemId(itemToAdd.productId, itemToAdd.variantId);

    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === cartItemId);
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === cartItemId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prevItems, { ...itemToAdd, id: cartItemId, quantity }];
      }
    });

    // Try to sync with server in the background
    try {
      if (itemToAdd.variantId) {
        // For items with variants, handle the server update asynchronously
        const existingItem = cartItems.find((item) => item.id === cartItemId);
        if (existingItem) {
          await updateCartItemQuantity(
            cartItemId,
            existingItem.quantity + quantity
          );
        } else {
          await addItemToCart(itemToAdd);
        }
      }
    } catch (error) {
      console.error("Failed to sync item addition with server:", error);
    }
  };

  const removeFromCart = async (itemId: string) => {
    // First update the UI immediately
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== itemId));

    // Then try to sync with server in the background
    try {
      const success = await removeCartItem(itemId);
      if (!success) {
        console.warn(
          `Failed to remove item ${itemId} from server, but removed from UI`
        );
      }
    } catch (error) {
      console.error("Error removing item from cart:", error);
      // Don't revert the UI, just log the error
      // The item will be removed from the UI regardless of server success
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    // First update the UI immediately
    setCartItems(
      (prevItems) =>
        prevItems
          .map(
            (item) =>
              item.id === itemId
                ? { ...item, quantity: Math.max(0, quantity) }
                : item // Prevent negative quantity
          )
          .filter((item) => item.quantity > 0) // Remove item if quantity is 0
    );

    // Then try to sync with server in the background
    if (quantity > 0) {
      try {
        const success = await updateCartItemQuantity(itemId, quantity);
        if (!success) {
          console.warn(
            `Failed to update quantity for item ${itemId}, but UI is updated`
          );
        }
      } catch (error) {
        console.error("Error updating item quantity:", error);
        // Don't revert the UI, just log the error - this prevents a poor user experience
        // The next time the cart is loaded, it will sync with the server
      }
    } else {
      try {
        const success = await removeCartItem(itemId);
        if (!success) {
          console.warn(
            `Failed to remove item ${itemId} from server, but removed from UI`
          );
        }
      } catch (error) {
        console.error("Error removing item from cart:", error);
        // Don't revert the UI, just log the error
      }
    }
  };

  const clearCart = async () => {
    setCartItems([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem("nextcommerce_cart");
    }

    // Try to sync with server in the background
    try {
      await saveCart([]);
    } catch (error) {
      console.error("Failed to clear cart on server:", error);
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const getItemCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getItemCount,
        isLoading,
        syncWithServer,
      }}>
      {children}
    </CartContext.Provider>
  );
};
