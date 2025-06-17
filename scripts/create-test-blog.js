const { PrismaClient } = require("../app/generated/prisma");
const prisma = new PrismaClient();

/**
 * Create test blog posts to test the newsletter email template
 */
async function createTestBlogs() {
  try {
    console.log("===== CREATING TEST BLOG POSTS =====");

    // Check if we already have published blogs
    const existingBlogs = await prisma.blog.findMany({
      where: { isPublished: true },
      select: { id: true, title: true },
    });

    console.log(`Found ${existingBlogs.length} existing published blogs.`);

    if (existingBlogs.length > 0) {
      existingBlogs.forEach((blog) => {
        console.log(`- ${blog.title} (${blog.id})`);
      });
      console.log("\nUsing existing blogs for testing.");
      return;
    }

    // Get a user for the author
    let author = await prisma.user.findFirst({
      where: { role: "ADMIN" },
    });

    if (!author) {
      console.log("No admin user found. Creating a test user...");
      author = await prisma.user.create({
        data: {
          name: "Test Admin",
          email: "admin@example.com",
          role: "ADMIN",
          emailVerified: new Date(),
        },
      });
    }

    // Get a category or create one
    let scienceCategory = await prisma.category.findFirst({
      where: { name: "Science" },
    });

    if (!scienceCategory) {
      console.log("No science category found. Creating one...");
      scienceCategory = await prisma.category.create({
        data: {
          name: "Science",
          slug: "science",
          description:
            "Explore the wonders of science with our educational toys",
        },
      });
    }

    let techCategory = await prisma.category.findFirst({
      where: { name: "Technology" },
    });

    if (!techCategory) {
      console.log("No technology category found. Creating one...");
      techCategory = await prisma.category.create({
        data: {
          name: "Technology",
          slug: "technology",
          description: "Discover technology through play and learning",
        },
      });
    }

    // Create two test blog posts
    const blog1 = await prisma.blog.create({
      data: {
        title: "Benefits of STEM Toys for Early Childhood Development",
        slug: "benefits-of-stem-toys-early-childhood",
        excerpt:
          "Discover how STEM toys can boost cognitive development in young children.",
        content: `
# Benefits of STEM Toys for Early Childhood Development

STEM toys are designed to teach children about science, technology, engineering, and mathematics in an engaging and fun way. These educational toys offer numerous benefits for early childhood development.

## Cognitive Development

STEM toys encourage problem-solving, critical thinking, and logical reasoning. When children play with these toys, they learn to:

- Identify patterns
- Understand cause and effect
- Develop spatial awareness
- Improve memory and concentration

## Creativity and Innovation

Contrary to popular belief, STEM toys actually foster creativity. They provide children with tools and components that can be used in multiple ways, encouraging them to:

- Think outside the box
- Create new solutions
- Experiment with different approaches
- Express their ideas through building and creating

## Early Math and Science Skills

Through play, children naturally develop foundational math and science concepts:

- Counting and number recognition
- Basic geometry and spatial relationships
- Simple physics concepts
- Classification and sorting

## Social Skills and Collaboration

Many STEM activities are designed for group play, helping children develop:

- Communication skills
- Teamwork and cooperation
- Sharing and taking turns
- Leadership abilities

## Conclusion

Introducing STEM toys early in a child's life can set them up for future academic success while making learning enjoyable. The skills developed through STEM play are valuable not just for future careers in science and technology, but for overall cognitive and social development.
        `,
        coverImage:
          "https://images.unsplash.com/photo-1485827404703-89b55fcc595e",
        isPublished: true,
        publishedAt: new Date(),
        stemCategory: "SCIENCE",
        authorId: author.id,
        categoryId: scienceCategory.id,
        metadata: {
          metaTitle:
            "Benefits of STEM Toys for Early Childhood Development | TechTots",
          metaDescription:
            "Discover how STEM toys can boost cognitive development, creativity, and problem-solving skills in young children.",
          keywords: [
            "STEM toys",
            "childhood development",
            "educational toys",
            "cognitive skills",
          ],
        },
      },
    });

    const blog2 = await prisma.blog.create({
      data: {
        title: "Top 10 Coding Toys for Elementary School Children",
        slug: "top-coding-toys-elementary-school",
        excerpt:
          "Explore the best coding toys that make programming fun for kids aged 6-12.",
        content: `
# Top 10 Coding Toys for Elementary School Children

Introducing coding concepts early helps children develop computational thinking and problem-solving skills. Here are our top picks for coding toys that make programming accessible and fun for elementary school children.

## 1. Robot Programmers

- **Botley the Coding Robot**: Screen-free coding that teaches basic programming through a simple remote control.
- **Dash Robot**: An app-controlled robot that responds to voice and navigates objects.

## 2. Building and Coding Sets

- **LEGO Boost Creative Toolbox**: Combines building with coding through an intuitive app.
- **Osmo Coding Starter Kit**: Uses physical blocks to control characters on a tablet screen.

## 3. Board Games

- **Robot Turtles**: A board game that teaches programming fundamentals without screens.
- **Code Master**: A logic game that builds coding skills through puzzles.

## 4. Coding Wands and Blocks

- **Kano Harry Potter Coding Kit**: Build a wand that responds to movement to complete coding challenges.
- **Cubetto**: A wooden robot controlled by placing colored blocks on a board.

## 5. Advanced Options

- **micro:bit**: A pocket-sized computer that can be programmed for various projects.
- **Raspberry Pi Starter Kit**: An affordable computer designed to teach programming and electronics.

## Why These Toys Work

These toys succeed because they:

- Make abstract concepts tangible
- Provide immediate feedback
- Blend play with learning
- Grow with the child's abilities
- Encourage creativity alongside logic

## Conclusion

The best coding toys don't just teach programming—they foster creativity, persistence, and logical thinking. By introducing these toys during elementary school years, parents and educators can help children develop crucial skills for the digital age while having fun in the process.
        `,
        coverImage: "https://images.unsplash.com/photo-1555774698-0b77e0d5fac6",
        isPublished: true,
        publishedAt: new Date(),
        stemCategory: "TECHNOLOGY",
        authorId: author.id,
        categoryId: techCategory.id,
        metadata: {
          metaTitle:
            "Top 10 Coding Toys for Elementary School Children | TechTots",
          metaDescription:
            "Discover the best coding toys that make programming fun and accessible for elementary school children aged 6-12.",
          keywords: [
            "coding toys",
            "programming for kids",
            "STEM education",
            "educational technology",
          ],
        },
      },
    });

    console.log("\n✅ Successfully created test blog posts:");
    console.log(`1. ${blog1.title}`);
    console.log(`2. ${blog2.title}`);
  } catch (error) {
    console.error("Error creating test blogs:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestBlogs();
