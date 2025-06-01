// Script to mark 4 products as featured
const { PrismaClient } = require("../app/generated/prisma");
const prisma = new PrismaClient();

async function main() {
  try {
    // First, reset all products to not featured
    await prisma.product.updateMany({
      data: {
        featured: false,
      },
    });

    console.log("Reset all products to not featured");

    // Get 4 products to mark as featured
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
      },
      take: 4,
    });

    if (products.length === 0) {
      console.log("No products found to mark as featured");
      return;
    }

    // Mark these products as featured
    for (const product of products) {
      await prisma.product.update({
        where: {
          id: product.id,
        },
        data: {
          featured: true,
        },
      });
      console.log(`Marked product "${product.name}" as featured`);
    }

    console.log("Successfully marked 4 products as featured");
  } catch (error) {
    console.error("Error setting featured products:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
