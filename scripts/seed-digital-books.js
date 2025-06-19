const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function seedDigitalBooks() {
  try {
    console.log("===== SEEDING DIGITAL BOOKS =====");

    // Get the English and Romanian languages
    let englishLang = await prisma.language.findFirst({
      where: { code: "en" },
    });

    let romanianLang = await prisma.language.findFirst({
      where: { code: "ro" },
    });

    // Create languages if they don't exist
    if (!englishLang) {
      englishLang = await prisma.language.create({
        data: {
          name: "English",
          code: "en",
          nativeName: "English",
        },
      });
      console.log("Created English language");
    }

    if (!romanianLang) {
      romanianLang = await prisma.language.create({
        data: {
          name: "Romanian",
          code: "ro",
          nativeName: "Română",
        },
      });
      console.log("Created Romanian language");
    }

    // Digital books data
    const digitalBooks = [
      {
        name: "Born for the Future",
        slug: "born-for-the-future",
        author: "TechTots Educational Team",
        description:
          "This innovative book explores how early exposure to STEM concepts shapes cognitive development and prepares children for success in an increasingly technology-oriented world.",
        price: 24.99,
        coverImage: "/born_for_the_future.png",
        isDigital: true,
        isActive: true,
        languages: [englishLang.id, romanianLang.id],
        metadata: {
          title: "Born for the Future - Digital Educational Book",
          description:
            "An inspiring book that prepares children for the technological world of tomorrow through engaging stories and activities.",
          keywords: [
            "future skills",
            "STEM education",
            "educational book",
            "cognitive development",
            "technology",
            "child development",
          ],
          ogImage: "/born_for_the_future.png",
        },
      },
      {
        name: "STEM Play for Neurodiverse Minds",
        slug: "stem-play-for-neurodiverse-minds",
        author: "TechTots Educational Team",
        description:
          "This essential guide explains how specially designed STEM toys can help children with ADHD and autism develop focus, reduce anxiety, and build social skills.",
        price: 29.99,
        coverImage: "/STEM_play_for_neurodiverse_minds.jpg",
        isDigital: true,
        isActive: true,
        languages: [englishLang.id, romanianLang.id],
        metadata: {
          title: "STEM Play for Neurodiverse Minds - Educational Book",
          description:
            "A comprehensive guide to engaging neurodiverse children with STEM activities that promote learning through play.",
          keywords: [
            "neurodiversity",
            "STEM education",
            "educational book",
            "autism",
            "ADHD",
            "learning disabilities",
          ],
          ogImage: "/STEM_play_for_neurodiverse_minds.jpg",
        },
      },
    ];

    let created = 0;
    let existing = 0;

    // Process each book
    for (const bookData of digitalBooks) {
      // Extract languages before creating book
      const languageIds = bookData.languages;
      delete bookData.languages;

      // Check if book already exists
      const existingBook = await prisma.book.findFirst({
        where: { slug: bookData.slug },
      });

      if (!existingBook) {
        // Create the book
        const createdBook = await prisma.book.create({
          data: {
            ...bookData,
            languages: {
              connect: languageIds.map((id) => ({ id })),
            },
          },
        });
        console.log(`✅ Created digital book: ${createdBook.name}`);
        created++;
      } else {
        console.log(`📚 Book ${bookData.name} already exists`);
        existing++;
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`✅ Created ${created} new digital books`);
    console.log(`📚 ${existing} already existed`);
    console.log("🎉 Digital books seeding completed successfully!");
    console.log("\n📝 Next steps:");
    console.log("1. Go to http://localhost:3000/admin");
    console.log("2. Click 'Books' in the sidebar");
    console.log(
      "3. Click 'Fișiere Digitale' on any book to upload EPUB/KBP files"
    );
  } catch (error) {
    console.error("❌ Error seeding digital books:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding function
if (require.main === module) {
  seedDigitalBooks()
    .then(() => {
      console.log("✅ Seeding completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Seeding failed:", error);
      process.exit(1);
    });
}

module.exports = { seedDigitalBooks };
