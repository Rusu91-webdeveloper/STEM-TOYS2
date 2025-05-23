// Script to create an admin user
// Note: This script must be run from the root of the project
const { PrismaClient } = require("../app/generated/prisma");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    // Admin user details
    const adminUser = {
      name: "Rusu Emanuel",
      email: "rusu.emanuel.webdeveloper@gmail.com",
      password: "Itist199!", // Will be hashed before saving
      role: "ADMIN",
    };

    // Check if the admin user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: adminUser.email },
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
    const hashedPassword = await bcrypt.hash(adminUser.password, 10);

    // Create the admin user
    const user = await prisma.user.create({
      data: {
        name: adminUser.name,
        email: adminUser.email,
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
