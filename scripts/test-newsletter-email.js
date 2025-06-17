const { PrismaClient } = require("../app/generated/prisma");
const prisma = new PrismaClient();
const fetch = require("node-fetch");

/**
 * Test script for newsletter email templates
 * This script will use the API endpoint to test the newsletter welcome email
 */
async function testNewsletterEmail() {
  try {
    console.log("===== TESTING NEWSLETTER EMAIL TEMPLATE =====");

    // Test email address
    const testEmail = "test@example.com";
    const testName = "Test User";

    console.log(`\nFetching latest blogs for email template...`);

    // Fetch the latest 2 published blog posts
    const latestBlogs = await prisma.blog.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: "desc" },
      take: 2,
      include: {
        author: {
          select: { name: true },
        },
        category: {
          select: { name: true, slug: true },
        },
      },
    });

    console.log(`Found ${latestBlogs.length} published blogs.`);

    if (latestBlogs.length > 0) {
      latestBlogs.forEach((blog, index) => {
        console.log(`\nBlog #${index + 1}:`);
        console.log(`- Title: ${blog.title}`);
        console.log(`- Slug: ${blog.slug}`);
        console.log(`- Author: ${blog.author.name}`);
        console.log(`- Category: ${blog.category.name}`);
        console.log(`- Cover Image: ${blog.coverImage || "None"}`);
      });
    } else {
      console.log(
        "No published blogs found. Email will show 'coming soon' message."
      );
    }

    console.log("\nUsing API endpoint to test newsletter welcome email...");

    // Use the test-newsletter API endpoint to send a test email
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const url = `${baseUrl}/api/test-newsletter?action=subscribe&email=${testEmail}&firstName=${testName}&testMode=true`;

    console.log(`Making API request to: ${url}`);

    const response = await fetch(url);
    const data = await response.json();

    console.log("\nAPI response:", JSON.stringify(data, null, 2));
    console.log("\n✅ Newsletter email template test completed.");
    console.log("Check the terminal output for any errors or warnings.");
  } catch (error) {
    console.error("Error testing newsletter email:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testNewsletterEmail();
