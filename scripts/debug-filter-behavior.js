const fetch = require("node-fetch");

async function debugFilterBehavior() {
  console.log("🔍 Debugging filter behavior differences...\n");

  try {
    // Scenario A: Direct navigation (working)
    console.log(
      "📚 Scenario A: Direct navigation to /products?category=educational-books"
    );
    const directResponse = await fetch(
      "http://localhost:3000/products?category=educational-books",
      {
        headers: {
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        },
      }
    );

    if (directResponse.ok) {
      const directHtml = await directResponse.text();
      const directBooks = [
        "Born for the Future",
        "STEM Play for Neurodiverse Minds",
        "newest book",
        "icna o carte",
      ].filter((name) => directHtml.includes(name));

      console.log(`   Books found: ${directBooks.length}/4`);
      directBooks.forEach((book) => console.log(`   ✅ ${book}`));

      // Check if the page has the category pre-selected in server HTML
      const hasSelectedCategory =
        directHtml.includes("selected") ||
        directHtml.includes("Educational Books");
      console.log(`   Category pre-selected in HTML: ${hasSelectedCategory}`);
    }

    // Scenario B: Base products page (not working when filtered client-side)
    console.log(
      "\n📦 Scenario B: Base /products page (before client-side filtering)"
    );
    const baseResponse = await fetch("http://localhost:3000/products", {
      headers: {
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      },
    });

    if (baseResponse.ok) {
      const baseHtml = await baseResponse.text();
      const baseBooks = [
        "Born for the Future",
        "STEM Play for Neurodiverse Minds",
        "newest book",
        "icna o carte",
      ].filter((name) => baseHtml.includes(name));

      console.log(`   Books found: ${baseBooks.length}/4`);
      baseBooks.forEach((book) => console.log(`   ✅ ${book}`));

      // Check what products are loaded initially
      const hasBooks = baseHtml.includes("Born for the Future");
      const hasSTEMProducts =
        baseHtml.includes("science-kit") || baseHtml.includes("SCIENCE");
      console.log(`   Books in initial load: ${hasBooks}`);
      console.log(`   STEM products in initial load: ${hasSTEMProducts}`);
    }

    // Check what the server decides to load based on category parameter
    console.log("\n🎯 Analysis: Server-side logic difference");
    console.log("   When category=educational-books: Server loads BOOKS");
    console.log(
      "   When no category: Server loads ??? (books or STEM products?)"
    );
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

debugFilterBehavior();
