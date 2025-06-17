const fs = require("fs");
const path = require("path");
const readline = require("readline");
const { PrismaClient } = require("../app/generated/prisma");

const prisma = new PrismaClient();
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Helper function to prompt for input
function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function setupBrevo() {
  try {
    console.log("\n===== BREVO EMAIL INTEGRATION SETUP =====");
    console.log(
      "This script will help you set up the Brevo email integration for your TechTots store."
    );
    console.log("You will need your Brevo API key and SMTP key to continue.");
    console.log(
      "You can find these in your Brevo account under SMTP & API > API Keys.\n"
    );

    // Check if .env.local exists
    const envPath = path.join(process.cwd(), ".env.local");
    let envContent = "";

    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, "utf8");
      console.log("Found existing .env.local file.");
    } else {
      console.log("No .env.local file found. A new one will be created.");
    }

    // Get Brevo API key
    const brevoApiKey = await prompt("Enter your Brevo API key: ");
    if (!brevoApiKey) {
      console.log("API key is required. Exiting setup.");
      return;
    }

    // Get Brevo SMTP key
    const brevoSmtpKey = await prompt(
      "Enter your Brevo SMTP key (or press Enter to skip): "
    );

    // Get sender email
    const defaultEmail = "noreply@yourdomain.com";
    const emailFrom =
      (await prompt(
        `Enter sender email address (default: ${defaultEmail}): `
      )) || defaultEmail;

    // Get sender name
    const defaultName = "TechTots STEM Store";
    const emailFromName =
      (await prompt(`Enter sender name (default: ${defaultName}): `)) ||
      defaultName;

    // Update .env.local file
    const envVars = {
      BREVO_API_KEY: brevoApiKey,
      ...(brevoSmtpKey ? { BREVO_SMTP_KEY: brevoSmtpKey } : {}),
      EMAIL_FROM: emailFrom,
      EMAIL_FROM_NAME: emailFromName,
    };

    // Update or add environment variables
    let newEnvContent = envContent;
    Object.entries(envVars).forEach(([key, value]) => {
      const regex = new RegExp(`^${key}=.*$`, "m");
      if (regex.test(newEnvContent)) {
        newEnvContent = newEnvContent.replace(regex, `${key}=${value}`);
      } else {
        newEnvContent += `\n${key}=${value}`;
      }
    });

    // Write to .env.local
    fs.writeFileSync(envPath, newEnvContent.trim());
    console.log("\nEnvironment variables updated in .env.local file.");

    // Check and update store settings
    console.log("\nChecking store settings...");
    const storeSettings = await prisma.storeSettings.findFirst();

    if (storeSettings) {
      console.log("Updating existing store settings...");
      await prisma.storeSettings.update({
        where: { id: storeSettings.id },
        data: {
          contactEmail: emailFrom,
        },
      });
    } else {
      console.log("Creating store settings...");
      await prisma.storeSettings.create({
        data: {
          storeName: "TechTots STEM Store",
          storeDescription: "Educational STEM toys for children",
          contactEmail: emailFrom,
          contactPhone: "+40 123 456 789",
          address: "Example Street 123, Bucharest, Romania",
          currency: "RON",
          language: "ro",
          taxRate: 19,
          shippingFee: 15,
          freeShippingThreshold: 200,
        },
      });
    }

    console.log("\n✅ Brevo setup completed successfully!");
    console.log("You can now test the email functionality by running:");
    console.log("  npm run dev");
    console.log(
      "  curl http://localhost:3000/api/test-newsletter?action=all&email=your-email@example.com"
    );
    console.log("\nOr by subscribing to the newsletter on the homepage.");
  } catch (error) {
    console.error("Error setting up Brevo:", error);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

setupBrevo();
