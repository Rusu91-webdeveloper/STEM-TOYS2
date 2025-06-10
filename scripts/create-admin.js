// Script to create an admin user
// Note: This script must be run from the root of the project
const { PrismaClient } = require("../app/generated/prisma");
const bcrypt = require("bcrypt");
require("dotenv").config();

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    // Get admin credentials from environment variables
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminName = process.env.ADMIN_NAME || "Admin User";
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.error("Admin credentials not set in environment variables.");
      console.error(
        "Please set ADMIN_EMAIL, ADMIN_NAME, and ADMIN_PASSWORD in your .env file."
      );
      process.exit(1);
    }

    console.log(`Setting up admin user with email: ${adminEmail}`);

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
            name: adminName,
            role: "ADMIN",
            isActive: true,
          },
        });
        console.log("User role updated to ADMIN.");
      }

      return;
    }

    // Hash the password with bcrypt
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    // Create the admin user
    const user = await prisma.user.create({
      data: {
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        role: "ADMIN",
        isActive: true, // Auto-activate the admin user
        emailVerified: new Date(), // Mark as verified
      },
    });

    console.log("Admin user created successfully:", user.email);
  } catch (error) {
    console.error("Error creating admin user:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
createAdminUser();
