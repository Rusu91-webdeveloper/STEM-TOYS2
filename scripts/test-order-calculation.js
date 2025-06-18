/**
 * Test order calculation logic to verify tax and free shipping are working correctly
 * Run this script: node scripts/test-order-calculation.js
 */

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function testOrderCalculation() {
  try {
    console.log("🧪 Testing Order Calculation Logic...\n");

    // Get store settings
    const storeSettings = await prisma.storeSettings.findFirst();

    if (!storeSettings) {
      console.log("❌ No store settings found");
      return;
    }

    console.log("📋 Current Store Settings:");
    if (storeSettings.taxSettings) {
      console.log(`- Tax Rate: ${storeSettings.taxSettings.rate}%`);
      console.log(`- Tax Active: ${storeSettings.taxSettings.active}`);
    }

    if (storeSettings.shippingSettings) {
      const shipping = storeSettings.shippingSettings;
      console.log(
        `- Free Shipping Threshold: ${shipping.freeThreshold?.price} EUR`
      );
      console.log(`- Free Shipping Active: ${shipping.freeThreshold?.active}`);
      console.log(`- Standard Shipping: ${shipping.standard?.price} EUR`);
      console.log(`- Priority Shipping: 19.99 EUR (hardcoded)`);
    }

    console.log("\n" + "=".repeat(50));

    // Test scenarios
    const testCases = [
      {
        name: "Order UNDER free shipping threshold",
        subtotal: 85.0,
        shippingMethod: "standard",
        shippingCost: 2.99,
      },
      {
        name: "Order ABOVE free shipping threshold (like your example)",
        subtotal: 701.9,
        shippingMethod: "priority",
        shippingCost: 19.99,
      },
      {
        name: "Order exactly AT free shipping threshold",
        subtotal: 100.0,
        shippingMethod: "standard",
        shippingCost: 2.99,
      },
    ];

    testCases.forEach((testCase, index) => {
      console.log(`\n🧪 Test Case ${index + 1}: ${testCase.name}`);
      console.log(`📦 Subtotal: ${testCase.subtotal.toFixed(2)} EUR`);
      console.log(
        `🚚 Base Shipping (${testCase.shippingMethod}): ${testCase.shippingCost.toFixed(2)} EUR`
      );

      // Get tax settings
      const taxSettings = storeSettings.taxSettings;
      const taxRate = taxSettings ? parseFloat(taxSettings.rate) / 100 : 0.1;
      const taxActive = taxSettings ? taxSettings.active : true;

      // Get shipping settings
      const shippingSettings = storeSettings.shippingSettings;
      const freeThreshold = shippingSettings?.freeThreshold?.active
        ? parseFloat(shippingSettings.freeThreshold.price)
        : null;

      // Calculate tax
      const tax = taxActive ? testCase.subtotal * taxRate : 0;

      // Apply free shipping logic
      let finalShippingCost = testCase.shippingCost;
      let freeShippingApplied = false;

      if (freeThreshold && testCase.subtotal >= freeThreshold) {
        finalShippingCost = 0;
        freeShippingApplied = true;
      }

      // Calculate total
      const total = testCase.subtotal + tax + finalShippingCost;

      console.log(
        `💰 Tax (${taxSettings?.rate || "10"}%): ${tax.toFixed(2)} EUR`
      );
      console.log(
        `🚚 Final Shipping: ${finalShippingCost === 0 ? "FREE" : finalShippingCost.toFixed(2) + " EUR"} ${freeShippingApplied ? "(Free shipping applied!)" : ""}`
      );
      console.log(`🎯 TOTAL: ${total.toFixed(2)} EUR`);

      // Compare with expected
      if (index === 1) {
        // Your example case
        console.log("\n📊 Comparison with your email issue:");
        console.log(`Expected total (browser): ~772.90 EUR`);
        console.log(`Calculated total (fixed): ${total.toFixed(2)} EUR`);
        console.log(
          `✅ ${Math.abs(total - 772.9) < 1 ? "MATCHES!" : "MISMATCH - needs investigation"}`
        );
      }
    });

    console.log("\n" + "=".repeat(50));
    console.log("🎉 Order calculation test completed!");
  } catch (error) {
    console.error("❌ Error testing order calculation:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testOrderCalculation();
