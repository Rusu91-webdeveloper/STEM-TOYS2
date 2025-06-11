#!/usr/bin/env node

/**
 * Blog Creation Debug Script
 *
 * This script tests blog creation directly against the database to diagnose issues.
 *
 * Usage:
 *   node scripts/debug-blog-creation.js
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
  console.log("Starting blog creation debug script...");

  try {
    // 1. Find an admin user
    console.log("Looking for an admin user...");
    const adminUser = await prisma.user.findFirst({
      where: { role: "ADMIN" },
      select: { id: true, email: true },
    });

    if (!adminUser) {
      console.error(
        "No admin user found in the database! Creating blog post will fail."
      );
      return;
    }

    console.log(`Found admin user: ${adminUser.email} (${adminUser.id})`);

    // 2. Find a category
    console.log("Looking for a category...");
    const category = await prisma.category.findFirst({
      select: { id: true, name: true },
    });

    if (!category) {
      console.error(
        "No category found in the database! Creating blog post will fail."
      );
      console.log(
        "Please run node scripts/check-create-category.js first to create a default category."
      );
      return;
    }

    console.log(`Found category: ${category.name} (${category.id})`);

    // 3. Create a test blog post
    console.log("Attempting to create a test blog post...");

    const testBlog = await prisma.blog.create({
      data: {
        title: "Debug Test Blog Post",
        slug: `debug-test-${Date.now()}`,
        excerpt: "This is a test blog post for debugging purposes.",
        content: "This is the content of the test blog post.",
        categoryId: category.id,
        authorId: adminUser.id,
        stemCategory: "GENERAL",
        tags: ["debug", "test"],
        isPublished: false,
        readingTime: 1,
        metadata: {
          language: "en",
          metaTitle: "Debug Test",
          metaDescription: "Debug test description",
          keywords: ["debug", "test"],
        },
      },
    });

    console.log("Successfully created test blog post!", testBlog);

    // 4. Clean up (delete the test post)
    console.log("Cleaning up - deleting test blog post...");
    await prisma.blog.delete({
      where: { id: testBlog.id },
    });

    console.log("Test blog post deleted successfully.");
    console.log("Debug script completed successfully!");
  } catch (error) {
    console.error("Error in debug script:", error);
    console.error("Stack trace:", error.stack);

    if (error.code === "P2002") {
      console.error(
        "This appears to be a unique constraint violation (duplicate slug)."
      );
    } else if (error.code === "P2003") {
      console.error(
        "This appears to be a foreign key constraint failure. Check that categoryId and authorId exist."
      );
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();
