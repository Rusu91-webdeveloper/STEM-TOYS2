/**
 * Fix existing orders that are marked as DELIVERED but don't have deliveredAt set
 * Run this script once to fix historical data: node scripts/fix-delivered-orders.js
 */

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function fixDeliveredOrders() {
  try {
    console.log("🔍 Looking for delivered orders without deliveredAt...");

    // Find orders that are DELIVERED but don't have deliveredAt set
    const ordersToFix = await prisma.order.findMany({
      where: {
        status: "DELIVERED",
        deliveredAt: null,
      },
      select: {
        id: true,
        orderNumber: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    console.log(`📦 Found ${ordersToFix.length} orders that need fixing`);

    if (ordersToFix.length === 0) {
      console.log("✅ No orders need fixing");
      return;
    }

    // Update each order to set deliveredAt
    for (const order of ordersToFix) {
      // Set deliveredAt to either updatedAt (when status was likely changed) or createdAt + 7 days
      const estimatedDeliveryDate = new Date(
        order.updatedAt || order.createdAt
      );

      await prisma.order.update({
        where: { id: order.id },
        data: {
          deliveredAt: estimatedDeliveryDate,
        },
      });

      console.log(
        `✅ Fixed order ${order.orderNumber} - set deliveredAt to ${estimatedDeliveryDate.toISOString()}`
      );
    }

    console.log(`🎉 Successfully fixed ${ordersToFix.length} orders`);
    console.log(
      "📋 Return buttons should now appear for these orders (if within 14-day window)"
    );
  } catch (error) {
    console.error("❌ Error fixing delivered orders:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixDeliveredOrders();
