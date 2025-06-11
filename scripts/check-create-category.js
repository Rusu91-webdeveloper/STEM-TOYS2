#!/usr/bin/env node

/**
 * Category Check and Creation Script
 *
 * This script checks if categories exist in the database and creates a default one if needed.
 * This helps prevent foreign key constraint errors when creating blog posts.
 *
 * Usage:
 *   node scripts/check-create-category.js
 */

// Load environment variables from .env file
require("dotenv").config();

// Check if DATABASE_URL is available
if (!process.env.DATABASE_URL) {
  console.error("ERROR: DATABASE_URL environment variable is not set");
  console.error(
    "Please make sure your .env file contains the DATABASE_URL variable"
  );
  console.error(
    'Example: DATABASE_URL="postgresql://username:password@localhost:5432/mydatabase"'
  );
  process.exit(1);
}

const { PrismaClient } = require("../app/generated/prisma");
const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

async function main() {
  console.log("Starting category check script...");

  try {
    // Check if any categories exist
    console.log("Checking for existing categories...");
    const categoryCount = await prisma.category.count();

    if (categoryCount > 0) {
      console.log(
        `Found ${categoryCount} existing categories. No action needed.`
      );
      const categories = await prisma.category.findMany({
        select: { id: true, name: true, slug: true },
      });
      console.log("Existing categories:", categories);
      return;
    }

    console.log("No categories found. Creating a default category...");

    // Create a default category
    const defaultCategory = await prisma.category.create({
      data: {
        name: "General",
        slug: "general",
        description: "General content category",
        isActive: true,
      },
    });

    console.log("Successfully created default category:", defaultCategory);
    console.log("You can now create blog posts using this category.");
  } catch (error) {
    console.error("Error in category check script:", error);
    console.error("Stack trace:", error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

main();
