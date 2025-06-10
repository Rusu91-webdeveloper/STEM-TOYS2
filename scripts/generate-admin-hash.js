#!/usr/bin/env node

/**
 * This script generates a secure hash for the ADMIN_PASSWORD_HASH environment variable
 * Run this script to securely store admin passwords in your environment
 */

const crypto = require("crypto");
const readline = require("readline");
require("dotenv").config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Function to create a secure hash from a password
function createEnvPasswordHash(password, secret) {
  return crypto
    .pbkdf2Sync(
      password,
      secret,
      10000, // iterations
      64, // key length
      "sha512"
    )
    .toString("hex");
}

console.log("\n🔒 Admin Password Hash Generator 🔒\n");
console.log(
  "This utility creates a secure hash for your ADMIN_PASSWORD_HASH environment variable."
);
console.log(
  "Using this approach eliminates the need to store plaintext passwords in your .env file.\n"
);

// Get the NEXTAUTH_SECRET or warn about using a fallback
const secret = process.env.NEXTAUTH_SECRET || "fallback-secret-key-for-hashing";
if (!process.env.NEXTAUTH_SECRET) {
  console.warn(
    "⚠️  Warning: NEXTAUTH_SECRET not found in your environment variables."
  );
  console.warn(
    "⚠️  Using a fallback secret. For production, set NEXTAUTH_SECRET in your .env file first.\n"
  );
}

// Prompt for password
rl.question("Enter the admin password to hash: ", (password) => {
  if (!password || password.length < 8) {
    console.error(
      "\n❌ Error: Password must be at least 8 characters long for security reasons."
    );
    rl.close();
    return;
  }

  try {
    // Generate the hash
    const hash = createEnvPasswordHash(password, secret);

    console.log("\n✅ Password hash generated successfully!\n");
    console.log("Add the following to your .env file:");
    console.log('\nADMIN_PASSWORD_HASH="' + hash + '"\n');
    console.log(
      "🔐 Make sure to remove any plaintext ADMIN_PASSWORD entry from your .env file.\n"
    );
  } catch (error) {
    console.error("\n❌ Error generating hash:", error.message);
  } finally {
    rl.close();
  }
});
