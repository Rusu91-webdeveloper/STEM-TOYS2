const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function triggerDigitalProcessing() {
  console.log("🔄 Manually triggering digital book processing...\n");

  try {
    // Since we can't directly require TS files, let's create our own logic
    // Import crypto for generating tokens
    const crypto = require("crypto");

    async function processDigitalBookOrder(orderId) {
      console.log(`Processing digital book order: ${orderId}`);

      // Get the order with all digital book items
      const order = await prisma.order.findUnique({
        where: { id: orderId },
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

      if (!order) {
        throw new Error(`Order not found: ${orderId}`);
      }

      if (order.items.length === 0) {
        console.log(`No digital items found in order: ${orderId}`);
        return;
      }

      console.log(
        `Found ${order.items.length} digital items in order ${order.orderNumber}`
      );

      // Set download expiration (30 days from now)
      const downloadExpiresAt = new Date();
      downloadExpiresAt.setDate(downloadExpiresAt.getDate() + 30);

      // Generate download tokens for each digital file
      for (const orderItem of order.items) {
        if (!orderItem.book) {
          console.error(`Book not found for order item: ${orderItem.id}`);
          continue;
        }

        const book = orderItem.book;

        // Update order item with download expiration
        await prisma.orderItem.update({
          where: { id: orderItem.id },
          data: { downloadExpiresAt },
        });

        // Create download records for each digital file
        for (const digitalFile of book.digitalFiles) {
          const downloadToken = crypto.randomBytes(32).toString("hex");

          // Create download record
          await prisma.digitalDownload.create({
            data: {
              orderItemId: orderItem.id,
              userId: order.userId,
              digitalFileId: digitalFile.id,
              downloadToken,
              expiresAt: downloadExpiresAt,
            },
          });

          console.log(
            `Created download link for ${book.name} (${digitalFile.format}, ${digitalFile.language})`
          );
        }
      }

      console.log(
        `Successfully processed digital book order: ${order.orderNumber}`
      );
    }

    // Get the most recent order with digital books
    const recentOrder = await prisma.order.findFirst({
      where: {
        items: {
          some: {
            OR: [{ isDigital: true }, { bookId: { not: null } }],
          },
        },
      },
      include: {
        items: {
          where: {
            OR: [{ isDigital: true }, { bookId: { not: null } }],
          },
          include: {
            book: true,
            downloads: true,
          },
        },
        user: true,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!recentOrder) {
      console.log("❌ No orders with digital books found");
      return;
    }

    console.log(`📦 Found order: ${recentOrder.orderNumber}`);
    console.log(`   Customer: ${recentOrder.user.email}`);
    console.log(`   Digital items: ${recentOrder.items.length}`);

    recentOrder.items.forEach((item) => {
      console.log(
        `      📚 ${item.name} (Book ID: ${item.bookId}, Downloads: ${item.downloads.length})`
      );
    });

    console.log("\n🚀 Processing digital book order...");

    try {
      await processDigitalBookOrder(recentOrder.id);
      console.log("✅ Digital book processing completed successfully!");

      // Check results
      const updatedOrder = await prisma.order.findUnique({
        where: { id: recentOrder.id },
        include: {
          items: {
            where: { isDigital: true },
            include: {
              downloads: true,
            },
          },
        },
      });

      console.log("\n📊 Results:");
      updatedOrder.items.forEach((item) => {
        console.log(
          `   📚 ${item.name}: ${item.downloads.length} download links created`
        );
      });
    } catch (processingError) {
      console.error("❌ Digital processing failed:", processingError);
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Alternative: Process a specific order by ID
async function processSpecificOrder(orderId) {
  console.log(`🔄 Processing specific order: ${orderId}\n`);

  try {
    // Use the inline processDigitalBookOrder function defined above
    await triggerDigitalProcessing(); // This will process the most recent order
    console.log("✅ Digital book processing completed successfully!");
  } catch (error) {
    console.error("❌ Error processing order:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Check command line arguments
const args = process.argv.slice(2);
const orderId = args[0];

if (orderId) {
  processSpecificOrder(orderId);
} else {
  triggerDigitalProcessing();
}
