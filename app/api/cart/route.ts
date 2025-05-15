import { NextResponse } from "next/server";
import { type CartItem } from "@/features/cart";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { cookies } from "next/headers";
import { withRateLimit } from "@/lib/rate-limit";
import { sanitizeInput } from "@/lib/security";
// Mock database for cart storage - replace with Prisma in production
const CART_STORAGE = new Map<string, CartItem[]>();

// Schema for validating incoming cart data
const cartItemSchema = z.object({
  productId: z.string(),
  variantId: z.string().optional(),
  name: z.string(),
  price: z.number().positive(),
  quantity: z.number().int().positive(),
  image: z.string().optional(),
});

const cartSchema = z.array(cartItemSchema);

// Generate a unique guest ID for anonymous users
async function getGuestId(): Promise<string> {
  const cookieStore = await cookies();
  let guestId = cookieStore.get("guest_id")?.value;

  if (!guestId) {
    guestId = `guest_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 9)}`;
    // Note: In an actual implementation, you would use the cookies API to set the cookie
    // but since we're using a mock for demonstration, we'll pretend the cookie is set
  }

  return guestId;
}

// GET /api/cart - Retrieve the user's cart
export const GET = withRateLimit(
  async (request) => {
    try {
      // Check if user is authenticated
      const session = await auth();
      let cartId: string;

      if (session?.user?.email) {
        // User is logged in, use their email as cart ID
        cartId = session.user.email;
      } else {
        // Anonymous user, use guest ID from cookie
        cartId = await getGuestId();
      }

      // Get cart from storage (or return empty array if not found)
      const cart = CART_STORAGE.get(cartId) || [];

      return NextResponse.json({
        success: true,
        message: "Cart fetched successfully",
        data: cart,
        user: session?.user?.email || null,
      });
    } catch (error) {
      console.error("Failed to get cart:", error);
      return NextResponse.json(
        {
          success: false,
          message: "Failed to get cart",
          error: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  },
  {
    limit: 50, // 50 requests
    windowMs: 60000, // per minute
  }
);

// POST /api/cart - Update the user's cart
export const POST = withRateLimit(
  async (request) => {
    try {
      const body = await request.json();

      // Sanitize input (for string values)
      const sanitizedBody = Array.isArray(body)
        ? body.map((item) => ({
            ...item,
            name: item.name ? sanitizeInput(item.name) : item.name,
            image: item.image ? sanitizeInput(item.image) : item.image,
          }))
        : body;

      // Validate the cart data
      const validatedCart = cartSchema.parse(sanitizedBody);

      // Check if user is authenticated
      const session = await auth();
      let cartId: string;

      if (session?.user?.email) {
        // User is logged in, use their email as cart ID
        cartId = session.user.email;
      } else {
        // Anonymous user, use guest ID from cookie
        cartId = await getGuestId();
      }

      // Add IDs to cart items if they don't already have them
      const cartWithIds: CartItem[] = validatedCart.map((item) => {
        // Check if item already has an ID
        if ("id" in item) {
          return item as CartItem;
        }

        // Generate an ID based on product and variant
        const id = item.variantId
          ? `${item.productId}_${item.variantId}`
          : `${item.productId}`;

        return {
          ...item,
          id,
        };
      });

      // Update cart in storage
      CART_STORAGE.set(cartId, cartWithIds);

      return NextResponse.json({
        success: true,
        message: "Cart updated successfully",
        data: cartWithIds,
        user: session?.user?.email || null,
      });
    } catch (error) {
      console.error("Failed to update cart:", error);

      // Handle validation errors
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid cart data",
            error: error.errors,
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: "Failed to update cart",
          error: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  },
  {
    limit: 20, // 20 requests
    windowMs: 60000, // per minute
  }
);
