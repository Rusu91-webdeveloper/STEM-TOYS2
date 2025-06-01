const { PrismaClient } = require("./app/generated/prisma");
const prisma = new PrismaClient();

async function checkUsers() {
  try {
    const users = await prisma.user.findMany();
    console.log("Users in database:", users);
    console.log("Total users count:", users.length);
  } catch (error) {
    console.error("Error checking users:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
