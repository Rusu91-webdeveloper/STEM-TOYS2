import { PrismaClient } from "../app/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  // Create STEM categories
  const categories = [
    {
      name: "Science",
      slug: "science",
      description:
        "Educational toys that teach scientific principles and encourage exploration",
      image: "https://placehold.co/800x600/10B981/FFFFFF.png?text=Science",
    },
    {
      name: "Technology",
      slug: "technology",
      description:
        "Toys that introduce children to coding, robotics, and digital literacy",
      image: "https://placehold.co/800x600/4F46E5/FFFFFF.png?text=Technology",
    },
    {
      name: "Engineering",
      slug: "engineering",
      description:
        "Building kits and construction toys that develop problem-solving skills",
      image: "https://placehold.co/800x600/F59E0B/FFFFFF.png?text=Engineering",
    },
    {
      name: "Mathematics",
      slug: "mathematics",
      description:
        "Games and puzzles that make learning math concepts fun and engaging",
      image: "https://placehold.co/800x600/3B82F6/FFFFFF.png?text=Mathematics",
    },
  ];

  console.log("Starting to seed categories...");

  for (const category of categories) {
    const existingCategory = await prisma.category.findUnique({
      where: { slug: category.slug },
    });

    if (!existingCategory) {
      const createdCategory = await prisma.category.create({
        data: category,
      });
      console.log(`Created category: ${createdCategory.name}`);
    } else {
      console.log(`Category ${category.name} already exists`);
    }
  }

  console.log("Seeding completed.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
