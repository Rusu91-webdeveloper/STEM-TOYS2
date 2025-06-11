#!/usr/bin/env node

/**
 * Environment Setup Helper Script
 *
 * This script helps create a proper .env file for the application.
 *
 * Usage:
 *   node scripts/setup-env-example.js
 */

const fs = require("fs");
const path = require("path");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const ENV_TEMPLATE = `# STEM-TOYS Environment Variables
# Generated on ${new Date().toISOString().split("T")[0]}

# Database Connection String (Required)
# This is the main connection string for PostgreSQL
# Format: postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"

# NextAuth Secret (Required for authentication)
# You can generate one with: openssl rand -base64 32
NEXTAUTH_SECRET="generate-a-secure-random-string-here"
NEXTAUTH_URL="http://localhost:3000"

# Optional: Admin User Credentials for Development
# These are used for the development admin account
ADMIN_EMAIL="admin@example.com"
ADMIN_NAME="Admin User"
ADMIN_PASSWORD="securepassword123"
USE_ENV_ADMIN="true"  # Set to "true" to use these credentials in dev mode

# Node Environment
NODE_ENV="development" # or "production" or "test"
`;

const projectRoot = path.resolve(__dirname, "..");
const envPath = path.join(projectRoot, ".env");

// Check if .env already exists
if (fs.existsSync(envPath)) {
  console.log("An .env file already exists in your project root.");
  rl.question("Do you want to overwrite it? (y/N): ", (answer) => {
    if (answer.toLowerCase() === "y") {
      createEnvFile();
    } else {
      console.log(
        "Operation cancelled. Your existing .env file was not modified."
      );
      rl.close();
    }
  });
} else {
  createEnvFile();
}

function createEnvFile() {
  console.log("Creating .env file with template values...");

  // Write the template to .env file
  fs.writeFileSync(envPath, ENV_TEMPLATE);

  console.log(`
✅ .env file created successfully at: ${envPath}

⚠️ IMPORTANT: You need to edit the .env file and replace the placeholder values with your actual database connection string and other settings.

For example, update the DATABASE_URL with your actual PostgreSQL connection details:
  DATABASE_URL="postgresql://actual_username:actual_password@your_host:5432/your_database"

After updating the .env file, you can run scripts like:
  node scripts/check-create-category.js
  node scripts/debug-blog-creation.js
  `);

  rl.close();
}

rl.on("close", () => {
  process.exit(0);
});
