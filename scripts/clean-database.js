const { PrismaClient } = require("../app/generated/prisma");
const prisma = new PrismaClient();

async function cleanDatabase() {
  try {
    console.log("===== CLEANING DATABASE =====");
    console.log("Keeping only admin user and the 2 books...");

    // Delete all products
    console.log("\nDeleting products...");
    const deletedProducts = await prisma.product.deleteMany();
    console.log(`Deleted ${deletedProducts.count} products`);

    // Delete all blogs first (since they have foreign keys to categories)
    console.log("\nDeleting blogs...");
    const deletedBlogs = await prisma.blog.deleteMany();
    console.log(`Deleted ${deletedBlogs.count} blogs`);

    // Now delete categories except educational-books
    console.log("\nDeleting categories (except educational-books)...");
    const deletedCategories = await prisma.category.deleteMany({
      where: {
        slug: {
          not: "educational-books",
        },
      },
    });
    console.log(`Deleted ${deletedCategories.count} categories`);

    // Delete all newsletter subscribers
    console.log("\nDeleting newsletter subscribers...");
    const deletedNewsletters = await prisma.newsletter.deleteMany();
    console.log(`Deleted ${deletedNewsletters.count} newsletter subscribers`);

    // Keep store settings as they're needed for the application
    console.log("\nKeeping store settings (needed for the application)");

    // Keep admin user
    console.log("\nKeeping admin user");

    // Keep books
    console.log("\nKeeping the 2 books");

    console.log("\n===== DATABASE CLEANED =====");
  } catch (error) {
    console.error("Error cleaning database:", error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanDatabase().then(() => {
  console.log("\nChecking database after cleanup...");
  require("./check-database");
});
