const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function simplifyBooksProducts() {
  console.log("🔄 Starting Books/Products Simplification...\n");

  try {
    // 1. Find the educational-books category
    const educationalBooksCategory = await prisma.category.findFirst({
      where: { slug: "educational-books" },
    });

    if (!educationalBooksCategory) {
      console.log(
        "ℹ️  No educational-books category found, skipping migration"
      );
      return;
    }

    // 2. Find products in educational-books category
    const educationalProducts = await prisma.product.findMany({
      where: { categoryId: educationalBooksCategory.id },
      include: { category: true },
    });

    console.log(
      `📦 Found ${educationalProducts.length} products in educational-books category`
    );

    if (educationalProducts.length > 0) {
      // 3. Find or create a general STEM category for migration
      let stemCategory = await prisma.category.findFirst({
        where: { slug: "general-stem" },
      });

      if (!stemCategory) {
        console.log("🆕 Creating general-stem category for migration...");
        stemCategory = await prisma.category.create({
          data: {
            name: "General STEM",
            slug: "general-stem",
            description: "General STEM educational products and materials",
            isActive: true,
            metadata: {
              type: "stem",
              migrated: true,
              migratedAt: new Date().toISOString(),
            },
          },
        });
      }

      // 4. Migrate products to STEM category
      console.log(
        `🔄 Migrating ${educationalProducts.length} products to general-stem category...`
      );

      for (const product of educationalProducts) {
        await prisma.product.update({
          where: { id: product.id },
          data: {
            categoryId: stemCategory.id,
            // Add migration metadata
            metadata: {
              ...(product.metadata || {}),
              migratedFromEducationalBooks: true,
              migratedAt: new Date().toISOString(),
              originalCategory: "educational-books",
            },
          },
        });
        console.log(`   ✅ Migrated: ${product.name}`);
      }
    }

    // 5. Update educational-books category to be inactive (don't delete in case of books linkage)
    await prisma.category.update({
      where: { id: educationalBooksCategory.id },
      data: {
        isActive: false,
        metadata: {
          ...(educationalBooksCategory.metadata || {}),
          deprecated: true,
          deprecatedAt: new Date().toISOString(),
          reason: "Simplified to books-only for digital content",
        },
      },
    });

    console.log(
      "🚫 Deactivated educational-books category (reserved for digital books system)"
    );

    // 6. Ensure we have proper STEM categories
    const stemCategories = [
      {
        name: "Science Kits",
        slug: "science-kits",
        description:
          "Hands-on science experiment kits and laboratory materials",
      },
      {
        name: "Engineering & Robotics",
        slug: "engineering-robotics",
        description: "Building sets, robotics kits, and engineering challenges",
      },
      {
        name: "Technology & Programming",
        slug: "technology-programming",
        description: "Coding games, computer science tools, and tech gadgets",
      },
      {
        name: "Mathematics",
        slug: "mathematics",
        description:
          "Math games, calculators, geometric tools, and mathematical puzzles",
      },
    ];

    console.log("\n🎯 Ensuring STEM categories exist...");
    for (const category of stemCategories) {
      const existing = await prisma.category.findFirst({
        where: { slug: category.slug },
      });

      if (!existing) {
        await prisma.category.create({
          data: {
            ...category,
            isActive: true,
            metadata: {
              type: "stem",
              createdBySimplification: true,
            },
          },
        });
        console.log(`   ✅ Created: ${category.name}`);
      } else {
        console.log(`   ℹ️  Exists: ${category.name}`);
      }
    }

    // 7. Report current state
    console.log("\n📊 Current State Summary:");

    const totalBooks = await prisma.book.count();
    const totalProducts = await prisma.product.count({
      where: { isActive: true },
    });
    const stemProducts = await prisma.product.count({
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
    });

    console.log(`📚 Digital Books: ${totalBooks}`);
    console.log(`📦 Total Active Products: ${totalProducts}`);
    console.log(`🔬 STEM Products: ${stemProducts}`);

    console.log("\n✅ Simplification completed successfully!");
    console.log("\n📋 Next Steps:");
    console.log("   1. Review migrated products in admin panel");
    console.log("   2. Categorize products into specific STEM categories");
    console.log("   3. Books system is now exclusively for digital content");
    console.log(
      "   4. Products system is now exclusively for physical STEM items"
    );
  } catch (error) {
    console.error("❌ Error during simplification:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the simplification
simplifyBooksProducts().catch((error) => {
  console.error("❌ Migration failed:", error);
  process.exit(1);
});
