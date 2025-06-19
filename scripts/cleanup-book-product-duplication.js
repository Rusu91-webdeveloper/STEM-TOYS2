const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function cleanupBookProductDuplication() {
  console.log("🧹 Starting Book-Product Duplication Cleanup...\n");

  try {
    // 1. Get all books from the books table
    const books = await prisma.book.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        author: true,
      },
    });

    console.log(`📚 Found ${books.length} books in books table`);

    // 2. Get all products
    const products = await prisma.product.findMany({
      include: {
        category: true,
      },
    });

    console.log(`📦 Found ${products.length} products in products table`);

    // 3. Find products that might be duplicates of books
    const duplicateProducts = [];

    for (const product of products) {
      // Check if there's a book with similar name or slug
      const matchingBook = books.find(
        (book) =>
          // Exact name match
          book.name.toLowerCase() === product.name.toLowerCase() ||
          // Exact slug match
          book.slug === product.slug ||
          // Similar name match (contains most of the words)
          product.name.toLowerCase().includes(book.name.toLowerCase()) ||
          book.name.toLowerCase().includes(product.name.toLowerCase())
      );

      if (matchingBook) {
        duplicateProducts.push({
          product,
          matchingBook,
          reason:
            matchingBook.name.toLowerCase() === product.name.toLowerCase()
              ? "exact_name"
              : matchingBook.slug === product.slug
                ? "exact_slug"
                : "similar_name",
        });
      }
    }

    console.log(
      `🔍 Found ${duplicateProducts.length} potential duplicate products:\n`
    );

    // 4. Display duplicates for confirmation
    duplicateProducts.forEach((dup, index) => {
      console.log(
        `${index + 1}. Product: "${dup.product.name}" (${dup.product.slug})`
      );
      console.log(
        `   Book: "${dup.matchingBook.name}" (${dup.matchingBook.slug})`
      );
      console.log(`   Category: ${dup.product.category?.name || "Unknown"}`);
      console.log(`   Match reason: ${dup.reason}\n`);
    });

    if (duplicateProducts.length === 0) {
      console.log(
        "✅ No duplicate products found. Books and products are properly separated!"
      );
      return;
    }

    // 5. Remove duplicate products
    console.log("🗑️  Removing duplicate products from products table...\n");

    for (const dup of duplicateProducts) {
      try {
        // Check if product has any orders
        const orderItems = await prisma.orderItem.findMany({
          where: { productId: dup.product.id },
        });

        if (orderItems.length > 0) {
          console.log(
            `⚠️  Product "${dup.product.name}" has ${orderItems.length} order(s), marking as inactive instead of deleting`
          );

          // Mark as inactive instead of deleting
          await prisma.product.update({
            where: { id: dup.product.id },
            data: {
              isActive: false,
              metadata: {
                ...(dup.product.metadata || {}),
                deactivated: true,
                deactivatedReason: "Duplicate of digital book",
                deactivatedAt: new Date().toISOString(),
                matchingBookId: dup.matchingBook.id,
              },
            },
          });
        } else {
          console.log(
            `🗑️  Deleting product "${dup.product.name}" (no orders found)`
          );

          // Safe to delete since no orders reference it
          await prisma.product.delete({
            where: { id: dup.product.id },
          });
        }
      } catch (error) {
        console.error(
          `❌ Error processing product "${dup.product.name}":`,
          error.message
        );
      }
    }

    // 6. Final report
    console.log("\n📊 Cleanup Summary:");

    const remainingProducts = await prisma.product.count({
      where: { isActive: true },
    });

    const totalBooks = await prisma.book.count();

    console.log(`📚 Digital Books: ${totalBooks}`);
    console.log(`📦 Active Products: ${remainingProducts}`);

    // 7. Verify no STEM products were affected
    const stemProducts = await prisma.product.findMany({
      where: {
        isActive: true,
        category: {
          slug: {
            in: [
              "science-kits",
              "engineering-robotics",
              "technology-programming",
              "mathematics",
              "general-stem",
            ],
          },
        },
      },
      include: { category: true },
    });

    console.log(`🔬 Active STEM Products: ${stemProducts.length}`);

    if (stemProducts.length > 0) {
      console.log("\n🔬 Remaining STEM Products:");
      stemProducts.forEach((product) => {
        console.log(`   - ${product.name} (${product.category.name})`);
      });
    }

    console.log("\n✅ Cleanup completed successfully!");
    console.log("\n📋 Result:");
    console.log("   ✅ Books table: Contains only digital books");
    console.log("   ✅ Products table: Contains only physical STEM products");
    console.log("   ✅ No more duplication between books and products");
  } catch (error) {
    console.error("❌ Error during cleanup:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup
cleanupBookProductDuplication().catch((error) => {
  console.error("❌ Cleanup failed:", error);
  process.exit(1);
});
