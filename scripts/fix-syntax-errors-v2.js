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

  // Pattern 1: Detect unmatched closing braces from incomplete function bodies
  // This looks for patterns like:
  //   </div>
  //   \n
  //   }
  // Where the } should be );
  const unmatchedBracePattern = /(\s*<\/\w+>\s*\n\s*}\s*$)/gm;
  const matches = content.match(unmatchedBracePattern);

  if (matches) {
    // Count parentheses and braces to see if they're balanced
    const openParens = (content.match(/\(/g) || []).length;
    const closeParens = (content.match(/\)/g) || []).length;
    const openBraces = (content.match(/\{/g) || []).length;
    const closeBraces = (content.match(/\}/g) || []).length;

    // If we have more closing braces than opening, and missing closing parens
    if (closeBraces > openBraces && closeParens < openParens) {
      // Replace lone closing braces after JSX with );
      content = content.replace(/(\s*<\/\w+>\s*)\n(\s*)(})\s*$/gm, "$1\n$2);");
      modified = true;
      changeCount++;
    }
  }

  // Pattern 2: Fix specific pattern where we have:
  //   ...
  //   )
  //   \n
  //   }
  // This should remain as is if balanced, or become ); if not
  const loneClosePattern = /\)\s*\n\s*}\s*$/gm;
  if (loneClosePattern.test(content)) {
    const openParens = (content.match(/\(/g) || []).length;
    const closeParens = (content.match(/\)/g) || []).length;
    const openBraces = (content.match(/\{/g) || []).length;
    const closeBraces = (content.match(/\}/g) || []).length;

    if (closeBraces > openBraces && closeParens === openParens) {
      // Replace the last } with nothing since it's extra
      content = content.replace(/^(\s*})(\s*)$/gm, (match, p1, p2, offset) => {
        // Only replace if it's near the end of file
        if (offset > content.length - 100) {
          return "";
        }
        return match;
      });
      modified = true;
      changeCount++;
    }
  }

  // Pattern 3: Fix empty expressions (missing return statements)
  // Look for patterns like:
  //   </div>
  //   );
  //
  // }
  // This indicates missing return statement
  const missingReturnPattern = /(<\/\w+>\s*\);\s*\n\s*})/gm;
  if (missingReturnPattern.test(content)) {
    content = content.replace(/(<\/\w+>\s*\);\s*)(\n\s*})/gm, "$1\n  );$2");
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
console.log("Fixing remaining syntax errors...");
processDirectory(startPath);
console.log("Done!");
