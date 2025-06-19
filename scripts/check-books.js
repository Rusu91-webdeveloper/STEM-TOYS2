const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function checkBooks() {
  try {
    console.log("===== CHECKING BOOKS IN DATABASE =====");

    const books = await prisma.book.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        isActive: true,
        author: true,
      },
    });

    console.log(`Found ${books.length} books:`);
    books.forEach((book, index) => {
      console.log(`${index + 1}. ${book.name}`);
      console.log(`   - ID: ${book.id}`);
      console.log(`   - Slug: ${book.slug}`);
      console.log(`   - Author: ${book.author}`);
      console.log(`   - Active: ${book.isActive}`);
      console.log("");
    });

    // Also check if there are any products
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        isActive: true,
      },
    });

    console.log(`Found ${products.length} products:`);
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   - ID: ${product.id}`);
      console.log(`   - Slug: ${product.slug}`);
      console.log(`   - Active: ${product.isActive}`);
      console.log("");
    });
  } catch (error) {
    console.error("Error checking books:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
checkBooks();
