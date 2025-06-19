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

function shouldProcessFile(filePath) {
  // Check if file is in excluded directory
  for (const excludeDir of excludeDirs) {
    if (
      filePath.includes(path.sep + excludeDir + path.sep) ||
      filePath.includes("/" + excludeDir + "/")
    ) {
      return false;
    }
  }

  // Check if file has valid extension
  const ext = path.extname(filePath);
  return validExtensions.includes(ext);
}

function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && !excludeDirs.includes(file)) {
      processDirectory(filePath);
    } else if (stat.isFile() && shouldProcessFile(filePath)) {
      processFile(filePath);
    }
  }
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8");
  let modified = false;
  let changeCount = 0;

  // Pattern 1: Lone closing parenthesis and semicolon on a line
  const loneParenPattern = /^\s*\);\s*$/gm;
  if (loneParenPattern.test(content)) {
    content = content.replace(loneParenPattern, "");
    modified = true;
    changeCount++;
  }

  // Pattern 2: Stray arrow functions (=> ({ or => item)
  const strayArrowPattern = /^\s*=>\s*\({[\s\S]*?\}\)\)\s*\);\s*$/gm;
  if (strayArrowPattern.test(content)) {
    content = content.replace(strayArrowPattern, "");
    modified = true;
    changeCount++;
  }

  // Pattern 3: Simpler stray arrow pattern
  const simpleArrowPattern =
    /^\s*=>\s*(item|{\s*id:|{\s*name:)[\s\S]*?\)\s*\);\s*$/gm;
  if (simpleArrowPattern.test(content)) {
    content = content.replace(simpleArrowPattern, "");
    modified = true;
    changeCount++;
  }

  // Pattern 4: Lone backtick and closing paren
  const loneBacktickPattern = /^\s*`\s*\);\s*$/gm;
  if (loneBacktickPattern.test(content)) {
    content = content.replace(loneBacktickPattern, "");
    modified = true;
    changeCount++;
  }

  // Pattern 5: Stray colon and comma patterns
  const strayColonPattern = /^\s*:",\s*[^)]*\);\s*$/gm;
  if (strayColonPattern.test(content)) {
    content = content.replace(strayColonPattern, "");
    modified = true;
    changeCount++;
  }

  // Pattern 6: Double empty catch blocks
  const doubleCatchPattern = /} catch \([^)]*\) {\s*}\s*}/g;
  if (doubleCatchPattern.test(content)) {
    content = content.replace(doubleCatchPattern, "} catch (error) {}\n}");
    modified = true;
    changeCount++;
  }

  if (modified) {
    fs.writeFileSync(filePath, content, "utf8");
    console.log(`Fixed ${changeCount} syntax issues in: ${filePath}`);
  }
}

// Start processing from the current directory
const startPath = process.cwd();
console.log("Fixing syntax errors left by console.log removal...");
processDirectory(startPath);
console.log("Done!");
