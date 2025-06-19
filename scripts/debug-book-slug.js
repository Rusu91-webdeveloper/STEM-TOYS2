const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function debugBookSlugs() {
  try {
    console.log("===== DEBUGGING BOOK SLUGS =====");

    const books = await prisma.book.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        isActive: true,
      },
    });

    console.log(`Found ${books.length} books:`);

    books.forEach((book, index) => {
      console.log(`\n${index + 1}. ${book.name}`);
      console.log(`   - ID: ${book.id}`);
      console.log(`   - Slug: "${book.slug}"`);
      console.log(`   - Slug length: ${book.slug.length}`);
      console.log(`   - Slug bytes:`, Buffer.from(book.slug, "utf8"));
      console.log(
        `   - Slug char codes:`,
        [...book.slug].map((c) => c.charCodeAt(0))
      );
      console.log(`   - Active: ${book.isActive}`);

      // Check for problematic characters
      const problematicChars = book.slug.match(/[^\w-]/g);
      if (problematicChars) {
        console.log(`   - ⚠️  Problematic characters found:`, problematicChars);
      }

      // Check for invisible characters
      const hasInvisible = book.slug !== book.slug.trim();
      if (hasInvisible) {
        console.log(`   - ⚠️  Invisible characters detected!`);
      }
    });

    // Test direct queries
    console.log("\n===== TESTING DIRECT QUERIES =====");

    const testSlug = "stem-play-for-neurodiverse-minds";
    console.log(`\nTesting slug: "${testSlug}"`);
    console.log(`Test slug length: ${testSlug.length}`);
    console.log(
      `Test slug char codes:`,
      [...testSlug].map((c) => c.charCodeAt(0))
    );

    // Try findFirst
    const findFirstResult = await prisma.book.findFirst({
      where: {
        slug: testSlug,
      },
    });
    console.log(
      `findFirst result:`,
      findFirstResult ? `Found: ${findFirstResult.name}` : "Not found"
    );

    // Try findUnique
    const findUniqueResult = await prisma.book.findUnique({
      where: {
        slug: testSlug,
      },
    });
    console.log(
      `findUnique result:`,
      findUniqueResult ? `Found: ${findUniqueResult.name}` : "Not found"
    );

    // Try with contains
    const containsResult = await prisma.book.findFirst({
      where: {
        slug: {
          contains: testSlug,
        },
      },
    });
    console.log(
      `contains result:`,
      containsResult ? `Found: ${containsResult.name}` : "Not found"
    );

    // Try raw query
    const rawResult = await prisma.$queryRaw`
      SELECT id, name, slug FROM "Book" 
      WHERE slug = ${testSlug}
    `;
    console.log(
      `Raw SQL result:`,
      rawResult.length > 0 ? `Found: ${rawResult[0].name}` : "Not found"
    );
  } catch (error) {
    console.error("Error debugging book slugs:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
debugBookSlugs();
