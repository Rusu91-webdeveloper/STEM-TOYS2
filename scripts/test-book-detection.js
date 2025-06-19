// Test script to simulate book detection in the cart system
const testProducts = [
  {
    id: "cmc3doe6b0003jnx1c9fov5b3",
    name: "STEM Play for Neurodiverse Minds",
    slug: "stem-play-for-neurodiverse-minds",
    price: 49.99,
    images: ["/STEM_play_for_neurodiverse_minds.jpg"],
    category: {
      id: "cmc3dnk610000jnv5u0gg2vv4",
      name: "Educational Books",
      slug: "educational-books",
    },
    attributes: {},
    isBook: true, // This should be set in the products page
  },
  {
    id: "cmc3doe1y0001jnx1uvsj684t",
    name: "Born for the Future",
    slug: "born-for-the-future",
    price: 49.99,
    images: ["/born_for_the_future.jpg"],
    category: {
      id: "cmc3dnk610000jnv5u0gg2vv4",
      name: "Educational Books",
      slug: "educational-books",
    },
    attributes: {},
    isBook: true, // This should be set in the products page
  },
];

// Simulate the book detection logic from ProductCard
function detectIsBook(product) {
  return Boolean(
    product.isBook ||
      product.attributes?.author ||
      product.tags?.includes("book") ||
      product.category?.slug === "educational-books" ||
      product.category?.name === "Educational Books"
  );
}

// Simulate the cart item creation
function createCartItem(product) {
  const isBook = detectIsBook(product);

  return {
    productId: product.id,
    name: product.name,
    price: product.price,
    quantity: 1,
    image: product.images[0],
    isBook: isBook,
  };
}

// Test the book detection
console.log("🧪 Testing Book Detection Logic...\n");

testProducts.forEach((product, index) => {
  console.log(`${index + 1}. Testing: ${product.name}`);

  const isBook = detectIsBook(product);
  const cartItem = createCartItem(product);

  console.log(`   Product has isBook flag: ${product.isBook}`);
  console.log(`   Category name: ${product.category?.name}`);
  console.log(`   Category slug: ${product.category?.slug}`);
  console.log(`   Detected as book: ${isBook}`);
  console.log(`   Cart item isBook: ${cartItem.isBook}`);
  console.log(`   ✅ ${isBook ? "PASS" : "FAIL"} - Should be detected as book`);
  console.log("");
});

// Simulate checkout order items
console.log("📦 Simulated Checkout Order Items:");
const orderItems = testProducts.map((product) => {
  const cartItem = createCartItem(product);
  return {
    productId: cartItem.productId,
    name: cartItem.name,
    price: cartItem.price,
    quantity: cartItem.quantity,
    isBook: cartItem.isBook,
  };
});

console.log(JSON.stringify(orderItems, null, 2));

console.log("\n🎯 Expected Result: Both items should have isBook: true");
console.log(
  `🏁 Actual Result: ${orderItems.every((item) => item.isBook === true) ? "SUCCESS" : "FAILED"}`
);

if (orderItems.every((item) => item.isBook === true)) {
  console.log("✅ Book detection is working correctly!");
} else {
  console.log("❌ Book detection needs fixing!");
  orderItems.forEach((item) => {
    if (!item.isBook) {
      console.log(`   - ${item.name} was not detected as a book`);
    }
  });
}
