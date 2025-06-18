const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function fixOrphanedOrders() {
  try {
    console.log("===== FIXING ORPHANED ORDERS =====");

    // Find all orders without items
    const orphanedOrders = await prisma.order.findMany({
      where: {
        items: {
          none: {},
        },
      },
      include: {
        items: true,
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    console.log(
      `Found ${orphanedOrders.length} orphaned orders (orders without items).`
    );

    if (orphanedOrders.length === 0) {
      console.log("✅ No orphaned orders found. All orders have items.");
      return;
    }

    console.log("\n📋 Orphaned Orders Summary:");
    orphanedOrders.forEach((order, index) => {
      console.log(`${index + 1}. Order #${order.orderNumber}`);
      console.log(`   - ID: ${order.id}`);
      console.log(`   - User: ${order.user.email}`);
      console.log(`   - Total: $${order.total}`);
      console.log(`   - Status: ${order.status}`);
      console.log(`   - Created: ${order.createdAt}`);
      console.log(
        `   - Items: ${order.items.length} (should have items based on total)`
      );
    });

    // Ask user what to do
    console.log("\n🤔 What would you like to do with these orphaned orders?");
    console.log("1. DELETE them (recommended for test orders)");
    console.log("2. KEEP them as-is (for manual review)");
    console.log("3. EXIT without changes");

    // Since this is a Node.js script, we'll default to option 2 (keep them)
    // but log instructions for manual handling
    console.log("\n⚠️  RECOMMENDATION:");
    console.log("   - If these are test orders: Delete them");
    console.log(
      "   - If these are real customer orders: Keep them and contact customers"
    );

    console.log("\n📝 To delete orphaned orders, run:");
    console.log("   node scripts/delete-orphaned-orders.js");

    console.log(
      "\n✅ Script completed. No changes made to preserve data safety."
    );
  } catch (error) {
    console.error("Error fixing orphaned orders:", error);
  } finally {
    await prisma.$disconnect();
  }
}

fixOrphanedOrders();
