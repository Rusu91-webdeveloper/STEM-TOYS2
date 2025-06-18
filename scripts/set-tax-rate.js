/**
 * Set tax rate to 10% in store settings
 * Run this script: node scripts/set-tax-rate.js
 */

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function setTaxRate() {
  try {
    console.log("🔍 Looking for store settings...");

    // Find existing store settings
    let storeSettings = await prisma.storeSettings.findFirst();

    if (!storeSettings) {
      console.log("❌ No store settings found. Creating new settings...");
      storeSettings = await prisma.storeSettings.create({
        data: {
          taxSettings: {
            rate: "10",
            active: true,
            includeInPrice: false,
          },
        },
      });
      console.log("✅ Created store settings with 10% tax rate");
    } else {
      console.log("📋 Updating existing store settings...");

      // Update the tax settings
      const updatedSettings = await prisma.storeSettings.update({
        where: { id: storeSettings.id },
        data: {
          taxSettings: {
            rate: "10",
            active: true,
            includeInPrice: false,
          },
        },
      });

      console.log("✅ Updated tax settings successfully!");
    }

    // Verify the update
    const verifySettings = await prisma.storeSettings.findFirst();
    console.log("\n📊 Current Tax Settings:");
    console.log(JSON.stringify(verifySettings.taxSettings, null, 2));

    console.log("\n🎉 Tax rate is now set to 10%");
    console.log(
      "📧 Order confirmation emails will now show the correct tax rate"
    );
  } catch (error) {
    console.error("❌ Error setting tax rate:", error);
  } finally {
    await prisma.$disconnect();
  }
}

setTaxRate();
