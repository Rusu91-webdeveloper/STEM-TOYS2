// Script to create an admin user from environment variables
// This is a safer approach than hardcoding credentials
require("dotenv").config({ path: ".env.local" });
const { PrismaClient } = require("../app/generated/prisma");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function createEnvAdminUser() {
  try {
    // Get admin credentials from environment variables
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminName = process.env.ADMIN_NAME;
    const adminPassword = process.env.ADMIN_PASSWORD;

    // Validate that we have all required values
    if (!adminEmail || !adminPassword) {
      console.error("Missing required environment variables:");
      if (!adminEmail) console.error("- ADMIN_EMAIL is required");
      if (!adminPassword) console.error("- ADMIN_PASSWORD is required");
      console.error("Please add these to your .env.local file and try again.");
      return;
    }

    console.log(`Creating admin user for: ${adminEmail}`);

    // Check if the admin user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingUser) {
      console.log("Admin user already exists.");

      // Update the existing user to be an admin if they're not already
      if (existingUser.role !== "ADMIN") {
        await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            role: "ADMIN",
            isActive: true,
          },
        });
        console.log("User role updated to ADMIN.");
      }

      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Create the admin user
    const user = await prisma.user.create({
      data: {
        name: adminName || "Admin User",
        email: adminEmail,
        password: hashedPassword,
        role: "ADMIN",
        isActive: true, // Auto-activate the admin user
        emailVerified: new Date(), // Mark as verified
      },
    });

    console.log("Admin user created successfully:", user.email);
    console.log("This user now has admin privileges.");
  } catch (error) {
    console.error("Error creating admin user:", error);

    if (error.message.includes("DATABASE_URL")) {
      console.log(
        "\nNOTE: This error may occur if your DATABASE_URL is not set."
      );
      console.log(
        "In development mode, the application can still work using environment-based admin authentication."
      );
      console.log(
        "Your admin user (from .env.local) will work when you run the application with:"
      );
      console.log('USE_MOCK_DATA="true" in your .env.local file.');
    }
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
createEnvAdminUser();
