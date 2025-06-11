#!/usr/bin/env node

/**
 * This script helps set up Stripe environment variables for the application.
 * It checks for the existence of required Stripe keys in the .env.local file
 * and provides guidance on how to add them if they're missing.
 */

const fs = require("fs");
const path = require("path");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const ENV_FILE = path.join(process.cwd(), ".env.local");

// Required Stripe environment variables
const requiredVars = [
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  "STRIPE_SECRET_KEY",
];

// Optional Stripe environment variables
const optionalVars = ["STRIPE_WEBHOOK_SECRET"];

// Check if .env.local exists
if (!fs.existsSync(ENV_FILE)) {
  console.log("\n❌ .env.local file not found!");
  console.log("Creating a new .env.local file...\n");
  fs.writeFileSync(ENV_FILE, "# Stripe Environment Variables\n\n");
}

// Read the current content of .env.local
const envContent = fs.readFileSync(ENV_FILE, "utf8");

// Parse existing environment variables
const envVars = {};
envContent.split("\n").forEach((line) => {
  const match = line.match(/^([^#\s][^=]*)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    const value = match[2].trim().replace(/^["'](.*)["']$/, "$1");
    envVars[key] = value;
  }
});

// Check for required variables
console.log("\n🔍 Checking Stripe environment variables...\n");

const missingRequired = requiredVars.filter((key) => !envVars[key]);
const missingOptional = optionalVars.filter((key) => !envVars[key]);

// Handle environment variables with incorrect names
const incorrectNames = Object.keys(envVars).filter(
  (key) =>
    key.includes("STRIPE") &&
    !requiredVars.includes(key) &&
    !optionalVars.includes(key)
);

// Check for specific incorrect names
if (
  envVars["NEXT_PUBLIC_STRIPE_PUBLIC_KEY"] &&
  !envVars["NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"]
) {
  console.log(
    "⚠️ Found NEXT_PUBLIC_STRIPE_PUBLIC_KEY but the correct name is NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
  );
  console.log("   Renaming this variable...");

  envVars["NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"] =
    envVars["NEXT_PUBLIC_STRIPE_PUBLIC_KEY"];
  delete envVars["NEXT_PUBLIC_STRIPE_PUBLIC_KEY"];
  incorrectNames = incorrectNames.filter(
    (name) => name !== "NEXT_PUBLIC_STRIPE_PUBLIC_KEY"
  );
}

// Report findings
if (
  missingRequired.length === 0 &&
  missingOptional.length === 0 &&
  incorrectNames.length === 0
) {
  console.log("✅ All Stripe environment variables are properly configured!");
} else {
  console.log("🔧 Some Stripe environment variables need attention:");

  if (missingRequired.length > 0) {
    console.log("\n❌ Missing required variables:");
    missingRequired.forEach((key) => console.log(`   - ${key}`));
  }

  if (missingOptional.length > 0) {
    console.log("\n⚠️ Missing optional variables:");
    missingOptional.forEach((key) => console.log(`   - ${key}`));
  }

  if (incorrectNames.length > 0) {
    console.log("\n⚠️ Found environment variables with incorrect names:");
    incorrectNames.forEach((key) =>
      console.log(`   - ${key} (not recognized)`)
    );
  }

  console.log("\n📝 How to fix:");
  console.log(
    "1. Sign up for a Stripe account at https://stripe.com if you haven't already"
  );
  console.log("2. Get your API keys from the Stripe Dashboard");
  console.log(
    "3. Add the following lines to your .env.local file (replacing with your actual keys):"
  );

  if (missingRequired.length > 0) {
    missingRequired.forEach((key) => {
      console.log(`   ${key}="your_${key.toLowerCase()}_here"`);
    });
  }

  if (missingOptional.length > 0) {
    console.log("\n   Optional:");
    missingOptional.forEach((key) => {
      console.log(`   ${key}="your_${key.toLowerCase()}_here"`);
    });
  }

  // Offer to update the .env.local file with fixed variable names
  if (incorrectNames.length > 0) {
    console.log(
      "\n🔄 Would you like to remove the incorrect variable names from your .env.local file? (y/n)"
    );
    rl.question("> ", (answer) => {
      if (answer.toLowerCase() === "y") {
        // Update the .env.local file
        let newEnvContent = "# Stripe Environment Variables\n\n";

        for (const [key, value] of Object.entries(envVars)) {
          if (!incorrectNames.includes(key)) {
            newEnvContent += `${key}="${value}"\n`;
          }
        }

        fs.writeFileSync(ENV_FILE, newEnvContent);
        console.log("\n✅ .env.local file updated successfully!");
      }

      console.log(
        "\n🚀 Run your application to verify that Stripe integration is working correctly."
      );
      rl.close();
    });
  } else {
    console.log(
      "\n🚀 Run your application to verify that Stripe integration is working correctly."
    );
    rl.close();
  }
}

// If no interaction needed, close readline
if (incorrectNames.length === 0) {
  rl.close();
}
