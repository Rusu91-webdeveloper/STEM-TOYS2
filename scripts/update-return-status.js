// Use the generated Prisma client from the correct path
const { PrismaClient } = require("../app/generated/prisma");
const prisma = new PrismaClient();

async function updateReturnStatus() {
  try {
    // Find the most recent return for rusuemanuel1991@gmail.com
    const user = await prisma.user.findUnique({
      where: { email: "rusuemanuel1991@gmail.com" },
    });

    if (!user) {
      throw new Error("Test user not found");
    }

    const returnRecord = await prisma.return.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    if (!returnRecord) {
      throw new Error("No return record found for this user");
    }

    console.log(
      `Found return: ${returnRecord.id} with status: ${returnRecord.status}`
    );

    // Update the return status to APPROVED
    const updatedReturn = await prisma.return.update({
      where: { id: returnRecord.id },
      data: { status: "APPROVED" },
    });

    console.log(`Return status updated to: ${updatedReturn.status}`);
    console.log(
      `In a real environment, an email with a return label would be sent to ${user.email}.`
    );
    console.log(
      `You can check the admin interface to see the return status has been updated.`
    );
  } catch (error) {
    console.error("Error updating return status:", error);
  } finally {
    await prisma.$disconnect();
  }
}

updateReturnStatus();
