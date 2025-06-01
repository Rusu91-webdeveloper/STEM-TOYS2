import { PrismaClient } from "../app/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding books...");

  try {
    // Create "Born for the Future" book
    const bornForTheFuture = await prisma.book.create({
      data: {
        name: "Born for the Future",
        slug: "born-for-the-future",
        author: "Casey Wrenly",
        description:
          "This groundbreaking book explores how early exposure to STEM concepts shapes cognitive development and prepares children for success in an increasingly technology-driven world. It eloquently illustrates how STEM toys are not just about technical skills; they are powerful catalysts for fostering essential human capabilities like critical thinking, problem-solving, and creativity.",
        price: 50, // 50 lei
        coverImage: "/born_for_the_future.png",
        metadata: {
          title:
            "Born for the Future: Preparing Children for a STEM-Powered World",
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
          language: ["English", "Romanian"],
          category: "Educational Books",
          targetAudience: "Parents, Educators, STEM Enthusiasts",
        },
        languages: {
          create: [
            {
              name: "English",
              code: "en-born-for-future",
              isAvailable: true,
            },
            {
              name: "Romanian",
              code: "ro-born-for-future",
              isAvailable: true,
            },
          ],
        },
      },
    });

    // Create "STEM Play for Neurodiverse Minds" book
    const stemPlayNeurodiverse = await prisma.book.create({
      data: {
        name: "STEM Play for Neurodiverse Minds",
        slug: "stem-play-for-neurodiverse-minds",
        author: "Casey Wrenly",
        description:
          "This essential guide explains how specially designed STEM toys can help children with ADHD and autism develop focus, reduce anxiety, and build social skills. It emphasizes understanding each child's individual way of thinking and learning, and leveraging their special interests to make STEM exploration a truly engaging experience.",
        price: 50, // 50 lei
        coverImage: "/STEM_play_for_neurodiverse_minds.jpg",
        metadata: {
          title:
            "STEM Play for Neurodiverse Minds: Supporting ADHD and Autism Through Engaged Learning",
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
          language: ["English", "Romanian"],
          category: "Educational Books",
          targetAudience:
            "Parents of Neurodiverse Children, Special Education Teachers, Therapists",
        },
        languages: {
          create: [
            {
              name: "English",
              code: "en-stem-play-neurodiverse",
              isAvailable: true,
            },
            {
              name: "Romanian",
              code: "ro-stem-play-neurodiverse",
              isAvailable: true,
            },
          ],
        },
      },
    });

    console.log("Books created successfully:");
    console.log("- Born for the Future:", bornForTheFuture.id);
    console.log("- STEM Play for Neurodiverse Minds:", stemPlayNeurodiverse.id);
  } catch (error) {
    console.error("Error seeding books:", error);
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
