const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function checkBooksDigitalFiles() {
  console.log("🔍 Checking books and their digital files...\n");

  try {
    // Get all active books
    const books = await prisma.book.findMany({
      where: { isActive: true },
      include: {
        digitalFiles: true,
      },
    });

    console.log(`Found ${books.length} active books\n`);

    for (const book of books) {
      console.log(`📚 Book: ${book.name}`);
      console.log(`   Author: ${book.author}`);
      console.log(`   Price: $${book.price}`);
      console.log(`   Digital Files: ${book.digitalFiles.length}`);

      if (book.digitalFiles.length === 0) {
        console.log(`   ⚠️  No digital files found - creating sample files...`);

        // Create sample digital files for books that don't have any
        const sampleFormats = [
          { format: "epub", language: "en" },
          { format: "epub", language: "ro" },
          { format: "pdf", language: "en" },
          { format: "pdf", language: "ro" },
        ];

        for (const { format, language } of sampleFormats) {
          const fileName = `${book.slug}-${language}.${format}`;
          const fileUrl = `https://uploadthing.com/sample/${fileName}`; // Sample URL

          await prisma.digitalFile.create({
            data: {
              bookId: book.id,
              fileName,
              fileUrl,
              fileSize: 1024 * 1024, // 1MB sample size
              format,
              language,
              isActive: true,
            },
          });

          console.log(`      ✅ Created: ${fileName}`);
        }
      } else {
        book.digitalFiles.forEach((file) => {
          console.log(
            `      📄 ${file.fileName} (${file.format}, ${file.language})`
          );
        });
      }
      console.log("");
    }

    // Check recent orders with books
    console.log("\n📋 Checking recent orders with books...\n");

    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        items: {
          where: { isDigital: true },
          include: {
            book: true,
            downloads: true,
          },
        },
        user: true,
      },
    });

    console.log(`Found ${recentOrders.length} recent orders\n`);

    for (const order of recentOrders) {
      const digitalItems = order.items.filter((item) => item.isDigital);
      if (digitalItems.length > 0) {
        console.log(`📦 Order: ${order.orderNumber}`);
        console.log(`   Customer: ${order.user.email}`);
        console.log(`   Digital Items: ${digitalItems.length}`);

        digitalItems.forEach((item) => {
          console.log(
            `      📚 ${item.name} (${item.downloads.length} downloads created)`
          );
        });
        console.log("");
      }
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the check
checkBooksDigitalFiles();
