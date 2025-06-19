const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();

async function checkDigitalDownloads() {
  console.log("🔍 Checking digital downloads for recent order...");

  const downloads = await db.digitalDownload.findMany({
    include: {
      orderItem: {
        include: {
          order: true,
          book: true,
        },
      },
      digitalFile: true,
      user: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 10,
  });

  console.log(`Found ${downloads.length} digital downloads:`);

  downloads.forEach((download, index) => {
    console.log(`${index + 1}. Download Token: ${download.downloadToken}`);
    console.log(`   Order: ${download.orderItem.order.orderNumber}`);
    console.log(`   User: ${download.user.email}`);
    console.log(`   Book: ${download.orderItem.book?.name || "Unknown"}`);
    console.log(`   File: ${download.digitalFile.fileName}`);
    console.log(
      `   Download URL: http://localhost:3000/api/download/${download.downloadToken}`
    );
    console.log(`   Expires: ${download.expiresAt}`);
    console.log(`   Downloaded: ${download.downloadedAt || "No"}`);
    console.log("");
  });

  await db.$disconnect();
}

checkDigitalDownloads().catch(console.error);
