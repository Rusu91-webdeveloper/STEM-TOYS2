const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function findAllOrders() {
  console.log("🔍 Finding ALL orders in the database...\n");

  try {
    // Get ALL orders
    const allOrders = await prisma.order.findMany({
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
            downloads: true,
          },
        },
        user: {
          select: { email: true },
        },
      },
    });

    console.log(`Found ${allOrders.length} total orders:\n`);

    for (const order of allOrders) {
      console.log(`📦 Order: ${order.orderNumber}`);
      console.log(`   ID: ${order.id}`);
      console.log(`   Customer: ${order.user.email}`);
      console.log(`   Created: ${order.createdAt.toISOString()}`);
      console.log(`   Status: ${order.status}`);
      console.log(`   Items: ${order.items.length}`);

      order.items.forEach((item, index) => {
        console.log(`      ${index + 1}. ${item.name}`);
        console.log(`         Product ID: ${item.productId || "null"}`);
        console.log(`         Book ID: ${item.bookId || "null"}`);
        console.log(`         Is Digital: ${item.isDigital}`);
        console.log(`         Downloads: ${item.downloads.length}`);
        console.log("");
      });
      console.log("");
    }

    // Also check for any digital downloads
    console.log("📊 All Digital Downloads:\n");

    const allDownloads = await prisma.digitalDownload.findMany({
      include: {
        orderItem: {
          include: {
            order: {
              select: {
                orderNumber: true,
                id: true,
                user: {
                  select: { email: true },
                },
              },
            },
          },
        },
        digitalFile: {
          include: {
            book: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    console.log(`Total download links: ${allDownloads.length}`);
    allDownloads.forEach((download, index) => {
      console.log(
        `   ${index + 1}. Order: ${download.orderItem.order.orderNumber} (${download.orderItem.order.id})`
      );
      console.log(`      Customer: ${download.orderItem.order.user.email}`);
      console.log(`      Book: ${download.digitalFile.book.name}`);
      console.log(`      Token: ${download.downloadToken.substring(0, 20)}...`);
      console.log("");
    });

    // Also check order items with book IDs
    console.log("📚 Order Items with Book IDs:\n");

    const bookOrderItems = await prisma.orderItem.findMany({
      where: {
        bookId: { not: null },
      },
      include: {
        order: {
          select: {
            orderNumber: true,
            id: true,
            user: {
              select: { email: true },
            },
          },
        },
        book: {
          select: { name: true },
        },
      },
    });

    console.log(`Order items with book IDs: ${bookOrderItems.length}`);
    bookOrderItems.forEach((item, index) => {
      console.log(
        `   ${index + 1}. Order: ${item.order.orderNumber} (${item.order.id})`
      );
      console.log(`      Customer: ${item.order.user.email}`);
      console.log(`      Book: ${item.book ? item.book.name : "null"}`);
      console.log(`      Book ID: ${item.bookId}`);
      console.log(`      Is Digital: ${item.isDigital}`);
      console.log("");
    });
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the check
findAllOrders();
