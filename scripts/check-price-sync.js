const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();

async function checkPrices() {
  console.log("📊 Checking price differences between books and products...\n");

  const books = await db.book.findMany({
    select: { id: true, name: true, slug: true, price: true, isActive: true },
  });

  const products = await db.product.findMany({
    select: { id: true, name: true, slug: true, price: true, isActive: true },
  });

  console.log("📚 BOOKS:");
  books.forEach((book) => {
    console.log(`   ${book.name}: ${book.price} RON (ID: ${book.id})`);
  });

  console.log("\n📦 PRODUCTS:");
  products.forEach((product) => {
    console.log(`   ${product.name}: ${product.price} RON (ID: ${product.id})`);
  });

  console.log("\n🔍 PRICE COMPARISON:");
  books.forEach((book) => {
    const matchingProduct = products.find((p) => p.slug === book.slug);
    if (matchingProduct) {
      const priceDiff = Math.abs(book.price - matchingProduct.price);
      if (priceDiff > 0.01) {
        console.log(`❌ ${book.name}:`);
        console.log(`    Book price: ${book.price} RON`);
        console.log(`    Product price: ${matchingProduct.price} RON`);
        console.log(`    Difference: ${priceDiff} RON`);
      } else {
        console.log(`✅ ${book.name}: Prices match (${book.price} RON)`);
      }
    } else {
      console.log(`⚠️  ${book.name}: No matching product found`);
    }
  });

  await db.$disconnect();
}

checkPrices().catch(console.error);
