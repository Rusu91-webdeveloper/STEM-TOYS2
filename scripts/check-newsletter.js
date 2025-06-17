const { PrismaClient } = require("../app/generated/prisma");
const prisma = new PrismaClient();

async function checkNewsletterSubscribers() {
  try {
    console.log("===== CHECKING NEWSLETTER SUBSCRIBERS =====");

    const subscribers = await prisma.newsletter.findMany();
    console.log(`Found ${subscribers.length} newsletter subscribers:`);

    if (subscribers.length > 0) {
      subscribers.forEach((subscriber, index) => {
        console.log(`\nSubscriber #${index + 1}:`);
        console.log(`- ID: ${subscriber.id}`);
        console.log(`- Email: ${subscriber.email}`);
        console.log(
          `- Name: ${subscriber.firstName || "N/A"} ${subscriber.lastName || ""}`
        );
        console.log(`- Active: ${subscriber.isActive}`);
        console.log(
          `- Categories: ${subscriber.categories.join(", ") || "None"}`
        );
        console.log(`- Created: ${subscriber.createdAt}`);
        console.log(`- Updated: ${subscriber.updatedAt}`);
      });
    } else {
      console.log("No subscribers found.");
    }
  } catch (error) {
    console.error("Error checking newsletter subscribers:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkNewsletterSubscribers();
