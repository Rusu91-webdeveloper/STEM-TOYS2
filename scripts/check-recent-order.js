const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function checkRecentOrder() {
  console.log("🔍 Checking recent orders...\n");

  try {
    // Get the most recent orders
    const recentOrders = await prisma.order.findMany({
      take: 3,
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          include: {
            product: {
              select: { name: true, id: true },
            },
            book: {
              select: { name: true, id: true },
            },
          },
        },
        user: {
          select: { email: true },
        },
      },
    });

    console.log(`Found ${recentOrders.length} recent orders:\n`);

    for (const order of recentOrders) {
      console.log(`📦 Order: ${order.orderNumber}`);
      console.log(`   Customer: ${order.user.email}`);
      console.log(`   Created: ${order.createdAt.toISOString()}`);
      console.log(`   Items: ${order.items.length}`);

      order.items.forEach((item, index) => {
        console.log(`      ${index + 1}. ${item.name}`);
        console.log(`         Product ID: ${item.productId || "null"}`);
        console.log(`         Book ID: ${item.bookId || "null"}`);
        console.log(`         Is Digital: ${item.isDigital}`);
        console.log(
          `         Product: ${item.product ? item.product.name : "null"}`
        );
        console.log(`         Book: ${item.book ? item.book.name : "null"}`);
        console.log("");
      });
      console.log("");
    }

    // Now check which IDs exist in the books table
    console.log("📚 Checking which IDs exist in books table:\n");

    const books = await prisma.book.findMany({
      select: { id: true, name: true, slug: true },
    });

    console.log("Books in database:");
    books.forEach((book) => {
      console.log(`   📖 ${book.name} (ID: ${book.id})`);
    });

    console.log("\n🔍 Looking for matching IDs between orders and books...\n");

    // Check if any order item IDs match book IDs
    for (const order of recentOrders) {
      console.log(`Order ${order.orderNumber}:`);
      for (const item of order.items) {
        const matchingBook = books.find(
          (book) => book.id === item.productId || book.id === item.bookId
        );

        if (matchingBook) {
          console.log(`   ✅ ${item.name} matches book: ${matchingBook.name}`);
        } else {
          console.log(
            `   ❌ ${item.name} doesn't match any book (productId: ${item.productId})`
          );
        }
      }
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the check
checkRecentOrder();
