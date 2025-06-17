const { PrismaClient } = require("../app/generated/prisma");
const prisma = new PrismaClient();

async function checkProducts() {
  try {
    console.log("===== CHECKING PRODUCTS =====");

    const products = await prisma.product.findMany({
      include: { category: true },
    });

    console.log(`Found ${products.length} products`);

    if (products.length > 0) {
      console.log("\nProducts by category:");
      const categoryProducts = {};

      products.forEach((p) => {
        const catName = p.category ? p.category.name : "No Category";
        if (!categoryProducts[catName]) categoryProducts[catName] = 0;
        categoryProducts[catName]++;
      });

      Object.entries(categoryProducts).forEach(([cat, count]) => {
        console.log(`- ${cat}: ${count} products`);
      });

      console.log("\nSample products:");
      products.slice(0, 3).forEach((product, index) => {
        console.log(`\nProduct #${index + 1}:`);
        console.log(`- ID: ${product.id}`);
        console.log(`- Name: ${product.name}`);
        console.log(`- Slug: ${product.slug}`);
        console.log(
          `- Category: ${product.category ? product.category.name : "None"}`
        );
        console.log(`- Price: ${product.price}`);
        console.log(`- Active: ${product.isActive}`);
      });
    } else {
      console.log("No products found in the database.");
    }

    // Also check books
    const books = await prisma.book.findMany();
    console.log(`\nFound ${books.length} books`);

    if (books.length > 0) {
      console.log("\nSample books:");
      books.slice(0, 3).forEach((book, index) => {
        console.log(`\nBook #${index + 1}:`);
        console.log(`- ID: ${book.id}`);
        console.log(`- Title: ${book.title}`);
        console.log(`- Slug: ${book.slug}`);
        console.log(`- Price: ${book.price}`);
      });
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProducts();
