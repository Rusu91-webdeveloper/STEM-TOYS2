const { PrismaClient } = require("../app/generated/prisma");

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
