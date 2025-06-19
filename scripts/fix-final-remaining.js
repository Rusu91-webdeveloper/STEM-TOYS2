#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// More targeted fixes
const fixes = [
  {
    file: "features/cart/context/CartContext.tsx",
    fix: (content) => {
      // Fix missing closing parenthesis on useMemo
      return content.replace(
        /syncWithServer,\s*\]\s*\n\s*return \(/gm,
        "syncWithServer,\n    ]\n  );\n\n  return ("
      );
    },
  },
  {
    file: "features/checkout/components/CheckoutFlow.tsx",
    fix: (content) => {
      // Fix missing assignment
      return content.replace(
        /t\(\s*"orderProcessingError",\s*"An error occurred while placing your order"\s*\);\s*\n\s*setIsProcessingOrder/gm,
        'toast({\n          title: t(\n            "orderProcessingError",\n            "An error occurred while placing your order"\n          ),\n          variant: "destructive"\n        });\n\n      setIsProcessingOrder'
      );
    },
  },
  {
    file: "lib/currency/index.tsx",
    fix: (content) => {
      // Fix missing closing parenthesis
      return content.replace(
        /<\/CurrencyContext\.Provider>\s*\n\s*\}\s*\n\s*\/\/ Hook to use currency/gm,
        "</CurrencyContext.Provider>\n  );\n}\n\n// Hook to use currency"
      );
    },
  },
  {
    file: "lib/i18n/index.ts",
    fix: (content) => {
      // Fix missing closing parenthesis on React.createElement
      return content.replace(
        /children\s*\n\s*\}\s*\n\s*\/\/ Hook to use translations/gm,
        "children\n  );\n}\n\n// Hook to use translations"
      );
    },
  },
  {
    file: "app/account/addresses/[id]/edit/page.tsx",
    fix: (content) => {
      // Fix missing return statement
      return content.replace(
        /<\/div>\s*\n\s*<\/div>\s*\n\s*\}\s*\n\s*return \(/gm,
        "</div>\n      </div>\n    );\n  }\n\n  return ("
      );
    },
  },
];

function processFile(filePath, fixFn) {
  try {
    let content = fs.readFileSync(filePath, "utf8");
    const newContent = fixFn(content);

    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent, "utf8");
      console.log(`Fixed: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

console.log("Fixing final remaining syntax errors...");
let fixCount = 0;

fixes.forEach(({ file, fix }) => {
  const fullPath = path.join(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    if (processFile(fullPath, fix)) {
      fixCount++;
    }
  } else {
    console.log(`File not found: ${file}`);
  }
});

console.log(`Fixed ${fixCount} files.`);
console.log("Done!");
