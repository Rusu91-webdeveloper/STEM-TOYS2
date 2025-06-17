const { PrismaClient } = require("../app/generated/prisma");
const prisma = new PrismaClient();

async function checkCategories() {
  try {
    console.log("===== CHECKING CATEGORIES =====");

    const categories = await prisma.category.findMany();
    console.log(`Found ${categories.length} categories:`);

    if (categories.length > 0) {
      categories.forEach((category, index) => {
        console.log(`\nCategory #${index + 1}:`);
        console.log(`- ID: ${category.id}`);
        console.log(`- Name: ${category.name}`);
        console.log(`- Slug: ${category.slug}`);
        console.log(`- Description: ${category.description || "N/A"}`);
        console.log(`- Created At: ${category.createdAt}`);
      });
    } else {
      console.log("No categories found in the database.");
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCategories();
