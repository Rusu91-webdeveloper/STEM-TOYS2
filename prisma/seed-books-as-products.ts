import { PrismaClient } from "../app/generated/prisma";

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
