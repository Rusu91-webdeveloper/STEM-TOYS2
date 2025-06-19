#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Specifically target the files with known issues
const targetFiles = [
  "features/cart/context/CartContext.tsx",
  "app/account/layout.tsx",
  "app/admin/analytics/components/ClientAnalytics.tsx",
];

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, "utf8");
    let modified = false;
    let changeCount = 0;

    // Fix missing closing parenthesis after variantId
    content = content.replace(
      /const cartItemId = getCartItemId\(\s*itemToAdd\.productId,\s*itemToAdd\.variantId\s*$/gm,
      "const cartItemId = getCartItemId(\n        itemToAdd.productId,\n        itemToAdd.variantId\n      );"
    );
    if (content.includes("const cartItemId = getCartItemId(")) {
      modified = true;
      changeCount++;
    }

    // Fix missing closing parentheses for map/filter functions
    content = content.replace(/: item\s*$/gm, ": item");

    // Fix callback functions missing closing parentheses
    const callbackPattern =
      /\}\s*catch\s*\(error\)\s*\{\s*\}\s*}\s*,\s*\[([\w,\s]*)\]\s*$/gm;
    const matches = content.match(callbackPattern);
    if (matches) {
      content = content.replace(
        callbackPattern,
        "} catch (error) {}\n    },\n    [$1]\n  );"
      );
      modified = true;
      changeCount++;
    }

    // Fix missing closing parentheses on reduce functions
    const reducePattern =
      /return\s+([\w.]+)\.reduce\(\s*\([^)]+\)\s*=>\s*[^,]+,\s*\d+\s*$/gm;
    if (reducePattern.test(content)) {
      content = content.replace(reducePattern, (match, p1) => {
        return match + "\n    );";
      });
      modified = true;
      changeCount++;
    }

    // Fix missing closing parentheses on setCartItems calls
    const setCartPattern = /\.filter\(\(item\) => item\.quantity > 0\)\s*$/gm;
    if (setCartPattern.test(content)) {
      content = content.replace(
        setCartPattern,
        ".filter((item) => item.quantity > 0)\n      );"
      );
      modified = true;
      changeCount++;
    }

    // Fix updateCartItemQuantity calls
    const updateCartPattern =
      /await updateCartItemQuantity\(\s*cartItemId,\s*existingItem\.quantity \+ quantity\s*$/gm;
    if (updateCartPattern.test(content)) {
      content = content.replace(
        updateCartPattern,
        "await updateCartItemQuantity(\n              cartItemId,\n              existingItem.quantity + quantity\n            );"
      );
      modified = true;
      changeCount++;
    }

    // Fix missing closing parenthesis on array methods
    const mapPattern = /: item\s*}\s*else\s*{/gm;
    if (mapPattern.test(content)) {
      content = content.replace(
        mapPattern,
        ": item\n          );\n        } else {"
      );
      modified = true;
      changeCount++;
    }

    // Fix async function syntax issues
    const asyncPattern = /\}\s*catch\s*\(error\)\s*\{\s*\}\s*}\s*;/gm;
    if (asyncPattern.test(content)) {
      content = content.replace(asyncPattern, "} catch (error) {}\n    };");
      modified = true;
      changeCount++;
    }

    // Fix missing closing parenthesis and brace at end of Context.Provider
    const providerPattern =
      /contextValue,\s*\]\s*return\s*\(\s*<CartContext\.Provider/gm;
    if (providerPattern.test(content)) {
      content = content.replace(
        providerPattern,
        "contextValue,\n    ]\n  );\n\n  return (\n    <CartContext.Provider"
      );
      modified = true;
      changeCount++;
    }

    // Fix final closing of the component
    const endPattern = /<\/CartContext\.Provider>\s*};$/gm;
    if (endPattern.test(content)) {
      content = content.replace(
        endPattern,
        "</CartContext.Provider>\n  );\n};"
      );
      modified = true;
      changeCount++;
    }

    if (modified) {
      fs.writeFileSync(filePath, content, "utf8");
      console.log(`Fixed ${changeCount} syntax issues in: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

// Process target files
console.log("Fixing callback syntax errors in specific files...");
targetFiles.forEach((file) => {
  const fullPath = path.join(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    fixFile(fullPath);
  } else {
    console.log(`File not found: ${file}`);
  }
});
console.log("Done!");
