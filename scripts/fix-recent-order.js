const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function fixRecentOrder() {
  console.log("🔧 Fixing recent order to use book IDs...\n");

  try {
    // Get the most recent order
    const recentOrder = await prisma.order.findFirst({
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
        user: true,
      },
    });

    if (!recentOrder) {
      console.log("❌ No recent orders found");
      return;
    }

    console.log(`📦 Found order: ${recentOrder.orderNumber}`);
    console.log(`   Customer: ${recentOrder.user.email}`);
    console.log(`   Items: ${recentOrder.items.length}`);

    // Define the mapping from product IDs to book IDs
    const productToBookMapping = {
      cmc3doe6b0003jnx1c9fov5b3: "cmc3av98d0001jnemsgaboab8", // STEM Play for Neurodiverse Minds
      cmc3doe1y0001jnx1uvsj684t: "cmc3av8wl0000jnemht9u5q4s", // Born for the Future
    };

    console.log("\n🔄 Converting order items to books...\n");

    // Update each order item
    for (const item of recentOrder.items) {
      const bookId = productToBookMapping[item.productId];

      if (bookId) {
        console.log(`Converting "${item.name}" from product to book...`);
        console.log(`   Product ID: ${item.productId} → Book ID: ${bookId}`);

        // Set download expiration (30 days from now)
        const downloadExpiresAt = new Date();
        downloadExpiresAt.setDate(downloadExpiresAt.getDate() + 30);

        // Update the order item
        await prisma.orderItem.update({
          where: { id: item.id },
          data: {
            productId: null, // Remove product ID
            bookId: bookId, // Set book ID
            isDigital: true, // Mark as digital
            maxDownloads: 5, // Set max downloads
            downloadExpiresAt: downloadExpiresAt,
          },
        });

        console.log(`   ✅ Updated order item to digital book`);
      } else {
        console.log(
          `⚠️  No book mapping found for "${item.name}" (${item.productId})`
        );
      }
    }

    // Now trigger digital processing
    console.log("\n🚀 Triggering digital book processing...\n");

    // Import crypto for generating tokens
    const crypto = require("crypto");

    // Get the updated order with digital items
    const updatedOrder = await prisma.order.findUnique({
      where: { id: recentOrder.id },
      include: {
        user: true,
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
          },
        },
      },
    });

    if (updatedOrder.items.length === 0) {
      console.log("❌ No digital items found after update");
      return;
    }

    console.log(`Found ${updatedOrder.items.length} digital items`);

    // Set download expiration (30 days from now)
    const downloadExpiresAt = new Date();
    downloadExpiresAt.setDate(downloadExpiresAt.getDate() + 30);

    // Generate download tokens for each digital file
    for (const orderItem of updatedOrder.items) {
      if (!orderItem.book) {
        console.error(`Book not found for order item: ${orderItem.id}`);
        continue;
      }

      const book = orderItem.book;
      console.log(`Processing book: ${book.name}`);

      // Create download records for each digital file
      for (const digitalFile of book.digitalFiles) {
        const downloadToken = crypto.randomBytes(32).toString("hex");

        // Create download record
        await prisma.digitalDownload.create({
          data: {
            orderItemId: orderItem.id,
            userId: updatedOrder.userId,
            digitalFileId: digitalFile.id,
            downloadToken,
            expiresAt: downloadExpiresAt,
          },
        });

        console.log(
          `   ✅ Created download link for ${digitalFile.format} (${digitalFile.language})`
        );
      }
    }

    // Send digital download email
    console.log("\n📧 Sending digital download email...\n");

    // Get download links
    const downloads = await prisma.digitalDownload.findMany({
      where: {
        userId: updatedOrder.userId,
        orderItem: {
          orderId: updatedOrder.id,
        },
      },
      include: {
        digitalFile: {
          include: {
            book: true,
          },
        },
      },
    });

    console.log(`Created ${downloads.length} download links:`);
    downloads.forEach((download) => {
      const book = download.digitalFile.book;
      const downloadUrl = `http://localhost:3000/api/download/${download.downloadToken}`;
      console.log(
        `   📚 ${book.name} (${download.digitalFile.format}, ${download.digitalFile.language})`
      );
      console.log(`      🔗 ${downloadUrl}`);
    });

    console.log("\n✅ Order fixed and digital processing completed!");
    console.log(
      `📧 Customer ${updatedOrder.user.email} now has access to ${downloads.length} digital files`
    );
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the fix
fixRecentOrder();
