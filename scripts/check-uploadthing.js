// Script to check if UploadThing environment variables are properly set
require("dotenv").config();

console.log("Checking UploadThing configuration...");

const uploadthingSecret = process.env.UPLOADTHING_SECRET;
const uploadthingAppId = process.env.UPLOADTHING_APP_ID;

if (
  !uploadthingSecret ||
  uploadthingSecret === "your-uploadthing-secret-key" ||
  uploadthingSecret.includes("your-")
) {
  console.error("❌ UPLOADTHING_SECRET is not properly configured.");
  console.error("Please set a valid UPLOADTHING_SECRET in your .env file.");
} else {
  console.log("✅ UPLOADTHING_SECRET is configured.");
}

if (
  !uploadthingAppId ||
  uploadthingAppId === "your-uploadthing-app-id" ||
  uploadthingAppId.includes("your-")
) {
  console.error("❌ UPLOADTHING_APP_ID is not properly configured.");
  console.error("Please set a valid UPLOADTHING_APP_ID in your .env file.");
} else {
  console.log("✅ UPLOADTHING_APP_ID is configured.");
}

console.log("\nInstructions:");
console.log("1. Make sure you have created an account at uploadthing.com");
console.log("2. Copy your API keys from the UploadThing dashboard");
console.log("3. Add them to your .env file as follows:");
console.log("   UPLOADTHING_SECRET=your_actual_secret_key");
console.log("   UPLOADTHING_APP_ID=your_actual_app_id");
console.log("4. Restart your development server");
