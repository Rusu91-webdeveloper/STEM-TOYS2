#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Specific fixes for remaining issues
const fixes = [
  {
    file: "features/cart/context/CartContext.tsx",
    fix: (content) => {
      // Fix missing closing parenthesis on useCallback
      return content.replace(
        /\},\s*\[\]\s*\n\s*const clearCart = useCallback/gm,
        "},\n    []\n  );\n\n  const clearCart = useCallback"
      );
    },
  },
  {
    file: "features/checkout/components/CheckoutFlow.tsx",
    fix: (content) => {
      // Fix missing semicolon after error message
      return content.replace(
        /"An error occurred while placing your order"\s*\)\s*\n\s*setIsProcessingOrder/gm,
        '"An error occurred while placing your order"\n          );\n\n      setIsProcessingOrder'
      );
    },
  },
  {
    file: "lib/currency/index.tsx",
    fix: (content) => {
      // Fix missing closing parenthesis on createContext
      return content.replace(
        /const CurrencyContext = createContext<CurrencyContextType \| undefined>\(\s*undefined\s*\n\s*export function/gm,
        "const CurrencyContext = createContext<CurrencyContextType | undefined>(\n  undefined\n);\n\nexport function"
      );
    },
  },
  {
    file: "lib/i18n/index.ts",
    fix: (content) => {
      // Fix missing return statement
      return content.replace(
        /defaultValue \|\|\s*String\(key\)\s*\n\s*\};\s*\n\s*return React/gm,
        "defaultValue ||\n      String(key)\n    );\n  };\n\n  return React"
      );
    },
  },
  {
    file: "app/account/addresses/[id]/edit/page.tsx",
    fix: (content) => {
      // Fix missing return statement
      return content.replace(
        /<\/div>\s*\n\s*<\/div>\s*\n\s*\}\s*\n\s*if \(error\)/gm,
        "</div>\n      </div>\n    );\n  }\n\n  if (error)"
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

console.log("Fixing remaining syntax errors...");
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
