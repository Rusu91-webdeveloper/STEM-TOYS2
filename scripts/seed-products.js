const { PrismaClient } = require("../app/generated/prisma");
const prisma = new PrismaClient();

async function seedProducts() {
  try {
    console.log("===== SEEDING PRODUCTS =====");

    // Get category IDs
    const categories = await prisma.category.findMany();
    if (categories.length === 0) {
      console.error(
        "No categories found. Please run seed-categories.js first."
      );
      return;
    }

    // Create a map of category slugs to IDs
    const categoryMap = new Map();
    categories.forEach((cat) => categoryMap.set(cat.slug, cat.id));

    // Products data with metadata
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
        },
        metadata: {
          title: "Chemistry Lab Kit for Kids - STEM Educational Science Set",
          description:
            "Introduce your child to the wonders of chemistry with our safe, educational lab kit designed for ages 8-12. Perfect for home and school science projects.",
          keywords: [
            "chemistry set",
            "science kit",
            "educational toys",
            "STEM toys",
            "experiments for kids",
          ],
          ogImage:
            "https://placehold.co/1200x630/10B981/FFFFFF.png?text=Chemistry+Kit",
        },
        stockQuantity: 75,
        weight: 1.2,
        dimensions: {
          width: 35,
          height: 15,
          depth: 25,
        },
        sku: "CH-LAB-001",
        barcode: "7891234567890",
        isActive: true,
      },
      {
        name: "Coding Robot for Beginners",
        slug: "coding-robot-beginners",
        description:
          "An interactive robot that teaches coding fundamentals through play. Perfect for beginners with no prior coding experience. Control movements, lights, and sounds.",
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
        },
        metadata: {
          title:
            "Kids Coding Robot for Beginners - Learn Programming Through Play",
          description:
            "Introduce your child to coding with our beginner-friendly robot. No prior experience needed. Perfect for ages 6+ to learn programming basics through fun activities.",
          keywords: [
            "coding for kids",
            "learn programming",
            "robotics for beginners",
            "STEM toys",
            "educational robots",
          ],
          ogImage:
            "https://placehold.co/1200x630/4F46E5/FFFFFF.png?text=Coding+Robot",
        },
        stockQuantity: 50,
        weight: 0.8,
        dimensions: {
          width: 15,
          height: 20,
          depth: 15,
        },
        sku: "CR-BEG-001",
        barcode: "7891234567891",
        isActive: true,
      },
      {
        name: "Bridge Builder Engineering Kit",
        slug: "bridge-builder-kit",
        description:
          "Build and test different bridge designs with this comprehensive engineering kit. Learn about structural principles, load distribution, and engineering design.",
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
        },
        metadata: {
          title: "Bridge Builder Engineering Kit - STEM Construction Toy Set",
          description:
            "Learn civil engineering concepts by building various bridge designs. This hands-on kit teaches structural principles and problem-solving for ages 9 and up.",
          keywords: [
            "engineering kit",
            "bridge building set",
            "structural engineering",
            "STEM toys",
            "educational construction",
          ],
          ogImage:
            "https://placehold.co/1200x630/F59E0B/FFFFFF.png?text=Bridge+Kit",
        },
        stockQuantity: 60,
        weight: 1.5,
        dimensions: {
          width: 40,
          height: 10,
          depth: 30,
        },
        sku: "BB-ENG-001",
        barcode: "7891234567892",
        isActive: true,
      },
      {
        name: "Mathematical Puzzle Cube Set",
        slug: "math-puzzle-cube-set",
        description:
          "A collection of 5 mathematical puzzle cubes with varying difficulty levels. Develops spatial reasoning, problem-solving skills, and mathematical thinking.",
        price: 29.99,
        compareAtPrice: 39.99,
        images: [
          "https://placehold.co/800x600/3B82F6/FFFFFF.png?text=Math+Puzzles+1",
          "https://placehold.co/800x600/3B82F6/FFFFFF.png?text=Math+Puzzles+2",
        ],
        categoryId: categoryMap.get("mathematics"),
        tags: ["mathematics", "puzzles", "logical thinking", "7+ years"],
        attributes: {
          age: "7+ years",
          pieces: 5,
          difficulty: "Various (Easy to Expert)",
          material: "High-quality ABS plastic",
        },
        metadata: {
          title:
            "Mathematical Puzzle Cube Set - Brain Teasers for Kids and Adults",
          description:
            "Challenge your mind with our set of 5 mathematical puzzle cubes. Perfect for developing spatial reasoning and problem-solving skills for ages 7 and up.",
          keywords: [
            "math puzzles",
            "brain teasers",
            "logical thinking games",
            "STEM toys",
            "educational puzzles",
          ],
          ogImage:
            "https://placehold.co/1200x630/3B82F6/FFFFFF.png?text=Math+Puzzles",
        },
        stockQuantity: 100,
        weight: 0.5,
        dimensions: {
          width: 20,
          height: 20,
          depth: 10,
        },
        sku: "MP-CUBE-001",
        barcode: "7891234567893",
        isActive: true,
      },
      {
        name: "Educational Book Set",
        slug: "educational-book-set",
        description:
          "A set of 5 educational books covering various STEM topics for children aged 6-10. Beautifully illustrated with engaging activities.",
        price: 45.99,
        compareAtPrice: 59.99,
        images: [
          "https://placehold.co/800x600/EC4899/FFFFFF.png?text=Book+Set+1",
          "https://placehold.co/800x600/EC4899/FFFFFF.png?text=Book+Set+2",
        ],
        categoryId: categoryMap.get("educational-books"),
        tags: ["books", "reading", "educational", "6-10 years"],
        attributes: {
          age: "6-10 years",
          pages: "250 total",
          topics: "Science, Technology, Engineering, Math, Nature",
          language: "Romanian",
        },
        metadata: {
          title:
            "Educational STEM Book Set - Illustrated Learning Books for Kids",
          description:
            "Inspire a love of learning with our beautifully illustrated educational book set covering essential STEM topics for children aged 6-10.",
          keywords: [
            "educational books",
            "children's books",
            "STEM books",
            "learning books",
            "illustrated books",
          ],
          ogImage:
            "https://placehold.co/1200x630/EC4899/FFFFFF.png?text=Book+Set",
        },
        stockQuantity: 40,
        weight: 1.8,
        dimensions: {
          width: 25,
          height: 30,
          depth: 8,
        },
        sku: "EB-SET-001",
        barcode: "7891234567894",
        isActive: true,
      },
    ];

    // Keep track of created products
    let created = 0;
    let existing = 0;

    // Process each product
    for (const product of products) {
      // Check if product already exists
      const existingProduct = await prisma.product.findUnique({
        where: { slug: product.slug },
      });

      if (!existingProduct) {
        // Create the product
        const createdProduct = await prisma.product.create({
          data: product,
        });
        console.log(`Created product: ${createdProduct.name}`);
        created++;
      } else {
        console.log(`Product ${product.name} already exists`);
        existing++;
      }
    }

    console.log(
      `\nSummary: Created ${created} new products, ${existing} already existed.`
    );
  } catch (error) {
    console.error("Error seeding products:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding function
seedProducts();
