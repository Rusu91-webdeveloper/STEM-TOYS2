const { PrismaClient } = require("../app/generated/prisma");

const prisma = new PrismaClient();

async function main() {
  console.log("Adding books as products...");

  try {
    // First, check if "educational-books" category exists, create if not
    let educationalBooksCategory = await prisma.category.findFirst({
      where: {
        slug: "educational-books",
      },
    });

    if (!educationalBooksCategory) {
      console.log("Creating educational-books category...");
      educationalBooksCategory = await prisma.category.create({
        data: {
          name: "Educational Books",
          slug: "educational-books",
          description: "Books that educate and inspire young minds",
          isActive: true,
        },
      });
    }

    console.log("Educational books category ID:", educationalBooksCategory.id);

    // Add "Born for the Future" as a product
    const bornForFutureEnglish = await prisma.product.upsert({
      where: { slug: "born-for-the-future-english" },
      update: {},
      create: {
        name: "Born for the Future (English)",
        slug: "born-for-the-future-english",
        description:
          "This groundbreaking book explores how early exposure to STEM concepts shapes cognitive development and prepares children for success in an increasingly technology-driven world. Available in English.",
        price: 50.0,
        images: ["/born_for_the_future.png"],
        categoryId: educationalBooksCategory.id,
        tags: ["book", "educational", "english"],
        attributes: {
          language: "English",
          author: "Casey Wrenly",
          pageCount: "120",
          type: "Educational Book",
        },
        metadata: {
          title:
            "Born for the Future: Preparing Children for a STEM-Powered World (English Edition)",
          description:
            "Discover how early STEM education shapes cognitive development and prepares children for success in a technology-driven future.",
          keywords: [
            "STEM education",
            "cognitive development",
            "future-ready skills",
            "child development",
            "educational books",
          ],
          author: "Casey Wrenly",
          publisher: "STEM Toys Education",
          publicationDate: "2023-09-15",
          isbn: "978-3-16-148410-0",
          pageCount: 120,
          language: "English",
          category: "Educational Books",
          targetAudience: "Parents, Educators, STEM Enthusiasts",
        },
        isActive: true,
        featured: true,
        stockQuantity: 100,
      },
    });

    const bornForFutureRomanian = await prisma.product.upsert({
      where: { slug: "born-for-the-future-romanian" },
      update: {},
      create: {
        name: "Born for the Future (Romanian)",
        slug: "born-for-the-future-romanian",
        description:
          "This groundbreaking book explores how early exposure to STEM concepts shapes cognitive development and prepares children for success in an increasingly technology-driven world. Available in Romanian.",
        price: 50.0,
        images: ["/born_for_the_future.png"],
        categoryId: educationalBooksCategory.id,
        tags: ["book", "educational", "romanian"],
        attributes: {
          language: "Romanian",
          author: "Casey Wrenly",
          pageCount: "120",
          type: "Educational Book",
        },
        metadata: {
          title:
            "Born for the Future: Preparing Children for a STEM-Powered World (Romanian Edition)",
          description:
            "Discover how early STEM education shapes cognitive development and prepares children for success in a technology-driven future.",
          keywords: [
            "STEM education",
            "cognitive development",
            "future-ready skills",
            "child development",
            "educational books",
            "Romanian",
          ],
          author: "Casey Wrenly",
          publisher: "STEM Toys Education",
          publicationDate: "2023-09-15",
          isbn: "978-3-16-148410-1",
          pageCount: 120,
          language: "Romanian",
          category: "Educational Books",
          targetAudience: "Parents, Educators, STEM Enthusiasts",
        },
        isActive: true,
        featured: true,
        stockQuantity: 100,
      },
    });

    // Add "STEM Play for Neurodiverse Minds" as a product
    const stemPlayEnglish = await prisma.product.upsert({
      where: { slug: "stem-play-neurodiverse-minds-english" },
      update: {},
      create: {
        name: "STEM Play for Neurodiverse Minds (English)",
        slug: "stem-play-neurodiverse-minds-english",
        description:
          "This essential guide explains how specially designed STEM toys can help children with ADHD and autism develop focus, reduce anxiety, and build social skills. Available in English.",
        price: 50.0,
        images: ["/STEM_play_for_neurodiverse_minds.jpg"],
        categoryId: educationalBooksCategory.id,
        tags: ["book", "educational", "neurodiverse", "english"],
        attributes: {
          language: "English",
          author: "Casey Wrenly",
          pageCount: "150",
          type: "Educational Book",
        },
        metadata: {
          title:
            "STEM Play for Neurodiverse Minds: Supporting ADHD and Autism Through Engaged Learning (English Edition)",
          description:
            "Learn how specialized STEM activities can help neurodiverse children develop focus, reduce anxiety, and build essential skills through engaged learning.",
          keywords: [
            "neurodiversity",
            "ADHD",
            "autism",
            "STEM education",
            "special needs",
            "inclusive learning",
            "educational strategies",
          ],
          author: "Casey Wrenly",
          publisher: "STEM Toys Education",
          publicationDate: "2023-11-10",
          isbn: "978-3-16-148411-7",
          pageCount: 150,
          language: "English",
          category: "Educational Books",
          targetAudience:
            "Parents of Neurodiverse Children, Special Education Teachers, Therapists",
        },
        isActive: true,
        featured: true,
        stockQuantity: 100,
      },
    });

    const stemPlayRomanian = await prisma.product.upsert({
      where: { slug: "stem-play-neurodiverse-minds-romanian" },
      update: {},
      create: {
        name: "STEM Play for Neurodiverse Minds (Romanian)",
        slug: "stem-play-neurodiverse-minds-romanian",
        description:
          "This essential guide explains how specially designed STEM toys can help children with ADHD and autism develop focus, reduce anxiety, and build social skills. Available in Romanian.",
        price: 50.0,
        images: ["/STEM_play_for_neurodiverse_minds.jpg"],
        categoryId: educationalBooksCategory.id,
        tags: ["book", "educational", "neurodiverse", "romanian"],
        attributes: {
          language: "Romanian",
          author: "Casey Wrenly",
          pageCount: "150",
          type: "Educational Book",
        },
        metadata: {
          title:
            "STEM Play for Neurodiverse Minds: Supporting ADHD and Autism Through Engaged Learning (Romanian Edition)",
          description:
            "Learn how specialized STEM activities can help neurodiverse children develop focus, reduce anxiety, and build essential skills through engaged learning.",
          keywords: [
            "neurodiversity",
            "ADHD",
            "autism",
            "STEM education",
            "special needs",
            "inclusive learning",
            "educational strategies",
            "Romanian",
          ],
          author: "Casey Wrenly",
          publisher: "STEM Toys Education",
          publicationDate: "2023-11-10",
          isbn: "978-3-16-148411-8",
          pageCount: 150,
          language: "Romanian",
          category: "Educational Books",
          targetAudience:
            "Parents of Neurodiverse Children, Special Education Teachers, Therapists",
        },
        isActive: true,
        featured: true,
        stockQuantity: 100,
      },
    });

    console.log("Books added as products successfully:");
    console.log("- Born for the Future (English):", bornForFutureEnglish.id);
    console.log("- Born for the Future (Romanian):", bornForFutureRomanian.id);
    console.log(
      "- STEM Play for Neurodiverse Minds (English):",
      stemPlayEnglish.id
    );
    console.log(
      "- STEM Play for Neurodiverse Minds (Romanian):",
      stemPlayRomanian.id
    );
  } catch (error) {
    console.error("Error adding books as products:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
