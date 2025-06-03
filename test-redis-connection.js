// Simple test script to verify Redis connection and cart caching

// Use environment variables directly from process.env
// If needed, you can set these values directly here for testing
const REDIS_URL = process.env.REDIS_URL || "";
const REDIS_TOKEN = process.env.REDIS_TOKEN || "";

const { Redis } = require("@upstash/redis");

// Check if Redis is configured
const isRedisConfigured = !!(REDIS_URL && REDIS_TOKEN);

if (!isRedisConfigured) {
  console.log(
    "Redis is not configured. Please set REDIS_URL and REDIS_TOKEN in your .env file."
  );
  console.log("Continuing with memory cache fallback...");
}

// Create Redis client with connection info
const redis = new Redis({
  url: REDIS_URL,
  token: REDIS_TOKEN,
});

// Use a memory fallback when Redis is not available
const memoryCache = new Map();

async function testRedisConnection() {
  try {
    console.log("Testing Redis connection...");

    // Test Redis connection
    if (isRedisConfigured) {
      try {
        const pingResult = await redis.ping();
        console.log("Redis ping result:", pingResult);
      } catch (error) {
        console.error("Redis connection failed:", error);
        console.log("Falling back to memory cache...");
      }
    } else {
      console.log("Skipping Redis connection test (not configured)");
    }

    // Test cart caching functions
    console.log("\nTesting cart caching...");
    const userId = "test-user";

    // Create a test cart
    const testCart = [
      {
        id: "1",
        productId: "prod1",
        name: "Test Product 1",
        price: 19.99,
        quantity: 2,
      },
      {
        id: "2",
        productId: "prod2",
        name: "Test Product 2",
        price: 29.99,
        quantity: 1,
      },
    ];

    // Cache the cart
    console.log(`Setting cart for user ${userId}...`);
    let result;

    try {
      if (isRedisConfigured) {
        try {
          result = await redis.set(`cart:${userId}`, JSON.stringify(testCart), {
            ex: 60,
          });
        } catch (error) {
          console.error("Error setting cart in Redis:", error);
          console.log("Using memory cache instead");
          memoryCache.set(`cart:${userId}`, JSON.stringify(testCart));
          result = true;
        }
      } else {
        memoryCache.set(`cart:${userId}`, JSON.stringify(testCart));
        result = true;
      }
      console.log("Set cart result:", result);
    } catch (error) {
      console.error("Error setting cart:", error);
    }

    // Retrieve the cart
    console.log(`\nRetrieving cart for user ${userId}...`);
    let cachedCart;

    try {
      if (isRedisConfigured) {
        try {
          cachedCart = await redis.get(`cart:${userId}`);
        } catch (error) {
          console.error("Error getting cart from Redis:", error);
          cachedCart = memoryCache.get(`cart:${userId}`);
        }
      } else {
        cachedCart = memoryCache.get(`cart:${userId}`);
      }

      if (cachedCart) {
        console.log("Raw cached cart:", cachedCart);
        const parsedCart = JSON.parse(cachedCart);
        console.log("Parsed cart:", parsedCart);
      } else {
        console.log("No cart found in cache");
      }
    } catch (error) {
      console.error("Error retrieving cart:", error);
    }

    // Delete the cart
    console.log(`\nDeleting cart for user ${userId}...`);

    try {
      if (isRedisConfigured) {
        try {
          result = await redis.del(`cart:${userId}`);
        } catch (error) {
          console.error("Error deleting cart from Redis:", error);
          memoryCache.delete(`cart:${userId}`);
          result = true;
        }
      } else {
        memoryCache.delete(`cart:${userId}`);
        result = true;
      }
      console.log("Delete cart result:", result);
    } catch (error) {
      console.error("Error deleting cart:", error);
    }

    console.log("\nTest complete!");
  } catch (error) {
    console.error("Test failed:", error);
  }
}

testRedisConnection();
