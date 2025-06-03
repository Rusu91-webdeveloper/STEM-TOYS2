const Redis = require("ioredis");

// Create Redis client using URL format
const redis = new Redis(
  "redis://default:ATIhAAIjcDEwOTM1OWZhNmViMTQ0NTM3OGVhZmQ0NmM1MTQ5ODM0NHAxMA@splendid-oyster-12833.upstash.io:12833",
  {
    tls: {
      rejectUnauthorized: false, // Only for testing, use true in production
    },
    connectTimeout: 10000, // Increase timeout to 10 seconds
    retryStrategy: (times) => {
      const delay = Math.min(times * 500, 3000);
      return delay;
    },
  }
);

// Log connection events
redis.on("connect", () => {
  console.log("Connected to Redis");
});

redis.on("error", (err) => {
  console.error("Redis Error:", err);
});

// Test connection
async function testConnection() {
  try {
    // Test basic Redis operations
    console.log("Testing Redis connection...");

    const pingResult = await redis.ping();
    console.log("PING result:", pingResult);

    await redis.set("test-key", "Redis is working!");
    const value = await redis.get("test-key");
    console.log("Retrieved test value:", value);

    console.log("Redis connection is working correctly!");
  } catch (error) {
    console.error("Redis connection error:", error);
  } finally {
    // Close the connection
    redis.quit();
  }
}

testConnection();
