const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function seedEducationalBooks() {
  try {
    console.log("===== SEEDING EDUCATIONAL BOOKS =====");

    // Get or create educational books category
    let educationalBooksCategory = await prisma.category.findFirst({
      where: { slug: "educational-books" },
    });

    if (!educationalBooksCategory) {
      educationalBooksCategory = await prisma.category.create({
        data: {
          name: "Educational Books",
          slug: "educational-books",
          description: "Educational books that inspire young minds",
          image: "/images/category_banner_books_01.jpg",
        },
      });
      console.log("Created Educational Books category");
    }

    // Educational books products
    const books = [
      {
        name: "STEM Play for Neurodiverse Minds (English)",
        slug: "stem-play-neurodiverse-minds-english",
        description:
          "This essential guide explains how specially designed STEM toys can help children with ADHD and autism develop focus, reduce anxiety, and build social skills. Available in English.",
        price: 29.99,
        compareAtPrice: 39.99,
        images: ["/STEM_play_for_neurodiverse_minds.jpg"],
        categoryId: educationalBooksCategory.id,
        tags: ["book", "educational", "english", "neurodiversity", "STEM"],
        attributes: {
          author: "TechTots Educational Team",
          language: "English",
          pages: 120,
          type: "Educational Book",
          format: "Digital Download",
          targetAge: "Parents and Educators",
        },
        metadata: {
          title:
            "STEM Play for Neurodiverse Minds (English) - Educational Book",
          description:
            "A comprehensive guide to engaging neurodiverse children with STEM activities that promote learning through play. Available in English.",
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
        stockQuantity: 1000,
        weight: 0.1,
        sku: "BOOK-STEM-NEU-EN",
        barcode: "9781234567890",
        isActive: true,
        featured: true,
      },
      {
        name: "STEM Play for Neurodiverse Minds (Romanian)",
        slug: "stem-play-neurodiverse-minds-romanian",
        description:
          "Acest ghid esențial explică modul în care jucăriile STEM special concepute pot ajuta copiii cu ADHD și autism să dezvolte concentrarea, să reducă anxietatea și să construiască abilități sociale. Disponibil în Română.",
        price: 29.99,
        compareAtPrice: 39.99,
        images: ["/STEM_play_for_neurodiverse_minds.jpg"],
        categoryId: educationalBooksCategory.id,
        tags: ["carte", "educațională", "română", "neurodiversitate", "STEM"],
        attributes: {
          author: "Echipa Educațională TechTots",
          language: "Română",
          pages: 120,
          type: "Carte Educațională",
          format: "Descărcare Digitală",
          targetAge: "Părinți și Educatori",
        },
        metadata: {
          title:
            "Joacă STEM pentru Minți Neurodiverse (Română) - Carte Educațională",
          description:
            "Un ghid cuprinzător pentru implicarea copiilor neurodiverși cu activități STEM care promovează învățarea prin joacă. Disponibil în română.",
          keywords: [
            "neurodiversitate",
            "educație STEM",
            "carte educațională",
            "autism",
            "ADHD",
            "dificultăți de învățare",
          ],
          ogImage: "/STEM_play_for_neurodiverse_minds.jpg",
        },
        stockQuantity: 1000,
        weight: 0.1,
        sku: "BOOK-STEM-NEU-RO",
        barcode: "9781234567891",
        isActive: true,
        featured: true,
      },
      {
        name: "Born for the Future (English)",
        slug: "born-for-the-future-english",
        description:
          "This innovative book explores how early exposure to STEM concepts shapes cognitive development and prepares children for success in an increasingly technology-oriented world. Available in English.",
        price: 24.99,
        compareAtPrice: 34.99,
        images: ["/born_for_the_future.png"],
        categoryId: educationalBooksCategory.id,
        tags: [
          "book",
          "educational",
          "english",
          "future",
          "STEM",
          "development",
        ],
        attributes: {
          author: "TechTots Educational Team",
          language: "English",
          pages: 150,
          type: "Educational Book",
          format: "Digital Download",
          targetAge: "Parents and Educators",
        },
        metadata: {
          title: "Born for the Future (English) - Educational Book",
          description:
            "An inspiring book that prepares children for the technological world of tomorrow through engaging stories and activities. Available in English.",
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
        stockQuantity: 1000,
        weight: 0.1,
        sku: "BOOK-FUTURE-EN",
        barcode: "9781234567892",
        isActive: true,
        featured: true,
      },
      {
        name: "Born for the Future (Romanian)",
        slug: "born-for-the-future-romanian",
        description:
          "Această carte inovatoare explorează modul în care expunerea timpurie la concepte STEM modelează dezvoltarea cognitivă și pregătește copiii pentru succes într-o lume din ce în ce mai orientată spre tehnologie. Disponibilă în Română.",
        price: 24.99,
        compareAtPrice: 34.99,
        images: ["/born_for_the_future_ro.png"],
        categoryId: educationalBooksCategory.id,
        tags: [
          "carte",
          "educațională",
          "română",
          "viitor",
          "STEM",
          "dezvoltare",
        ],
        attributes: {
          author: "Echipa Educațională TechTots",
          language: "Română",
          pages: 150,
          type: "Carte Educațională",
          format: "Descărcare Digitală",
          targetAge: "Părinți și Educatori",
        },
        metadata: {
          title: "Născut pentru Viitor (Română) - Carte Educațională",
          description:
            "O carte inspirațională care pregătește copiii pentru lumea tehnologică de mâine prin povești și activități captivante. Disponibilă în română.",
          keywords: [
            "abilități de viitor",
            "educație STEM",
            "carte educațională",
            "dezvoltare cognitivă",
            "tehnologie",
            "dezvoltarea copilului",
          ],
          ogImage: "/born_for_the_future_ro.png",
        },
        stockQuantity: 1000,
        weight: 0.1,
        sku: "BOOK-FUTURE-RO",
        barcode: "9781234567893",
        isActive: true,
        featured: true,
      },
    ];

    // Keep track of created books
    let created = 0;
    let existing = 0;

    // Process each book
    for (const book of books) {
      // Check if book already exists
      const existingBook = await prisma.product.findUnique({
        where: { slug: book.slug },
      });

      if (!existingBook) {
        // Create the book
        const createdBook = await prisma.product.create({
          data: book,
        });
        console.log(`Created book: ${createdBook.name}`);
        created++;
      } else {
        console.log(`Book ${book.name} already exists`);
        existing++;
      }
    }

    console.log(
      `\nSummary: Created ${created} new books, ${existing} already existed.`
    );
    console.log("Educational books seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding educational books:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding function
seedEducationalBooks();
