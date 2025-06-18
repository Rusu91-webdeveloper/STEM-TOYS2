const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function deleteOrphanedOrders() {
  try {
    console.log("===== DELETING ORPHANED ORDERS =====");

    // Find all orders without items
    const orphanedOrders = await prisma.order.findMany({
      where: {
        items: {
          none: {},
        },
      },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    console.log(`Found ${orphanedOrders.length} orphaned orders to delete.`);

    if (orphanedOrders.length === 0) {
      console.log("✅ No orphaned orders found. Nothing to delete.");
      return;
    }

    console.log("\n📋 Orders to be deleted:");
    orphanedOrders.forEach((order, index) => {
      console.log(`${index + 1}. Order #${order.orderNumber}`);
      console.log(`   - ID: ${order.id}`);
      console.log(`   - User: ${order.user.email}`);
      console.log(`   - Total: $${order.total}`);
      console.log(`   - Status: ${order.status}`);
      console.log(`   - Created: ${order.createdAt}`);
    });

    console.log(
      `\n⚠️  WARNING: This will permanently delete ${orphanedOrders.length} orders!`
    );
    console.log("⚠️  This action cannot be undone!");
    console.log("\n🚀 Proceeding with deletion in 3 seconds...");

    // Wait 3 seconds before deletion
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Delete orphaned orders
    const orderIds = orphanedOrders.map((order) => order.id);

    const deleteResult = await prisma.order.deleteMany({
      where: {
        id: {
          in: orderIds,
        },
      },
    });

    console.log(
      `\n✅ Successfully deleted ${deleteResult.count} orphaned orders.`
    );

    // Verify deletion
    const remainingOrphaned = await prisma.order.count({
      where: {
        items: {
          none: {},
        },
      },
    });

    console.log(
      `✅ Verification: ${remainingOrphaned} orphaned orders remaining.`
    );
  } catch (error) {
    console.error("Error deleting orphaned orders:", error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteOrphanedOrders();
