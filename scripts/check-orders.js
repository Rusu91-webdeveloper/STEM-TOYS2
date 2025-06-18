const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function checkOrders() {
  try {
    console.log("===== CHECKING ORDERS =====");

    const orders = await prisma.order.findMany({
      include: {
        items: true,
        shippingAddress: true,
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    console.log(`Found ${orders.length} orders in the database.`);

    if (orders.length > 0) {
      orders.forEach((order, index) => {
        console.log(`\nOrder #${index + 1}:`);
        console.log(`- ID: ${order.id}`);
        console.log(`- Order Number: ${order.orderNumber}`);
        console.log(
          `- User: ${order.user.email} (${order.user.name || "No name"})`
        );
        console.log(`- Status: ${order.status}`);
        console.log(`- Payment Status: ${order.paymentStatus}`);
        console.log(`- Total: ${order.total}`);
        console.log(`- Created At: ${order.createdAt}`);

        console.log(`\n  Items (${order.items.length}):`);
        order.items.forEach((item, i) => {
          console.log(
            `  ${i + 1}. ${item.name} - ${item.quantity}x @ ${item.price} = ${item.quantity * item.price}`
          );
        });

        console.log(`\n  Shipping Address:`);
        console.log(`  - ${order.shippingAddress.fullName}`);
        console.log(`  - ${order.shippingAddress.addressLine1}`);
        if (order.shippingAddress.addressLine2) {
          console.log(`  - ${order.shippingAddress.addressLine2}`);
        }
        console.log(
          `  - ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}`
        );
        console.log(`  - ${order.shippingAddress.country}`);
        console.log(`  - ${order.shippingAddress.phone}`);
      });
    } else {
      console.log("No orders found in the database.");
    }
  } catch (error) {
    console.error("Error checking orders:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkOrders();
