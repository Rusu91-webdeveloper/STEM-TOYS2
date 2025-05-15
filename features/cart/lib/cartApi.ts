import type { CartItem } from "../context/CartContext";

/**
 * API functions for interacting with the cart backend
 */

/**
 * Fetch the user's cart from the server
 */
export async function fetchCart(): Promise<CartItem[]> {
  try {
    const response = await fetch("/api/cart", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch cart: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Error fetching cart:", error);
    return [];
  }
}

/**
 * Save the entire cart to the server
 */
export async function saveCart(items: CartItem[]): Promise<boolean> {
  try {
    const response = await fetch("/api/cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(items),
    });

    if (!response.ok) {
      throw new Error(`Failed to save cart: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error("Error saving cart:", error);
    return false;
  }
}

/**
 * Add a single item to the cart
 */
export async function addItemToCart(
  item: Omit<CartItem, "id">
): Promise<CartItem | null> {
  try {
    const response = await fetch("/api/cart/items", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(item),
    });

    if (!response.ok) {
      throw new Error(`Failed to add item to cart: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error adding item to cart:", error);
    return null;
  }
}

/**
 * Update the quantity of an item in the cart
 */
export async function updateCartItemQuantity(
  itemId: string,
  quantity: number
): Promise<boolean> {
  try {
    const response = await fetch(`/api/cart/items/${itemId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ quantity }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update item quantity: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error("Error updating item quantity:", error);
    return false;
  }
}

/**
 * Remove an item from the cart
 */
export async function removeCartItem(itemId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/cart/items/${itemId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to remove item from cart: ${response.statusText}`
      );
    }

    return true;
  } catch (error) {
    console.error("Error removing item from cart:", error);
    return false;
  }
}
