const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function checkCategories() {
  try {
    console.log("===== CHECKING CATEGORIES IN DATABASE =====");

    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    console.log(`Found ${categories.length} categories:`);

    if (categories.length === 0) {
      console.log("❌ No categories found in database!");
    } else {
      categories.forEach((category, index) => {
        console.log(`\n${index + 1}. ${category.name}`);
        console.log(`   - ID: ${category.id}`);
        console.log(`   - Slug: ${category.slug}`);
        console.log(
          `   - Description: ${category.description || "No description"}`
        );
        console.log(`   - Active: ${category.isActive}`);
        console.log(`   - Product Count: ${category._count.products}`);
      });
    }

    // Check if educational-books category exists (needed for books)
    const educationalBooksCategory = categories.find(
      (c) => c.slug === "educational-books"
    );

    if (!educationalBooksCategory) {
      console.log(
        "\n⚠️  Missing 'educational-books' category needed for digital books!"
      );
      return false;
    } else {
      console.log("\n✅ 'educational-books' category exists for digital books");
    }

    // Check for other important categories
    const stemCategories = [
      "science",
      "technology",
      "engineering",
      "mathematics",
    ];
    const missingStemCategories = stemCategories.filter(
      (stem) => !categories.find((c) => c.slug === stem)
    );

    if (missingStemCategories.length > 0) {
      console.log(
        `\n⚠️  Missing STEM categories: ${missingStemCategories.join(", ")}`
      );
    } else {
      console.log("\n✅ All STEM categories present");
    }

    return true;
  } catch (error) {
    console.error("Error checking categories:", error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

async function seedBasicCategories() {
  try {
    console.log("\n===== SEEDING BASIC CATEGORIES =====");

    const categoriesToCreate = [
      {
        name: "Educational Books",
        slug: "educational-books",
        description: "Digital and physical educational books for learning",
        isActive: true,
      },
      {
        name: "Science",
        slug: "science",
        description: "Science-focused STEM toys and experiments",
        isActive: true,
      },
      {
        name: "Technology",
        slug: "technology",
        description: "Technology and coding toys for young learners",
        isActive: true,
      },
      {
        name: "Engineering",
        slug: "engineering",
        description: "Engineering and building toys",
        isActive: true,
      },
      {
        name: "Mathematics",
        slug: "mathematics",
        description: "Math games and educational toys",
        isActive: true,
      },
    ];

    for (const categoryData of categoriesToCreate) {
      // Check if category already exists
      const existing = await prisma.category.findUnique({
        where: { slug: categoryData.slug },
      });

      if (!existing) {
        const created = await prisma.category.create({
          data: categoryData,
        });
        console.log(`✅ Created category: ${created.name} (${created.slug})`);
      } else {
        console.log(
          `⏭️  Category already exists: ${existing.name} (${existing.slug})`
        );
      }
    }

    console.log("\n✅ Category seeding completed!");
    return true;
  } catch (error) {
    console.error("Error seeding categories:", error);
    return false;
  }
}

// Main function
async function main() {
  const hasCategories = await checkCategories();

  if (!hasCategories) {
    console.log("\n🔧 Seeding basic categories...");
    await seedBasicCategories();

    console.log("\n📋 Checking categories after seeding...");
    await checkCategories();
  }
}

main().catch(console.error);
