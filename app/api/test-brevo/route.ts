import { NextResponse } from "next/server";
import { emailTemplates } from "@/lib/brevoTemplates";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { Order, Product, User, Address } from "@/app/generated/prisma";

// Email test schema for validation
const emailTestSchema = z.object({
  emailType: z.enum([
    "welcome",
    "verification",
    "passwordReset",
    "orderConfirmation",
    "returnProcessing",
  ]),
  recipient: z.string().email(),
});

export async function POST(request: Request) {
  try {
    // Only allow admin users to test emails
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Only admins can test emails." },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const result = emailTestSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request", details: result.error.format() },
        { status: 400 }
      );
    }

    const { emailType, recipient } = result.data;
    const { prisma } = await import("@/lib/prisma");

    // Create appropriate test data based on email type
    switch (emailType) {
      case "welcome": {
        await emailTemplates.welcome({
          to: recipient,
          name: "Test User",
        });
        break;
      }

      case "verification": {
        await emailTemplates.verification({
          to: recipient,
          name: "Test User",
          verificationLink: "https://example.com/verify?token=test-token",
          expiresIn: "24 hours",
        });
        break;
      }

      case "passwordReset": {
        await emailTemplates.passwordReset({
          to: recipient,
          resetLink: "https://example.com/reset?token=test-token",
          expiresIn: "1 hour",
        });
        break;
      }

      case "orderConfirmation": {
        // Find a real order if possible, otherwise create mock data
        let order = await prisma.order.findFirst({
          include: {
            items: {
              include: {
                product: true,
              },
            },
            user: true,
            shippingAddress: true,
          },
          orderBy: { createdAt: "desc" },
        });

        // If no real order exists, create mock data
        if (!order) {
          // Use type assertion for mock data
          const mockOrder = {
            id: "test_order_id",
            orderNumber: "TEST123456",
            status: "PROCESSING",
            paymentStatus: "PAID",
            total: 149.97,
            subtotal: 129.97,
            tax: 10.0,
            shippingCost: 10.0,
            createdAt: new Date(),
            updatedAt: new Date(),
            userId: "user_test_id",
            billingAddressId: null,
            shippingAddressId: "address_test_id",
            notes: null,
            items: [
              {
                id: "item1",
                name: "Robot Building Kit",
                price: 49.99,
                quantity: 1,
                orderId: "test_order_id",
                productId: "product1",
                product: {
                  id: "product1",
                  name: "Robot Building Kit",
                  description:
                    "Educational robot building kit for children ages 8+",
                  price: 49.99,
                  slug: "robot-building-kit",
                  images: ["https://example.com/robot-kit.jpg"],
                  isActive: true,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  categoryId: "category1",
                  attributes: null,
                  barcode: null,
                  compareAtPrice: null,
                  dimensions: null,
                  metadata: null,
                  sku: "ROBOT-001",
                  stockQuantity: 10,
                  tags: ["robot", "stem", "engineering"],
                  weight: null,
                  featured: false,
                } as Product,
              },
              {
                id: "item2",
                name: "Science Experiment Kit",
                price: 39.99,
                quantity: 2,
                orderId: "test_order_id",
                productId: "product2",
                product: {
                  id: "product2",
                  name: "Science Experiment Kit",
                  description: "30 exciting experiments for young scientists",
                  price: 39.99,
                  slug: "science-experiment-kit",
                  images: ["https://example.com/science-kit.jpg"],
                  isActive: true,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  categoryId: "category2",
                  attributes: null,
                  barcode: null,
                  compareAtPrice: null,
                  dimensions: null,
                  metadata: null,
                  sku: "SCIENCE-001",
                  stockQuantity: 20,
                  tags: ["science", "stem", "experiment"],
                  weight: null,
                  featured: false,
                } as Product,
              },
            ],
            user: {
              id: "user1",
              name: "Test User",
              email: recipient,
              password: "hashed_password",
              role: "CUSTOMER",
              emailVerified: null,
              verificationToken: null,
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            } as User,
            shippingAddress: {
              id: "address1",
              name: "Home",
              userId: "user1",
              fullName: "Test User",
              addressLine1: "123 Test Street",
              addressLine2: "Apt 4B",
              city: "Test City",
              state: "Test State",
              postalCode: "12345",
              country: "Test Country",
              phone: "+1234567890",
              isDefault: true,
            } as Address,
          } as Order & {
            items: Array<{
              product: Product;
              id: string;
              name: string;
              price: number;
              quantity: number;
              orderId: string;
              productId: string;
            }>;
            user: User;
            shippingAddress: Address;
          };

          order = mockOrder;
        }

        await emailTemplates.orderConfirmation({
          to: recipient,
          order,
          user: {
            name: "Test User",
          },
        });
        break;
      }

      case "returnProcessing": {
        // Find a real order if possible
        const realOrder = await prisma.order.findFirst({
          include: {
            user: true,
          },
          orderBy: { createdAt: "desc" },
        });

        // Use real order or mock data
        const order =
          realOrder ||
          ({
            id: "test_order_id",
            orderNumber: "TEST123456",
            status: "PROCESSING",
            paymentStatus: "PAID",
            userId: "user_test_id",
            total: 149.97,
            subtotal: 129.97,
            tax: 10.0,
            shippingCost: 10.0,
            createdAt: new Date(),
            updatedAt: new Date(),
            shippingAddressId: "address_test_id",
            billingAddressId: null,
            notes: null,
            user: {
              id: "user1",
              name: "Test User",
              email: recipient,
              password: "hashed_password",
              role: "CUSTOMER",
              emailVerified: null,
              verificationToken: null,
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            } as User,
          } as Order & { user: User });

        await emailTemplates.returnProcessing({
          to: recipient,
          order,
          returnStatus: "PROCESSING",
          returnDetails: {
            id: "return_test_123",
            reason: "Test Return Reason",
            comments: "This is a test return processing email",
          },
          user: {
            name: "Test User",
          },
        });
        break;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Test ${emailType} email sent to ${recipient}`,
    });
  } catch (error) {
    console.error("Failed to send test email:", error);
    return NextResponse.json(
      { error: "Failed to send test email", details: (error as Error).message },
      { status: 500 }
    );
  }
}
