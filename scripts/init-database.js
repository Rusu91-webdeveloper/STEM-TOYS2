// Script to initialize the database with admin user, categories, products, and blogs
// Execute with: node scripts/init-database.js
const { PrismaClient } = require("../app/generated/prisma");
const bcrypt = require("bcrypt");
require("dotenv").config();

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Starting database initialization...");

  try {
    // 1. Create Admin User
    console.log("\n📝 Creating admin user...");
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminName = process.env.ADMIN_NAME || "Admin User";
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.error("Admin credentials not set in environment variables.");
      console.error(
        "Please set ADMIN_EMAIL, ADMIN_NAME, and ADMIN_PASSWORD in your .env file."
      );
      console.log("Skipping admin user creation...");
    } else {
      const existingAdmin = await prisma.user.findUnique({
        where: { email: adminEmail },
      });

      let adminUser;
      if (existingAdmin) {
        console.log(
          `Admin user already exists: ${adminEmail}. Updating role and activating...`
        );

        adminUser = await prisma.user.update({
          where: { email: adminEmail },
          data: {
            name: adminName,
            role: "ADMIN",
            isActive: true,
            emailVerified: new Date(),
          },
        });

        console.log(`✅ Updated admin user: ${adminUser.email}`);
      } else {
        // Create the admin user
        const hashedPassword = await bcrypt.hash(adminPassword, 12);

        adminUser = await prisma.user.create({
          data: {
            name: adminName,
            email: adminEmail,
            password: hashedPassword,
            role: "ADMIN",
            isActive: true,
            emailVerified: new Date(),
          },
        });

        console.log(`✅ Created admin user: ${adminUser.email}`);
      }
    }

    // 2. Create Categories
    console.log("\n📝 Creating categories...");

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
        image:
          "https://placehold.co/800x600/F59E0B/FFFFFF.png?text=Engineering",
      },
      {
        name: "Mathematics",
        slug: "mathematics",
        description:
          "Games and puzzles that make learning math concepts fun and engaging",
        image:
          "https://placehold.co/800x600/3B82F6/FFFFFF.png?text=Mathematics",
      },
    ];

    const categoryMap = new Map();

    for (const category of categories) {
      const existingCategory = await prisma.category.findUnique({
        where: { slug: category.slug },
      });

      if (!existingCategory) {
        const createdCategory = await prisma.category.create({
          data: category,
        });
        console.log(`✅ Created category: ${createdCategory.name}`);
        categoryMap.set(category.slug, createdCategory.id);
      } else {
        console.log(`Category ${category.name} already exists`);
        categoryMap.set(category.slug, existingCategory.id);
      }
    }

    // 3. Create Products
    console.log("\n📝 Creating products...");

    const products = [
      {
        name: "Chemistry Lab Kit",
        slug: "chemistry-lab-kit",
        description:
          "A comprehensive chemistry set for young scientists to conduct safe and exciting experiments at home. Includes 30+ experiments with detailed instructions.",
        price: 49.99,
        compareAtPrice: 59.99,
        images: [
          "https://placehold.co/800x600/10B981/FFFFFF.png?text=Chemistry+Kit+1",
          "https://placehold.co/800x600/10B981/FFFFFF.png?text=Chemistry+Kit+2",
        ],
        categoryId: categoryMap.get("science"),
        tags: ["chemistry", "experiments", "educational", "8-12 years"],
        attributes: {
          age: "8-12 years",
          pieces: 45,
          difficulty: "Intermediate",
          safetyRating: "Non-toxic materials",
          metaTitle:
            "Chemistry Lab Kit for Kids - STEM Educational Science Set",
          metaDescription:
            "Introduce your child to the wonders of chemistry with our safe, educational lab kit designed for ages 8-12.",
          metaKeywords: ["chemistry set", "science kit", "educational toys"],
        },
        stockQuantity: 75,
        isActive: true,
      },
      {
        name: "Coding Robot for Beginners",
        slug: "coding-robot-beginners",
        description:
          "An interactive robot that teaches coding fundamentals through play. Perfect for beginners with no prior coding experience.",
        price: 89.99,
        compareAtPrice: 99.99,
        images: [
          "https://placehold.co/800x600/4F46E5/FFFFFF.png?text=Coding+Robot+1",
          "https://placehold.co/800x600/4F46E5/FFFFFF.png?text=Coding+Robot+2",
        ],
        categoryId: categoryMap.get("technology"),
        tags: ["coding", "robotics", "programming", "tech", "6+ years"],
        attributes: {
          age: "6+ years",
          programmingMethod: "Block-based and remote control",
          batteryLife: "4 hours",
          connectivity: "Bluetooth",
          metaTitle:
            "Kids Coding Robot for Beginners - Learn Programming Through Play",
          metaDescription:
            "Introduce your child to coding with our beginner-friendly robot. Perfect for ages 6+ to learn programming basics.",
          metaKeywords: [
            "coding for kids",
            "learn programming",
            "robotics for beginners",
          ],
        },
        stockQuantity: 50,
        isActive: true,
      },
      {
        name: "Bridge Builder Engineering Kit",
        slug: "bridge-builder-kit",
        description:
          "Build and test different bridge designs with this comprehensive engineering kit. Learn about structural principles and engineering design.",
        price: 34.99,
        compareAtPrice: 44.99,
        images: [
          "https://placehold.co/800x600/F59E0B/FFFFFF.png?text=Bridge+Kit+1",
          "https://placehold.co/800x600/F59E0B/FFFFFF.png?text=Bridge+Kit+2",
        ],
        categoryId: categoryMap.get("engineering"),
        tags: ["engineering", "construction", "bridges", "physics", "9+ years"],
        attributes: {
          age: "9+ years",
          pieces: 120,
          difficulty: "Intermediate",
          materialType: "High-quality plastic and wood",
          metaTitle:
            "Bridge Builder Engineering Kit - STEM Construction Toy Set",
          metaDescription:
            "Learn civil engineering concepts by building various bridge designs. Hands-on kit for ages 9 and up.",
          metaKeywords: [
            "engineering kit",
            "bridge building set",
            "structural engineering",
          ],
        },
        stockQuantity: 60,
        isActive: true,
      },
      {
        name: "Mathematical Puzzle Cube Set",
        slug: "math-puzzle-cube-set",
        description:
          "A collection of 5 mathematical puzzle cubes with varying difficulty levels. Develops spatial reasoning and mathematical thinking.",
        price: 29.99,
        compareAtPrice: 39.99,
        images: [
          "https://placehold.co/800x600/3B82F6/FFFFFF.png?text=Math+Puzzles+1",
          "https://placehold.co/800x600/3B82F6/FFFFFF.png?text=Math+Puzzles+2",
        ],
        categoryId: categoryMap.get("mathematics"),
        tags: [
          "mathematics",
          "puzzles",
          "logic",
          "spatial reasoning",
          "7+ years",
        ],
        attributes: {
          age: "7+ years",
          pieces: 5,
          difficulty: "Easy to Advanced",
          materialType: "ABS Plastic",
          metaTitle: "Mathematical Puzzle Cube Set - Brain Teasers for Kids",
          metaDescription:
            "Develop spatial reasoning and problem-solving with our set of 5 mathematical puzzle cubes of varying difficulty.",
          metaKeywords: ["math puzzles", "brain teasers", "spatial reasoning"],
        },
        stockQuantity: 100,
        isActive: true,
      },
    ];

    for (const product of products) {
      const existingProduct = await prisma.product.findUnique({
        where: { slug: product.slug },
      });

      if (!existingProduct) {
        const createdProduct = await prisma.product.create({
          data: product,
        });
        console.log(`✅ Created product: ${createdProduct.name}`);
      } else {
        console.log(`Product ${product.name} already exists`);
      }
    }

    // 4. Create Blog Posts
    console.log("\n📝 Creating blog posts...");

    const blogs = [
      {
        title: "Why STEM Education Matters for Your Child's Future",
        slug: "why-stem-education-matters",
        excerpt:
          "Discover how STEM education prepares children for the jobs of tomorrow and develops critical thinking skills.",
        content: `
# Why STEM Education Matters for Your Child's Future

STEM education is more important than ever in today's rapidly changing world. By introducing children to Science, Technology, Engineering, and Mathematics in an integrated way, we're preparing them for future careers that may not even exist yet.

## Key Benefits of STEM Education

- **Critical Thinking Skills**: STEM activities encourage children to think critically about problems and find creative solutions.
- **Future Career Preparation**: Many of the fastest-growing careers require STEM skills.
- **Real-World Application**: STEM teaches children to apply classroom knowledge to real-world situations.
- **Collaboration Skills**: Many STEM activities involve teamwork, teaching valuable social skills.

## How to Get Started with STEM at Home

1. Start with simple science experiments using household items
2. Introduce age-appropriate coding games and apps
3. Build structures with blocks, LEGO, or recycled materials
4. Practice math through cooking, shopping, or board games

Remember, STEM education isn't just about preparing for careers—it's about developing a mindset of curiosity, experimentation, and problem-solving that will benefit children throughout their lives.
        `,
        coverImage:
          "https://placehold.co/1200x630/10B981/FFFFFF.png?text=STEM+Education",
        categoryId: categoryMap.get("science"),
        authorId: adminUser.id,
        tags: [
          "STEM education",
          "parenting",
          "future skills",
          "child development",
        ],
        metadata: {
          metaTitle:
            "Why STEM Education Matters for Your Child's Future | STEM Toys Blog",
          metaDescription:
            "Learn how STEM education develops crucial skills and prepares children for future careers in our increasingly technological world.",
          metaKeywords: [
            "STEM education",
            "future skills",
            "child development",
          ],
        },
        isPublished: true,
        publishedAt: new Date(),
      },
      {
        title: "Top 5 Coding Toys That Make Programming Fun for Kids",
        slug: "top-coding-toys-for-kids",
        excerpt:
          "Explore the best coding toys that introduce programming concepts to children through play and creativity.",
        content: `
# Top 5 Coding Toys That Make Programming Fun for Kids

Introducing children to coding at an early age can set them up for success in our digital world. But learning to code doesn't have to involve sitting at a computer for hours. These interactive toys make coding concepts accessible and fun!

## Our Top Picks

### 1. Coding Robot for Beginners
Perfect for ages 6+, this robot introduces basic programming through a simple block-based interface. Kids can program movements, lights, and sounds without any prior experience.

### 2. Coding Card Game
This screen-free option teaches computational thinking through a card game format. Great for family game night!

### 3. Circuit Building Kit
While not strictly a coding toy, this kit introduces the hardware side of technology through safe, snap-together electronic components.

### 4. Coding Board Game
Navigate through a maze using coding command cards in this engaging board game that teaches sequences and algorithms.

### 5. Visual Programming App
This tablet-based app uses a drag-and-drop interface to create animations and games, teaching core programming concepts.

## Benefits of Coding Toys

- Develop logical thinking and problem-solving skills
- Introduce technology concepts without screen dependency
- Build persistence and debugging skills
- Encourage creativity and open-ended play

Remember that the goal isn't to create child programmers, but to develop the thinking skills that will help them in any future endeavor!
        `,
        coverImage:
          "https://placehold.co/1200x630/4F46E5/FFFFFF.png?text=Coding+Toys",
        categoryId: categoryMap.get("technology"),
        authorId: adminUser.id,
        tags: [
          "coding for kids",
          "educational toys",
          "programming",
          "STEM toys",
        ],
        metadata: {
          metaTitle:
            "Top 5 Coding Toys That Make Programming Fun for Kids | STEM Toys",
          metaDescription:
            "Discover the best coding toys that teach programming concepts to children through interactive play and creativity.",
          metaKeywords: [
            "coding toys",
            "programming for kids",
            "educational technology",
          ],
        },
        isPublished: true,
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
      },
      {
        title: "Building Bridges: Engineering Concepts for Elementary Students",
        slug: "engineering-concepts-elementary-students",
        excerpt:
          "Simple ways to teach fundamental engineering principles to young children through hands-on bridge building activities.",
        content: `
# Building Bridges: Engineering Concepts for Elementary Students

Engineering might seem like an advanced topic, but many fundamental concepts can be introduced to elementary-aged children through hands-on activities like bridge building. These activities not only teach scientific principles but also develop problem-solving skills and spatial awareness.

## Basic Bridge Types to Explore

### Beam Bridge
The simplest type of bridge, a beam bridge is just a flat surface that spans two points. Kids can create these with books spanning between two chairs or blocks.

### Arch Bridge
Arch bridges use a curved structure to distribute weight. Children can experiment with paper or cardboard arches to see how they hold weight differently than flat surfaces.

### Suspension Bridge
These bridges use cables suspended from towers. Kids can model these using string and cardboard to understand tension and compression forces.

## Simple Bridge-Building Activity

### Materials Needed:
- Popsicle sticks
- Glue
- String
- Small weights (coins work well)
- Two equal-height supports

### Instructions:
1. Challenge children to build a bridge that spans between the two supports
2. Test the bridge by adding weights to the middle
3. Discuss why some designs hold more weight than others
4. Encourage redesign and improvement

## Engineering Concepts Covered:
- Structural integrity
- Force distribution
- Material strength
- Design iteration

By engaging in these hands-on activities, children learn that engineering is about creative problem-solving and that failure is just part of the design process. These early experiences can spark a lifelong interest in engineering and design thinking.
        `,
        coverImage:
          "https://placehold.co/1200x630/F59E0B/FFFFFF.png?text=Engineering+For+Kids",
        categoryId: categoryMap.get("engineering"),
        authorId: adminUser.id,
        tags: [
          "engineering for kids",
          "bridge building",
          "STEM activities",
          "elementary education",
        ],
        metadata: {
          metaTitle:
            "Building Bridges: Engineering Concepts for Elementary Students | STEM Toys",
          metaDescription:
            "Learn how to teach fundamental engineering principles to young children through hands-on bridge building activities.",
          metaKeywords: [
            "elementary engineering",
            "bridge building",
            "STEM activities",
          ],
        },
        isPublished: true,
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
      },
    ];

    for (const blog of blogs) {
      const existingBlog = await prisma.blog.findUnique({
        where: { slug: blog.slug },
      });

      if (!existingBlog) {
        const createdBlog = await prisma.blog.create({
          data: blog,
        });
        console.log(`✅ Created blog post: ${createdBlog.title}`);
      } else {
        console.log(`Blog post "${blog.title}" already exists`);
      }
    }

    console.log("\n🎉 Database initialization completed successfully!");
    console.log(`
Admin user created:
  - Email: ${adminEmail}
  - Password: ${adminPassword}
  
Created:
  - ${categories.length} categories
  - ${products.length} products
  - ${blogs.length} blog posts
    `);
  } catch (error) {
    console.error("❌ Error during database initialization:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
