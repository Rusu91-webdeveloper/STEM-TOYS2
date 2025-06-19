#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Files with known issues based on build errors
const specificFixes = [
  {
    file: "components/ui/alert-dialog.tsx",
    fixes: [
      {
        find: /\s*\)\s*\/>\s*\n\s*AlertDialogPortal\.displayName/gm,
        replace: "  />\n));\nAlertDialogPortal.displayName",
      },
    ],
  },
  {
    file: "features/cart/context/CartContext.tsx",
    fixes: [
      {
        find: /\.filter\(\(item\) => item\.quantity > 0\) \/\/ Remove item if quantity is 0\s*\n\s*\/\/ Then try to sync/gm,
        replace:
          ".filter((item) => item.quantity > 0) // Remove item if quantity is 0\n      );\n\n      // Then try to sync",
      },
    ],
  },
  {
    file: "features/cart/context/CheckoutTransitionContext.tsx",
    fixes: [
      {
        find: /<\/CheckoutTransitionContext\.Provider>\s*\n\s*}\s*$/,
        replace: "</CheckoutTransitionContext.Provider>\n  );\n}",
      },
    ],
  },
  {
    file: "features/checkout/components/CheckoutFlow.tsx",
    fixes: [
      {
        find: /shippingData\.freeThreshold\.price\s*\n\s*\/\/ Apply free shipping/gm,
        replace:
          "shippingData.freeThreshold.price\n            );\n\n            // Apply free shipping",
      },
    ],
  },
  {
    file: "lib/admin/api.ts",
    fixes: [
      {
        find: /process\.env\.NEXT_PUBLIC_API_URL \|\| "http:\/\/localhost:3000"\s*\n\s*url\.searchParams/gm,
        replace:
          'process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"\n    );\n\n    url.searchParams',
      },
    ],
  },
];

function fixFile(filePath, fixes) {
  try {
    let content = fs.readFileSync(filePath, "utf8");
    let modified = false;
    let changeCount = 0;

    fixes.forEach((fix) => {
      if (fix.find.test(content)) {
        content = content.replace(fix.find, fix.replace);
        modified = true;
        changeCount++;
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content, "utf8");
      console.log(`Fixed ${changeCount} syntax issues in: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

// Process specific fixes
console.log("Fixing final syntax errors...");
specificFixes.forEach(({ file, fixes }) => {
  const fullPath = path.join(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    fixFile(fullPath, fixes);
  } else {
    console.log(`File not found: ${file}`);
  }
});

// Also process common patterns across all tsx/ts files
const excludeDirs = [
  "node_modules",
  ".next",
  ".git",
  "scripts",
  "__tests__",
  "test",
  ".taskmaster",
];

const validExtensions = [".ts", ".tsx", ".js", ".jsx"];

function shouldProcessFile(filePath) {
  for (const excludeDir of excludeDirs) {
    if (
      filePath.includes(path.sep + excludeDir + path.sep) ||
      filePath.includes("/" + excludeDir + "/")
    ) {
      return false;
    }
  }

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
      processCommonPatterns(filePath);
    }
  }
}

function processCommonPatterns(filePath) {
  try {
    let content = fs.readFileSync(filePath, "utf8");
    let modified = false;
    let changeCount = 0;

    // Fix patterns like: }) => {
    // This often happens when parentheses are not properly closed
    const arrowFuncPattern = /\}\)\s*=>\s*\{\s*$/gm;
    if (arrowFuncPattern.test(content)) {
      // Count parentheses to see if we need to add closing ones
      const lines = content.split("\n");
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].match(/\}\)\s*=>\s*\{\s*$/)) {
          // Look backwards to find the opening
          let openCount = 0;
          let closeCount = 0;
          for (let j = i; j >= Math.max(0, i - 20); j--) {
            openCount += (lines[j].match(/\(/g) || []).length;
            closeCount += (lines[j].match(/\)/g) || []).length;
          }
          if (openCount > closeCount) {
            lines[i] = lines[i].replace(/\}\)\s*=>\s*\{\s*$/, "})) => {");
            modified = true;
            changeCount++;
          }
        }
      }
      if (modified) {
        content = lines.join("\n");
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content, "utf8");
      console.log(`Fixed ${changeCount} common patterns in: ${filePath}`);
    }
  } catch (error) {
    // Silently skip files with errors
  }
}

// Process common patterns
console.log("Processing common patterns...");
processDirectory(process.cwd());

console.log("Done!");
