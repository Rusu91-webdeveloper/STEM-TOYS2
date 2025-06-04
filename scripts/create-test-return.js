const { PrismaClient } = require("../app/generated/prisma");
const prisma = new PrismaClient();

async function createTestReturn() {
  try {
    // First, check if the user exists
    let user = await prisma.user.findUnique({
      where: { email: "rusuemanuel1991@gmail.com" },
    });

    // If user doesn't exist, create one
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: "rusuemanuel1991@gmail.com",
          name: "Emanuel Rusu",
          password: "$2b$10$XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", // Placeholder password hash
          isActive: true,
        },
      });
      console.log("Created test user:", user.email);
    }

    // Check for an order for this user
    let order = await prisma.order.findFirst({
      where: { userId: user.id },
      include: { items: true },
    });

    // If no order exists, create a test order with a product
    if (!order) {
      // Find or create a product
      const product = await prisma.product.findFirst({
        where: { isActive: true },
      });

      if (!product) {
        throw new Error(
          "No active products found. Please seed the database first."
        );
      }

      // Create an address for the order
      const address = await prisma.address.create({
        data: {
          userId: user.id,
          name: "Home",
          fullName: "Emanuel Rusu",
          addressLine1: "123 Test Street",
          city: "Test City",
          state: "Test State",
          postalCode: "12345",
          country: "Test Country",
          phone: "+1234567890",
          isDefault: true,
        },
      });

      // Create the order
      order = await prisma.order.create({
        data: {
          orderNumber: `TEST-${Date.now()}`,
          userId: user.id,
          shippingAddressId: address.id,
          total: product.price,
          subtotal: product.price,
          tax: 0,
          shippingCost: 0,
          paymentMethod: "Credit Card",
          status: "DELIVERED", // Order must be delivered before return
          paymentStatus: "PAID",
          items: {
            create: {
              productId: product.id,
              name: product.name,
              price: product.price,
              quantity: 1,
            },
          },
        },
        include: { items: true },
      });

      console.log("Created test order:", order.orderNumber);
    }

    // Now create a return for the first order item
    const orderItem = order.items[0];

    // Check if there's an existing return for this item
    const existingReturn = await prisma.return.findFirst({
      where: {
        orderItemId: orderItem.id,
      },
    });

    if (existingReturn) {
      console.log(
        `Return already exists with status: ${existingReturn.status}`
      );
      console.log(`Return ID: ${existingReturn.id}`);
      return existingReturn;
    }

    // Create the return
    const returnRecord = await prisma.return.create({
      data: {
        userId: user.id,
        orderId: order.id,
        orderItemId: orderItem.id,
        reason: "DAMAGED_OR_DEFECTIVE",
        status: "PENDING",
      },
    });

    console.log("Created test return:", returnRecord.id);
    return returnRecord;
  } catch (error) {
    console.error("Error creating test return:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestReturn();
