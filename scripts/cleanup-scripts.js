const fs = require("fs");
const path = require("path");

// Scripts to keep (essential for the application)
const scriptsToKeep = [
  "check-database.js", // For checking database contents
  "clean-database.js", // For cleaning the database
  "update-admin.js", // For updating admin credentials
  "setup-env-example.js", // For setting up environment variables
  "setup-stripe.js", // For setting up Stripe integration
  "cleanup-scripts.js", // This script
];

async function cleanupScripts() {
  try {
    console.log("===== CLEANING UP SCRIPT FILES =====");

    const scriptsDir = path.join(__dirname);
    const files = fs.readdirSync(scriptsDir);

    console.log(`Found ${files.length} files in scripts directory`);
    console.log(`Keeping ${scriptsToKeep.length} essential scripts`);

    let deletedCount = 0;

    for (const file of files) {
      // Skip directories and non-JavaScript files
      const filePath = path.join(scriptsDir, file);
      const stats = fs.statSync(filePath);

      if (
        stats.isDirectory() ||
        (!file.endsWith(".js") && !file.endsWith(".ts"))
      ) {
        continue;
      }

      // Skip files that should be kept
      if (scriptsToKeep.includes(file)) {
        console.log(`Keeping: ${file}`);
        continue;
      }

      // Delete the file
      try {
        console.log(`Deleting: ${file}`);
        fs.unlinkSync(filePath);
        deletedCount++;
      } catch (err) {
        console.error(`Error deleting ${file}:`, err);
      }
    }

    console.log(`\nDeleted ${deletedCount} unnecessary script files`);
    console.log("\n===== SCRIPT CLEANUP COMPLETE =====");
  } catch (error) {
    console.error("Error cleaning up scripts:", error);
  }
}

cleanupScripts();
