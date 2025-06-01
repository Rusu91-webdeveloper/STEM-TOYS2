// Script to add a specific admin user
const { PrismaClient } = require("../app/generated/prisma");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  // Admin credentials
  const adminEmail = "rusu.emanuel.webdeveloper@gmail.com";
  const adminPassword = "Itist199!"; // This will be hashed before storage

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
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      const updatedAdmin = await prisma.user.update({
        where: { email: adminEmail },
        data: {
          password: hashedPassword,
          role: "ADMIN",
          isActive: true,
          emailVerified: new Date(),
        },
      });

      console.log(`Updated admin user: ${updatedAdmin.email}`);
    } else {
      // Create the admin user
      const hashedPassword = await bcrypt.hash(adminPassword, 10);

      const adminUser = await prisma.user.create({
        data: {
          name: "Emanuel Rusu",
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
