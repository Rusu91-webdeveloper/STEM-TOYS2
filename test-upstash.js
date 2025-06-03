const { Redis } = require("@upstash/redis");

// Create Redis client with connection info
const redis = new Redis({
  url: "https://splendid-oyster-12833.upstash.io",
  token: "ATIhAAIjcDEwOTM1OWZhNmViMTQ0NTM3OGVhZmQ0NmM1MTQ5ODM0NHAxMA",
});

async function testConnection() {
  try {
    console.log("Testing Upstash Redis connection...");

    // Test basic operations
    const pingResult = await redis.ping();
    console.log("PING result:", pingResult);

    // Set a value
    await redis.set("test-upstash-key", "Redis is working with Upstash!");
    console.log("Value set successfully");

    // Get the value back
    const value = await redis.get("test-upstash-key");
    console.log("Retrieved test value:", value);

    console.log("Upstash Redis connection is working correctly!");
  } catch (error) {
    console.error("Redis connection error:", error);
  }
}

testConnection();
