import { Redis } from "@upstash/redis";

// Create Redis client with connection info from environment variables
export const redis = new Redis({
  url: process.env.REDIS_URL || "",
  token: process.env.REDIS_TOKEN || "",
});

// Check if Redis is configured
const isRedisConfigured = !!(process.env.REDIS_URL && process.env.REDIS_TOKEN);

// Use a memory fallback when Redis is not available
const memoryCache = new Map<string, { value: string; expiry: number }>();

// Helper functions for cart caching
export async function getCartFromCache(userId: string) {
  try {
    if (!isRedisConfigured) {
      // Use memory cache fallback
      const item = memoryCache.get(`cart:${userId}`);
      if (item && item.expiry > Date.now()) {
        return item.value;
      }
      return null;
    }

    // Use Redis
    return await redis.get(`cart:${userId}`);
  } catch (error) {
    console.error("Redis get error:", error);
    // Fallback to memory cache on Redis error
    const item = memoryCache.get(`cart:${userId}`);
    return item && item.expiry > Date.now() ? item.value : null;
  }
}

export async function setCartInCache(
  userId: string,
  cart: any,
  expirationSeconds = 600
) {
  const cartString = JSON.stringify(cart);

  try {
    if (!isRedisConfigured) {
      // Use memory cache fallback
      memoryCache.set(`cart:${userId}`, {
        value: cartString,
        expiry: Date.now() + expirationSeconds * 1000,
      });
      return true;
    }

    // Use Redis
    return await redis.set(`cart:${userId}`, cartString, {
      ex: expirationSeconds,
    });
  } catch (error) {
    console.error("Redis set error:", error);
    // Fallback to memory cache on Redis error
    memoryCache.set(`cart:${userId}`, {
      value: cartString,
      expiry: Date.now() + expirationSeconds * 1000,
    });
    return false;
  }
}

export async function invalidateCartCache(userId: string) {
  try {
    if (!isRedisConfigured) {
      // Use memory cache fallback
      memoryCache.delete(`cart:${userId}`);
      return true;
    }

    // Use Redis
    return await redis.del(`cart:${userId}`);
  } catch (error) {
    console.error("Redis del error:", error);
    // Fallback to memory cache on Redis error
    memoryCache.delete(`cart:${userId}`);
    return false;
  }
}
