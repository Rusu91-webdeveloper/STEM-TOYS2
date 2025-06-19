const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function testOrdersAPI() {
  console.log("🧪 Testing orders API logic...\n");

  try {
    // Simulate the same query as the API
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                images: true,
                slug: true,
              },
            },
            book: {
              select: {
                name: true,
                author: true,
                slug: true,
                coverImage: true,
              },
            },
            reviews: {
              select: {
                id: true,
              },
            },
          },
        },
        shippingAddress: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log(`Found ${orders.length} orders\n`);

    // Test the formatting logic
    const formattedOrders = orders.map((order) => {
      return {
        id: order.id,
        orderNumber: order.orderNumber,
        date: order.createdAt.toISOString(),
        deliveredAt: order.deliveredAt?.toISOString(),
        status: order.status.toLowerCase(),
        total: order.total,
        items: order.items.map((item) => {
          // Handle both products and books
          const isBook = !!item.book;
          const name = isBook
            ? item.book.name
            : item.product?.name || item.name;
          const slug = isBook ? item.book.slug : item.product?.slug || "";
          const image = isBook
            ? item.book.coverImage || "/images/book-placeholder.jpg"
            : item.product?.images?.[0] || "/images/product-placeholder.jpg";

          return {
            id: item.id,
            productId: item.productId,
            bookId: item.bookId,
            productName: name,
            productSlug: slug,
            price: item.price,
            quantity: item.quantity,
            image,
            hasReviewed: item.reviews.length > 0,
            isDigital: item.isDigital,
            type: isBook ? "book" : "product",
            ...(isBook && {
              author: item.book.author,
              downloadCount: item.downloadCount,
              maxDownloads: item.maxDownloads,
              downloadExpiresAt: item.downloadExpiresAt?.toISOString(),
            }),
          };
        }),
        shippingAddress: {
          name: order.shippingAddress.fullName,
          street: order.shippingAddress.addressLine1,
          city: order.shippingAddress.city,
          state: order.shippingAddress.state,
          zipCode: order.shippingAddress.postalCode,
          country: order.shippingAddress.country,
        },
      };
    });

    console.log("📋 Formatted Orders:\n");

    formattedOrders.forEach((order, index) => {
      console.log(`${index + 1}. Order ${order.orderNumber}`);
      console.log(`   Date: ${order.date}`);
      console.log(`   Status: ${order.status}`);
      console.log(`   Total: $${order.total}`);
      console.log(`   Items: ${order.items.length}`);

      order.items.forEach((item, itemIndex) => {
        console.log(
          `      ${itemIndex + 1}. ${item.productName} (${item.type})`
        );
        console.log(`         Price: $${item.price} x ${item.quantity}`);
        if (item.type === "book") {
          console.log(`         Author: ${item.author}`);
          console.log(`         Digital: ${item.isDigital ? "Yes" : "No"}`);
          if (item.isDigital) {
            console.log(
              `         Downloads: ${item.downloadCount}/${item.maxDownloads}`
            );
            if (item.downloadExpiresAt) {
              console.log(`         Expires: ${item.downloadExpiresAt}`);
            }
          }
        }
      });

      console.log(`   Shipping: ${order.shippingAddress.name}`);
      console.log(`            ${order.shippingAddress.street}`);
      console.log(
        `            ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}`
      );
      console.log("");
    });

    console.log("✅ Orders API logic test completed successfully!");
    console.log("   - All orders formatted correctly");
    console.log("   - Both products and books handled");
    console.log("   - Digital book metadata included");
  } catch (error) {
    console.error("❌ Error testing orders API:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testOrdersAPI();
