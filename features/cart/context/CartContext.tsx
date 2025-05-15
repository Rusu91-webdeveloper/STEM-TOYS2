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
  const [isLoading, setIsLoading] = useState(true);
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const previousAuthState = React.useRef(isAuthenticated);

  // Effect to handle auth state changes and cart merging
  useEffect(() => {
    const handleAuthStateChange = async () => {
      // Check if auth state has changed
      if (previousAuthState.current !== isAuthenticated) {
        previousAuthState.current = isAuthenticated;

        if (isAuthenticated) {
          // User has logged in, we need to merge the carts
          await mergeCartsOnLogin();
        }
      }
    };

    handleAuthStateChange();
  }, [isAuthenticated]);

  // Function to merge local cart with server cart on login
  const mergeCartsOnLogin = async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);

    try {
      // Fetch server cart
      const serverCart = await fetchCart();

      // Check if carts need merging
      if (needsMerging(cartItems, serverCart)) {
        // Merge carts and update both local state and server
        const mergedCart = mergeCarts(cartItems, serverCart);
        setCartItems(mergedCart);
        await saveCart(mergedCart);
      }
    } catch (error) {
      console.error("Failed to merge carts on login:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load cart from localStorage and server on initial render
  useEffect(() => {
    const initializeCart = async () => {
      setIsLoading(true);

      // First try to load from localStorage for immediate display
      let localCart: CartItem[] = [];
      if (typeof window !== "undefined") {
        const storedCart = localStorage.getItem("nextcommerce_cart");
        if (storedCart) {
          try {
            localCart = JSON.parse(storedCart);
            setCartItems(localCart);
          } catch (error) {
            console.error("Failed to parse cart from localStorage:", error);
            localStorage.removeItem("nextcommerce_cart");
          }
        }
      }

      // Then try to fetch from the server to get the latest data
      try {
        const serverCart = await fetchCart();

        // If we have server data and it's different from local, use the server data
        if (serverCart.length > 0) {
          // If user is logged in and we have local items, merge the carts
          if (
            isAuthenticated &&
            localCart.length > 0 &&
            needsMerging(localCart, serverCart)
          ) {
            const mergedCart = mergeCarts(localCart, serverCart);
            setCartItems(mergedCart);
            await saveCart(mergedCart);
          } else {
            // Otherwise just use the server cart
            setCartItems(serverCart);
          }

          // Update localStorage with the server data
          if (typeof window !== "undefined") {
            localStorage.setItem(
              "nextcommerce_cart",
              JSON.stringify(serverCart)
            );
          }
        } else if (localCart.length > 0) {
          // If we have local data but no server data, sync the local data to the server
          await saveCart(localCart);
        }
      } catch (error) {
        console.error("Failed to fetch cart from server:", error);
        // Keep using the local cart if available
      }

      setIsLoading(false);
    };

    initializeCart();
  }, [isAuthenticated]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (
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
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== itemId));

    // Try to sync with server in the background
    try {
      await removeCartItem(itemId);
    } catch (error) {
      console.error("Failed to sync item removal with server:", error);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
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

    // Try to sync with server in the background
    if (quantity > 0) {
      try {
        await updateCartItemQuantity(itemId, quantity);
      } catch (error) {
        console.error("Failed to sync quantity update with server:", error);
      }
    } else {
      try {
        await removeCartItem(itemId);
      } catch (error) {
        console.error("Failed to remove item from server cart:", error);
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
