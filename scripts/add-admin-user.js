// Script to add a specific admin user
const { PrismaClient } = require("../app/generated/prisma");
const bcrypt = require("bcrypt");
require("dotenv").config();

const prisma = new PrismaClient();

async function main() {
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

  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (existingAdmin) {
      console.log(
        `Admin user already exists: ${adminEmail}. Updating password...`
      );

      // Update the existing admin user
      const hashedPassword = await bcrypt.hash(adminPassword, 12);

      const updatedAdmin = await prisma.user.update({
        where: { email: adminEmail },
        data: {
          name: adminName,
          password: hashedPassword,
          role: "ADMIN",
          isActive: true,
          emailVerified: new Date(),
        },
      });

      console.log(`Updated admin user: ${updatedAdmin.email}`);
    } else {
      // Create the admin user
      const hashedPassword = await bcrypt.hash(adminPassword, 12);

      const adminUser = await prisma.user.create({
        data: {
          name: adminName,
          email: adminEmail,
          password: hashedPassword,
          role: "ADMIN",
          isActive: true,
          emailVerified: new Date(),
        },
      });

      console.log(`Created admin user: ${adminUser.email}`);
    }
  } catch (error) {
    console.error("Error adding admin user:", error);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
