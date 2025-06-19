#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Directories to exclude
const excludeDirs = [
  "node_modules",
  ".next",
  ".git",
  "scripts",
  "__tests__",
  "test",
  ".taskmaster",
];

// Extensions to process
const validExtensions = [".ts", ".tsx", ".js", ".jsx"];

// Patterns for console statements to remove
const consolePatterns = [
  /console\s*\.\s*log\s*\([^)]*\)\s*;?/g,
  /console\s*\.\s*warn\s*\([^)]*\)\s*;?/g,
  /console\s*\.\s*error\s*\([^)]*\)\s*;?/g,
];

// Special files where we might want to keep console statements
const allowedFiles = [
  "lib/logger.ts", // Custom logger might use console
  "lib/__tests__", // Test files
];

function shouldProcessFile(filePath) {
  // Check if file is in excluded directory
  for (const dir of excludeDirs) {
    if (
      filePath.includes(path.sep + dir + path.sep) ||
      filePath.includes("/" + dir + "/")
    ) {
      return false;
    }
  }

  // Check if file is in allowed list
  for (const allowed of allowedFiles) {
    if (filePath.includes(allowed)) return false;
  }

  // Check if file has valid extension
  const ext = path.extname(filePath);
  return validExtensions.includes(ext);
}

function getAllFiles(dirPath, arrayOfFiles = []) {
  try {
    const files = fs.readdirSync(dirPath);

    files.forEach((file) => {
      const fullPath = path.join(dirPath, file);

      // Skip excluded directories
      const shouldSkip = excludeDirs.some(
        (dir) => file === dir || fullPath.includes(path.sep + dir + path.sep)
      );

      if (shouldSkip) return;

      if (fs.statSync(fullPath).isDirectory()) {
        arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
      } else {
        arrayOfFiles.push(fullPath);
      }
    });
  } catch (error) {
    console.error(`Error reading directory ${dirPath}:`, error.message);
  }

  return arrayOfFiles;
}

function removeConsoleFromFile(filePath, dryRun = true) {
  if (!shouldProcessFile(filePath)) return { removed: 0 };

  try {
    let content = fs.readFileSync(filePath, "utf8");
    const originalContent = content;
    let removedCount = 0;

    // Remove console statements
    consolePatterns.forEach((pattern) => {
      const matches = content.match(pattern) || [];
      removedCount += matches.length;
      if (matches.length > 0) {
        content = content.replace(pattern, "");
      }
    });

    // Clean up empty lines left behind
    if (removedCount > 0) {
      content = content.replace(/^\s*[\r\n]/gm, "\n");
      content = content.replace(/\n\n\n+/g, "\n\n");
    }

    if (removedCount > 0) {
      if (!dryRun) {
        fs.writeFileSync(filePath, content, "utf8");
        console.log(
          `✅ Removed ${removedCount} console statements from: ${filePath}`
        );
      } else {
        console.log(
          `🔍 Found ${removedCount} console statements in: ${filePath}`
        );
      }
    }

    return { removed: removedCount, modified: removedCount > 0 };
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return { removed: 0, error: true };
  }
}

function main() {
  const args = process.argv.slice(2);
  const dryRun = !args.includes("--execute");

  console.log(
    dryRun
      ? "🔍 DRY RUN - No files will be modified"
      : "⚡ EXECUTING - Files will be modified"
  );
  console.log("Scanning for console statements...\n");

  // Get all files from current directory
  const allFiles = getAllFiles(".");

  let totalFiles = 0;
  let modifiedFiles = 0;
  let totalRemoved = 0;

  allFiles.forEach((file) => {
    if (shouldProcessFile(file)) {
      totalFiles++;
      const result = removeConsoleFromFile(file, dryRun);
      if (result.modified) {
        modifiedFiles++;
        totalRemoved += result.removed;
      }
    }
  });

  console.log("\n📊 Summary:");
  console.log(`   Total files scanned: ${totalFiles}`);
  console.log(`   Files with console statements: ${modifiedFiles}`);
  console.log(`   Total console statements found: ${totalRemoved}`);

  if (dryRun && totalRemoved > 0) {
    console.log("\n💡 To remove these console statements, run:");
    console.log("   node scripts/remove-console-logs.js --execute");
  }
}

main();
