const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function fixStemBookSlug() {
  try {
    console.log("===== FIXING STEM BOOK SLUG =====");

    // Find the book with the incorrect slug
    const book = await prisma.book.findFirst({
      where: {
        slug: "stem-play-neurodiverse-minds",
      },
    });

    if (!book) {
      console.log("❌ Book with slug 'stem-play-neurodiverse-minds' not found");
      return;
    }

    console.log(`📚 Found book: ${book.name}`);
    console.log(`🔧 Current slug: "${book.slug}"`);
    console.log(`🎯 New slug: "stem-play-for-neurodiverse-minds"`);

    // Update the slug
    const updatedBook = await prisma.book.update({
      where: {
        id: book.id,
      },
      data: {
        slug: "stem-play-for-neurodiverse-minds",
      },
    });

    console.log(`✅ Successfully updated book slug!`);
    console.log(`📝 Book: ${updatedBook.name}`);
    console.log(`🆔 ID: ${updatedBook.id}`);
    console.log(`🔗 New slug: "${updatedBook.slug}"`);

    console.log("\n🎉 Book slug fixed successfully!");
    console.log(
      "📝 Now try accessing: http://localhost:3000/products/stem-play-for-neurodiverse-minds"
    );
  } catch (error) {
    console.error("❌ Error fixing book slug:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
fixStemBookSlug();
