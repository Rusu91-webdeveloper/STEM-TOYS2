const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();

async function syncBookPrices() {
  console.log("🔄 Synchronizing book prices with product prices...\n");

  const books = await db.book.findMany({
    select: { id: true, name: true, slug: true, price: true },
  });

  const products = await db.product.findMany({
    select: { id: true, name: true, slug: true, price: true },
  });

  console.log("Before synchronization:");

  for (const book of books) {
    const matchingProduct = products.find((p) => p.slug === book.slug);
    if (matchingProduct) {
      const priceDiff = Math.abs(book.price - matchingProduct.price);
      if (priceDiff > 0.01) {
        console.log(`📚 ${book.name}:`);
        console.log(`   Current book price: ${book.price} RON`);
        console.log(`   Product price: ${matchingProduct.price} RON`);
        console.log(
          `   ➡️  Updating book price to ${matchingProduct.price} RON`
        );

        await db.book.update({
          where: { id: book.id },
          data: { price: matchingProduct.price },
        });

        console.log(`   ✅ Updated!`);
      } else {
        console.log(
          `✅ ${book.name}: Prices already match (${book.price} RON)`
        );
      }
    } else {
      console.log(`⚠️  ${book.name}: No matching product found`);
    }
    console.log("");
  }

  console.log("🎉 Price synchronization completed!");

  // Verify the changes
  console.log("\nVerifying changes:");
  const updatedBooks = await db.book.findMany({
    select: { id: true, name: true, slug: true, price: true },
  });

  updatedBooks.forEach((book) => {
    const matchingProduct = products.find((p) => p.slug === book.slug);
    if (matchingProduct) {
      const match = Math.abs(book.price - matchingProduct.price) < 0.01;
      console.log(
        `${match ? "✅" : "❌"} ${book.name}: Book ${book.price} RON, Product ${matchingProduct.price} RON`
      );
    }
  });

  await db.$disconnect();
}

syncBookPrices().catch(console.error);
