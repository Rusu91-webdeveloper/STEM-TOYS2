const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function checkAllOrders() {
  console.log("🔍 Checking all recent orders...\n");

  try {
    // Get the most recent orders
    const recentOrders = await prisma.order.findMany({
      take: 10, // Get more orders
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

    console.log(`Found ${recentOrders.length} recent orders:\n`);

    for (const order of recentOrders) {
      console.log(`📦 Order: ${order.orderNumber}`);
      console.log(`   ID: ${order.id}`);
      console.log(`   Customer: ${order.user.email}`);
      console.log(`   Created: ${order.createdAt.toISOString()}`);
      console.log(`   Items: ${order.items.length}`);

      order.items.forEach((item, index) => {
        console.log(`      ${index + 1}. ${item.name}`);
        console.log(`         Product ID: ${item.productId || "null"}`);
        console.log(`         Book ID: ${item.bookId || "null"}`);
        console.log(`         Is Digital: ${item.isDigital}`);
        console.log(`         Max Downloads: ${item.maxDownloads || "null"}`);
        console.log(
          `         Download Expires: ${item.downloadExpiresAt ? item.downloadExpiresAt.toISOString() : "null"}`
        );
        console.log(`         Downloads Created: ${item.downloads.length}`);
        if (item.downloads.length > 0) {
          item.downloads.forEach((download, dIndex) => {
            console.log(
              `           ${dIndex + 1}. Token: ${download.downloadToken.substring(0, 20)}...`
            );
            console.log(
              `              Expires: ${download.expiresAt.toISOString()}`
            );
          });
        }
        console.log(
          `         Product: ${item.product ? item.product.name : "null"}`
        );
        console.log(`         Book: ${item.book ? item.book.name : "null"}`);
        console.log("");
      });
      console.log("");
    }

    // Get download summary
    console.log("📊 Digital Downloads Summary:\n");

    const allDownloads = await prisma.digitalDownload.findMany({
      include: {
        orderItem: {
          include: {
            order: {
              select: {
                orderNumber: true,
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

    console.log(`Total download links in database: ${allDownloads.length}`);
    allDownloads.forEach((download, index) => {
      console.log(
        `   ${index + 1}. Order: ${download.orderItem.order.orderNumber}`
      );
      console.log(`      Customer: ${download.orderItem.order.user.email}`);
      console.log(`      Book: ${download.digitalFile.book.name}`);
      console.log(
        `      Download URL: http://localhost:3000/api/download/${download.downloadToken}`
      );
      console.log(`      Expires: ${download.expiresAt.toISOString()}`);
      console.log("");
    });
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the check
checkAllOrders();
