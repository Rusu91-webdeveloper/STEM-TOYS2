import { PrismaClient } from "../app/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting product data enrichment...");

  // Get all products
  const products = await prisma.product.findMany({
    include: {
      category: true,
    },
  });

  console.log(`Found ${products.length} products to update`);

  // Process each product
  for (const product of products) {
    console.log(`Processing product: ${product.name}`);

    // Current attributes or empty object if null
    const attributes = (product.attributes as Record<string, any>) || {};

    // Check for age range and add if missing
    if (!attributes.age) {
      // Extract age from tags if possible
      const ageTag = product.tags.find(
        (tag) => tag.includes("years") || tag.includes("+")
      );
      let ageRange = "8-12"; // Default age range

      if (ageTag) {
        ageRange = ageTag.replace(" years", "").trim();
      } else {
        // Assign age range based on category
        switch (product.category?.name?.toLowerCase()) {
          case "science":
            ageRange = "8-12";
            break;
          case "technology":
            ageRange = "6-14";
            break;
          case "engineering":
            ageRange = "9-14";
            break;
          case "mathematics":
            ageRange = "7-12";
            break;
          default:
            ageRange = "8-12";
        }
      }

      attributes.age = ageRange;
      console.log(`  - Added age range: ${ageRange}`);
    }

    // Add difficulty level if missing
    if (!attributes.difficulty) {
      // Default to Intermediate or extract from tags
      let difficulty = "Intermediate";

      if (product.tags.includes("beginner")) {
        difficulty = "Beginner";
      } else if (product.tags.includes("advanced")) {
        difficulty = "Advanced";
      }

      attributes.difficulty = difficulty;
      console.log(`  - Added difficulty: ${difficulty}`);
    }

    // Add product type if missing
    if (!attributes.type) {
      // Try to determine product type from tags or name
      let type = "Toy"; // Default type

      if (
        product.tags.includes("kit") ||
        product.name.toLowerCase().includes("kit")
      ) {
        type = "DIY Kit";
      } else if (
        product.tags.includes("book") ||
        product.name.toLowerCase().includes("book")
      ) {
        type = "Educational Book";
      }

      attributes.type = type;
      console.log(`  - Added product type: ${type}`);
    }

    // Update the product with enriched attributes
    await prisma.product.update({
      where: { id: product.id },
      data: {
        attributes,
      },
    });

    console.log(`Updated product: ${product.name}`);
  }

  console.log("Product data enrichment completed successfully.");
}

main()
  .catch((e) => {
    console.error("Error updating products:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
