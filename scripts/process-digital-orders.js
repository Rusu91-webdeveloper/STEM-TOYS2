const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function processDigitalOrders() {
  console.log("🔍 Processing digital book orders...\n");

  try {
    // Find orders with digital book items that may not have download links
    const ordersWithDigitalBooks = await prisma.order.findMany({
      include: {
        items: {
          where: { isDigital: true },
          include: {
            book: {
              include: {
                digitalFiles: {
                  where: { isActive: true },
                },
              },
            },
            downloads: true,
          },
        },
        user: true,
      },
      orderBy: { createdAt: "desc" },
    });

    console.log(
      `Found ${ordersWithDigitalBooks.length} orders with digital books\n`
    );

    for (const order of ordersWithDigitalBooks) {
      const digitalItems = order.items.filter((item) => item.isDigital);

      if (digitalItems.length === 0) continue;

      console.log(`📦 Order: ${order.orderNumber}`);
      console.log(`   Customer: ${order.user.email}`);
      console.log(`   Created: ${order.createdAt.toISOString()}`);
      console.log(`   Digital Items: ${digitalItems.length}`);

      for (const item of digitalItems) {
        if (!item.book) {
          console.log(`   ⚠️  Book not found for item: ${item.name}`);
          continue;
        }

        const existingDownloads = item.downloads.length;
        const availableFiles = item.book.digitalFiles.length;

        console.log(`      📚 ${item.name}`);
        console.log(`         - Available files: ${availableFiles}`);
        console.log(`         - Existing downloads: ${existingDownloads}`);

        // If there are available files but no downloads, create them
        if (availableFiles > 0 && existingDownloads === 0) {
          console.log(`         🔄 Creating download links...`);

          const downloadExpiresAt = new Date();
          downloadExpiresAt.setDate(downloadExpiresAt.getDate() + 30);

          for (const digitalFile of item.book.digitalFiles) {
            const downloadToken = require("crypto")
              .randomBytes(32)
              .toString("hex");

            await prisma.digitalDownload.create({
              data: {
                orderItemId: item.id,
                userId: order.userId,
                digitalFileId: digitalFile.id,
                downloadToken,
                expiresAt: downloadExpiresAt,
              },
            });

            console.log(
              `         ✅ Created download for ${digitalFile.fileName}`
            );
          }

          // Update order item with download expiration
          await prisma.orderItem.update({
            where: { id: item.id },
            data: {
              downloadExpiresAt,
            },
          });
        } else if (availableFiles === 0) {
          console.log(`         ⚠️  No digital files available for this book`);
        } else {
          console.log(`         ✅ Downloads already exist`);
        }
      }
      console.log("");
    }

    // Summary
    const totalDownloads = await prisma.digitalDownload.count();
    const totalDigitalFiles = await prisma.digitalFile.count();
    const totalDigitalOrderItems = await prisma.orderItem.count({
      where: { isDigital: true },
    });

    console.log("\n📊 Summary:");
    console.log(`   Total digital files: ${totalDigitalFiles}`);
    console.log(`   Total digital order items: ${totalDigitalOrderItems}`);
    console.log(`   Total download links: ${totalDownloads}`);
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the processing
processDigitalOrders();
