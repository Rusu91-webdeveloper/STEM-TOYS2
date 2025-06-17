const { PrismaClient } = require("../app/generated/prisma");
const prisma = new PrismaClient();

async function checkStoreSettings() {
  try {
    console.log("===== CHECKING STORE SETTINGS =====");

    const storeSettings = await prisma.storeSettings.findFirst();

    if (storeSettings) {
      console.log("Store settings found:");
      console.log(`- ID: ${storeSettings.id}`);
      console.log(`- Store Name: ${storeSettings.storeName}`);
      console.log(`- Store URL: ${storeSettings.storeUrl}`);
      console.log(`- Description: ${storeSettings.storeDescription}`);
      console.log(`- Contact Email: ${storeSettings.contactEmail}`);
      console.log(`- Contact Phone: ${storeSettings.contactPhone}`);
      console.log(`- Currency: ${storeSettings.currency}`);
      console.log(`- Created: ${storeSettings.createdAt}`);
      console.log(`- Updated: ${storeSettings.updatedAt}`);

      // Display metadata if available
      if (storeSettings.metadata) {
        console.log("\nMetadata:");
        console.log(JSON.stringify(storeSettings.metadata, null, 2));
      }

      // Display shipping settings if available
      if (storeSettings.shippingSettings) {
        console.log("\nShipping Settings:");
        console.log(JSON.stringify(storeSettings.shippingSettings, null, 2));
      }

      // Display payment settings if available
      if (storeSettings.paymentSettings) {
        console.log("\nPayment Settings:");
        console.log(JSON.stringify(storeSettings.paymentSettings, null, 2));
      }
    } else {
      console.log("No store settings found in the database.");
      console.log(
        "Run 'node scripts/setup-brevo.js' to create store settings."
      );
    }
  } catch (error) {
    console.error("Error checking store settings:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkStoreSettings();
