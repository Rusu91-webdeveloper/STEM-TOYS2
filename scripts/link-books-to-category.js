const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function linkBooksToCategory() {
  try {
    console.log("===== LINKING BOOKS TO EDUCATIONAL BOOKS CATEGORY =====");

    // Get the Educational Books category
    const educationalBooksCategory = await prisma.category.findUnique({
      where: { slug: "educational-books" },
    });

    if (!educationalBooksCategory) {
      console.error("❌ Educational Books category not found!");
      return false;
    }

    console.log(
      `📚 Found Educational Books category: ${educationalBooksCategory.name} (${educationalBooksCategory.id})`
    );

    // Get all books
    const books = await prisma.book.findMany({
      include: {
        languages: true,
      },
    });

    console.log(`📖 Found ${books.length} books in database`);

    if (books.length === 0) {
      console.log("⚠️  No books found to link to categories");
      return true;
    }

    // Create corresponding products for books in the Educational Books category
    for (const book of books) {
      console.log(`\n📚 Processing book: ${book.name}`);

      // Check if a product already exists for this book
      const existingProduct = await prisma.product.findFirst({
        where: {
          name: book.name,
        },
      });

      if (existingProduct) {
        console.log(
          `   ✅ Product already exists: ${existingProduct.name} (${existingProduct.id})`
        );

        // Update the existing product to ensure it's in the right category
        if (existingProduct.categoryId !== educationalBooksCategory.id) {
          await prisma.product.update({
            where: { id: existingProduct.id },
            data: { categoryId: educationalBooksCategory.id },
          });
          console.log(`   🔄 Updated product category`);
        }
      } else {
        // Create a product entry for this book
        const product = await prisma.product.create({
          data: {
            name: book.name,
            slug: book.slug,
            description: book.description,
            price: book.price,
            categoryId: educationalBooksCategory.id,
            images: book.coverImage ? [book.coverImage] : [],
            tags: ["book", "educational", "digital"],
            isActive: book.isActive,
            stockQuantity: 999, // Digital books have unlimited stock
            featured: true, // Make books featured
            attributes: {
              type: "digital-book",
              author: book.author,
              formats: ["EPUB", "KBP"],
              languages: book.languages.map((lang) => lang.name),
            },
          },
        });

        console.log(`   ✅ Created product: ${product.name} (${product.id})`);
      }
    }

    console.log(
      "\n✅ Books successfully linked to Educational Books category!"
    );
    return true;
  } catch (error) {
    console.error("Error linking books to category:", error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Main function
async function main() {
  await linkBooksToCategory();

  // Show final status
  console.log("\n===== FINAL STATUS =====");

  const categoryWithProducts = await prisma.category.findUnique({
    where: { slug: "educational-books" },
    include: {
      _count: {
        select: { products: true },
      },
    },
  });

  console.log(
    `📚 Educational Books category now has ${categoryWithProducts._count.products} products`
  );

  const books = await prisma.book.findMany({
    select: { name: true },
  });

  console.log(`📖 Total books in database: ${books.length}`);
  books.forEach((book, index) => {
    console.log(`   ${index + 1}. ${book.name}`);
  });
}

main().catch(console.error);
