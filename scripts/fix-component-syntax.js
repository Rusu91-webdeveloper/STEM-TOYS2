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

  // Pattern 1: Fix missing closing parenthesis for React components
  // Look for patterns ending with </div> followed by a lone closing brace
  const componentEndPattern = /(\s*<\/\w+>\s*)\n(\s*)\n(\s*})\s*$/;
  const match = content.match(componentEndPattern);

  if (match) {
    // Count parentheses and braces to check if they're balanced
    const openParens = (content.match(/\(/g) || []).length;
    const closeParens = (content.match(/\)/g) || []).length;

    // If we have more opening parens than closing parens, we're missing a closing paren
    if (openParens > closeParens) {
      // Replace the pattern with proper closing
      content = content.replace(componentEndPattern, "$1\n$2);\n$3");
      modified = true;
      changeCount++;
    }
  }

  // Pattern 2: Fix patterns where there's only one empty line between closing tag and brace
  const singleLinePattern = /(\s*<\/\w+>\s*)\n(\s*}\s*)$/;
  const match2 = content.match(singleLinePattern);

  if (match2) {
    const openParens = (content.match(/\(/g) || []).length;
    const closeParens = (content.match(/\)/g) || []).length;

    if (openParens > closeParens) {
      content = content.replace(singleLinePattern, "$1\n  );\n$2");
      modified = true;
      changeCount++;
    }
  }

  // Pattern 3: Fix } else { patterns that should have a closing paren before
  const elsePattern = /(\s*)\n(\s*}\s*else\s*{\s*)$/m;
  const match3 = content.match(elsePattern);

  if (match3) {
    const linesBeforeElse = content
      .substring(0, content.lastIndexOf(match3[0]))
      .split("\n");
    const lastNonEmptyLine = linesBeforeElse
      .filter((line) => line.trim())
      .pop();

    // Check if the line before contains JSX or looks like it needs a closing paren
    if (
      lastNonEmptyLine &&
      (lastNonEmptyLine.includes("/>") || lastNonEmptyLine.includes("</"))
    ) {
      const beforeElse = content.substring(0, content.lastIndexOf(match3[0]));
      const afterElse = content.substring(content.lastIndexOf(match3[0]));

      // Count parentheses up to this point
      const openParens = (beforeElse.match(/\(/g) || []).length;
      const closeParens = (beforeElse.match(/\)/g) || []).length;

      if (openParens > closeParens) {
        content = beforeElse + "\n    );\n" + afterElse;
        modified = true;
        changeCount++;
      }
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, "utf8");
    console.log(
      `Fixed ${changeCount} React component syntax issues in: ${filePath}`
    );
  }
}

// Start processing from the current directory
const startPath = process.cwd();
console.log("Fixing React component syntax errors...");
processDirectory(startPath);
console.log("Done!");
