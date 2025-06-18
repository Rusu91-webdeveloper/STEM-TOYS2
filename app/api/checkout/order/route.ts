import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { db } from "@/lib/db";
import type { CartItem } from "@/features/cart/context/CartContext";

// Order validation schema - more lenient version
const shippingAddressSchema = z
  .object({
    fullName: z.string().min(1, "Full name is required"),
    addressLine1: z.string().min(1, "Address line 1 is required"),
    addressLine2: z.string().optional().nullable(),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    postalCode: z.string().min(1, "Postal code is required"),
    country: z.string().min(1, "Country is required"),
    phone: z.string().min(1, "Phone number is required"),
  })
  .passthrough(); // Allow additional fields

const shippingMethodSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().optional(),
    description: z.string().optional(),
    price: z
      .union([z.number(), z.string().transform((val) => parseFloat(val) || 0)])
      .optional(),
  })
  .passthrough();

const paymentDetailsSchema = z
  .object({
    cardNumber: z.string().optional(),
    nameOnCard: z.string().optional(),
    expiryDate: z.string().optional(),
    cvv: z.string().optional(), // Make CVV optional
  })
  .passthrough();

const orderItemSchema = z.object({
  productId: z.string(),
  name: z.string(),
  price: z.number(),
  quantity: z.number().int().positive(),
  isBook: z.boolean().optional(), // Add isBook flag to identify book items
});

// Updated order schema
const orderSchema = z.object({
  shippingAddress: shippingAddressSchema,
  billingAddress: shippingAddressSchema.optional(),
  shippingMethod: shippingMethodSchema.optional(),
  paymentDetails: paymentDetailsSchema.optional(),
  billingAddressSameAsShipping: z.boolean().optional(),
  orderDate: z.string().optional(),
  status: z.string().optional(),
  subtotal: z.number().optional(),
  tax: z.number().optional(),
  shippingCost: z.number().optional(),
  total: z.number().optional(),
  items: z.array(orderItemSchema).optional(),
});

// Helper function to format Zod errors
function formatZodErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.errors) {
    const path = issue.path.join(".");
    errors[path] = issue.message;
  }
  return errors;
}

// POST /api/checkout/order - Create a new order
export async function POST(request: Request) {
  try {
    // Get the user session
    const session = await auth();
    const user = session?.user;

    if (!user || !user.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required",
        },
        { status: 401 }
      );
    }

    // Parse the request body
    let body;
    try {
      body = await request.json();
      // Log the request payload for debugging
      console.log(
        "Processing order with payload:",
        JSON.stringify(body, null, 2)
      );
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      return NextResponse.json(
        {
          success: false,
          message: "Invalid JSON payload",
          error:
            parseError instanceof Error ? parseError.message : "Unknown error",
        },
        { status: 400 }
      );
    }

    // Validate request body
    const orderData = orderSchema.parse(body);

    // Check if Stripe environment variables are set
    const stripePublicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

    if (!stripePublicKey) {
      console.error(
        "Stripe publishable key is not set. Payment processing will fail."
      );

      // In development, return a success response anyway
      if (process.env.NODE_ENV === "development") {
        console.log(
          "Development mode: Creating test order without payment processing"
        );
        const orderId = Math.random()
          .toString(36)
          .substring(2, 12)
          .toUpperCase();
        const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        return NextResponse.json({
          success: true,
          orderId,
          orderNumber,
          message:
            "Development mode: Test order created without payment processing",
        });
      }

      // In production, return an error
      return NextResponse.json(
        {
          success: false,
          message: "Payment configuration error. Please contact support.",
          error: "STRIPE_NOT_CONFIGURED",
        },
        { status: 500 }
      );
    }

    // Use the items provided in the order data if available, otherwise fetch from database
    let items: CartItem[];

    if (orderData.items && orderData.items.length > 0) {
      // Use the items from the request
      items = orderData.items as CartItem[];
    } else {
      // Fetch products from the database as fallback
      const products = await db.product.findMany({
        where: {
          isActive: true,
        },
        take: 3,
        orderBy: {
          createdAt: "desc",
        },
      });

      // Map database products to cart items
      items = products.map((product) => ({
        id: product.id,
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1, // Default quantity
        image:
          product.images && product.images.length > 0
            ? product.images[0]
            : undefined,
      }));
    }

    // Generate order information
    const orderId = Math.random().toString(36).substring(2, 12).toUpperCase();
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Calculate subtotal from cart items if not provided
    const subtotal =
      orderData.subtotal ||
      items.reduce((total, item) => total + item.price * item.quantity, 0);

    // Get initial shipping method cost (default to 0 if not provided)
    let baseShippingCost =
      orderData.shippingCost ||
      (orderData.shippingMethod?.price
        ? parseFloat(orderData.shippingMethod.price.toString())
        : 0);

    // Get tax and shipping settings from the database
    let taxRate = 0.1; // Default tax rate (10%)
    let applyTax = true; // Default to applying tax
    let taxRatePercentage = "10"; // For display purposes
    let freeShippingThreshold = null;
    let isFreeShippingActive = false;

    try {
      const storeSettings = await db.storeSettings.findFirst();

      // Get tax settings
      if (storeSettings?.taxSettings) {
        const taxSettings = storeSettings.taxSettings as any;
        if (taxSettings.rate) {
          // Convert percentage to decimal (e.g., 10% -> 0.10)
          taxRatePercentage = taxSettings.rate; // Keep the percentage for display
          taxRate = parseFloat(taxSettings.rate) / 100;
        }
        // Only apply tax if it's active
        applyTax = taxSettings.active !== false;
      }

      // Get shipping settings for free shipping threshold
      if (storeSettings?.shippingSettings) {
        const shippingSettings = storeSettings.shippingSettings as any;
        if (
          shippingSettings.freeThreshold &&
          shippingSettings.freeThreshold.active
        ) {
          freeShippingThreshold = parseFloat(
            shippingSettings.freeThreshold.price
          );
          isFreeShippingActive = true;
        }
      }
    } catch (error) {
      console.error("Error fetching store settings:", error);
      // Continue with default settings
    }

    // Apply free shipping logic
    let finalShippingCost = baseShippingCost;
    if (
      isFreeShippingActive &&
      freeShippingThreshold !== null &&
      subtotal >= freeShippingThreshold
    ) {
      finalShippingCost = 0;
    }

    // Calculate tax based on settings
    const tax = orderData.tax || (applyTax ? subtotal * taxRate : 0);

    // Calculate total including shipping and tax
    const orderTotal = orderData.total || subtotal + tax + finalShippingCost;

    // Prepare order details for email (includes all calculated values)

    // Save shipping address to database or get existing address
    let shippingAddressId;

    try {
      // Check if user has an existing address with the same details
      const existingAddress = await db.address.findFirst({
        where: {
          userId: user.id,
          fullName: orderData.shippingAddress.fullName,
          addressLine1: orderData.shippingAddress.addressLine1,
          city: orderData.shippingAddress.city,
          postalCode: orderData.shippingAddress.postalCode,
        },
      });

      if (existingAddress) {
        shippingAddressId = existingAddress.id;
      } else {
        // Create new address
        const newAddress = await db.address.create({
          data: {
            userId: user.id,
            name: "Shipping Address", // Default name
            fullName: orderData.shippingAddress.fullName,
            addressLine1: orderData.shippingAddress.addressLine1,
            addressLine2: orderData.shippingAddress.addressLine2 || null,
            city: orderData.shippingAddress.city,
            state: orderData.shippingAddress.state,
            postalCode: orderData.shippingAddress.postalCode,
            country: orderData.shippingAddress.country,
            phone: orderData.shippingAddress.phone,
          },
        });
        shippingAddressId = newAddress.id;
      }
    } catch (dbError) {
      console.error("Failed to create/find shipping address:", dbError);
      // Use a placeholder ID for development
      if (process.env.NODE_ENV === "development") {
        shippingAddressId = "address-placeholder";
      } else {
        throw dbError;
      }
    }

    // Create order and items in a single database transaction
    let dbOrder;
    try {
      console.log(
        `Creating order with ${items.length} items:`,
        items.map((item) => ({
          name: item.name,
          productId: item.productId,
          isBook: item.isBook,
        }))
      );

      dbOrder = await db.$transaction(async (tx) => {
        // First, create the order
        const newOrder = await tx.order.create({
          data: {
            orderNumber,
            userId: user.id,
            total: orderTotal,
            subtotal,
            tax,
            shippingCost: finalShippingCost,
            paymentMethod: "card", // Default payment method
            status: "PROCESSING",
            paymentStatus: "PAID", // In a real app, this would depend on payment processing
            shippingAddressId: shippingAddressId,
          },
        });

        // Then, add items - validate and create each item
        for (const item of items) {
          console.log(
            `Processing item: ${item.name} (ID: ${item.productId}, isBook: ${item.isBook})`
          );

          const isBook = item.isBook === true;
          let productId = item.productId;

          if (isBook) {
            // For books, we need to find or create a valid product ID
            console.log(`Processing book item: ${item.name}`);

            // Try to find an existing product for this book
            const existingProduct = await tx.product.findFirst({
              where: {
                name: item.name,
              },
            });

            if (existingProduct) {
              productId = existingProduct.id;
              console.log(`Found existing product for book: ${productId}`);
            } else {
              // Find or create educational books category
              let categoryId;
              const booksCategory = await tx.category.findFirst({
                where: { slug: "educational-books" },
              });

              if (booksCategory) {
                categoryId = booksCategory.id;
              } else {
                // Create a default category if educational-books doesn't exist
                const defaultCategory = await tx.category.findFirst();
                if (defaultCategory) {
                  categoryId = defaultCategory.id;
                } else {
                  throw new Error(
                    "No categories found in database - cannot create book product"
                  );
                }
              }

              // Create a placeholder product for this book
              const placeholderProduct = await tx.product.create({
                data: {
                  name: item.name,
                  slug: `book-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
                  description: `Book: ${item.name}`,
                  price: item.price,
                  categoryId,
                  images: [],
                  tags: ["book"],
                  isActive: true,
                },
              });
              productId = placeholderProduct.id;
              console.log(`Created placeholder product for book: ${productId}`);
            }
          } else {
            // For regular products, validate the product exists
            const product = await tx.product.findUnique({
              where: { id: item.productId },
              select: { id: true, name: true, isActive: true },
            });

            if (!product) {
              throw new Error(
                `Product with ID ${item.productId} not found in database`
              );
            }

            if (!product.isActive) {
              throw new Error(
                `Product ${product.name} (ID: ${item.productId}) is not active`
              );
            }

            console.log(
              `Validated product: ${product.name} (ID: ${productId})`
            );
          }

          // Create the order item
          const orderItem = await tx.orderItem.create({
            data: {
              orderId: newOrder.id,
              productId: productId,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
            },
          });

          console.log(
            `Created order item: ${orderItem.id} for product ${productId}`
          );
        }

        return newOrder;
      });

      console.log(
        `Successfully created order ${dbOrder.id} with ${items.length} items`
      );
    } catch (dbError) {
      console.error("Failed to create order in database:", dbError);
      console.error("Error details:", {
        message: dbError instanceof Error ? dbError.message : "Unknown error",
        orderData: {
          userId: user.id,
          orderNumber,
          itemCount: items.length,
          items: items.map((item) => ({
            name: item.name,
            productId: item.productId,
            isBook: item.isBook,
          })),
        },
      });

      // Always throw the error - don't swallow it in development
      throw new Error(
        `Order creation failed: ${dbError instanceof Error ? dbError.message : "Unknown database error"}`
      );
    }

    // Send order confirmation email
    try {
      const orderDetails = {
        id: dbOrder?.id || orderId,
        items: items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        subtotal: subtotal,
        tax: tax,
        shippingCost: finalShippingCost,
        total: orderTotal,
        shippingAddress: orderData.shippingAddress,
        shippingMethod: orderData.shippingMethod,
        orderDate: orderData.orderDate || new Date().toISOString(),
        taxRatePercentage: taxRatePercentage,
        isFreeShippingActive: isFreeShippingActive,
        freeShippingThreshold: freeShippingThreshold,
      };

      await sendEmail({
        to: user.email as string,
        subject: "Confirmare comandă TeechTots #" + (dbOrder?.id || orderId),
        template: "order-confirmation",
        data: {
          order: orderDetails,
        },
      });

      console.log(`Order confirmation email sent to ${user.email}`);
    } catch (emailError) {
      // Log error but don't fail the order process
      console.error("Failed to send order confirmation email:", emailError);
    }

    return NextResponse.json({
      success: true,
      orderId: dbOrder?.id || orderId,
      orderNumber: dbOrder?.orderNumber || orderNumber,
      message: "Order created successfully",
    });
  } catch (error) {
    console.error("Failed to create order:", error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      const formattedErrors = formatZodErrors(error);

      // Log the validation errors for debugging
      console.error(
        "Validation errors:",
        JSON.stringify(formattedErrors, null, 2)
      );
      console.error("Validation error details:", error.errors);

      return NextResponse.json(
        {
          success: false,
          message: "Invalid order data",
          error: formattedErrors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create order",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
