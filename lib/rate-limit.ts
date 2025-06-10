import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { redis } from "@/lib/redis";

interface RateLimitConfig {
  /**
   * Maximum number of requests allowed in the windowMs timeframe
   */
  limit: number;

  /**
   * Time window in milliseconds
   */
  windowMs: number;

  /**
   * Optional identifier function (defaults to IP address)
   */
  identifierFn?: (req: NextRequest) => string;
}

/**
 * Redis-based rate limiting middleware for Next.js API routes
 * @param config Rate limiting configuration
 * @returns A function that can be used to rate limit requests
 */
export function rateLimit(config: RateLimitConfig) {
  const { limit, windowMs, identifierFn } = config;

  // Convert windowMs to seconds for Redis expiry
  const windowSeconds = Math.ceil(windowMs / 1000);

  return async function rateLimitMiddleware(req: NextRequest) {
    // Get identifier (default to IP from headers)
    const identifier = identifierFn
      ? identifierFn(req)
      : req.headers.get("x-forwarded-for") ||
        req.headers.get("x-real-ip") ||
        "unknown";

    // Create a unique Redis key for this rate limit
    const rateLimitKey = `ratelimit:${identifier}`;

    let currentCount = 0;
    let resetTime = 0;

    try {
      // Check if Redis is configured and available
      const isRedisConfigured = !!(
        process.env.REDIS_URL && process.env.REDIS_TOKEN
      );

      if (isRedisConfigured) {
        // Use Redis for distributed rate limiting
        // First, get the current count
        const result = await redis.get(rateLimitKey);
        currentCount = result ? parseInt(result as string, 10) : 0;

        // Get TTL to calculate reset time
        const ttl = await redis.ttl(rateLimitKey);
        resetTime = Date.now() + (ttl > 0 ? ttl * 1000 : windowMs);

        // Increment the counter
        currentCount++;

        // Update Redis with new count and set/reset expiry
        await redis.set(rateLimitKey, currentCount.toString(), {
          ex: windowSeconds,
        });
      } else {
        // Fallback to in-memory rate limiting if Redis is not available
        return fallbackInMemoryRateLimit(req, identifier, limit, windowMs);
      }
    } catch (error) {
      // If Redis fails, fall back to in-memory rate limiting
      console.error("Redis rate limiting error:", error);
      return fallbackInMemoryRateLimit(req, identifier, limit, windowMs);
    }

    // Calculate remaining requests and reset time
    const remaining = Math.max(0, limit - currentCount);
    const reset = Math.ceil((resetTime - Date.now()) / 1000); // in seconds

    // Set rate limit headers
    const headers = {
      "X-RateLimit-Limit": limit.toString(),
      "X-RateLimit-Remaining": remaining.toString(),
      "X-RateLimit-Reset": reset.toString(),
    };

    // If limit exceeded, return 429 Too Many Requests
    if (currentCount > limit) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          message: "Too many requests, please try again later.",
        }),
        {
          status: 429,
          headers: {
            ...headers,
            "Retry-After": reset.toString(),
          },
        }
      );
    }

    // Request allowed, pass through with rate limit headers
    return null;
  };
}

// In-memory storage for fallback rate limiting
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Fallback in-memory rate limiting when Redis is unavailable
 */
function fallbackInMemoryRateLimit(
  req: NextRequest,
  identifier: string,
  limit: number,
  windowMs: number
) {
  // Get current time
  const now = Date.now();

  // Get or initialize rate limit entry
  let rateLimit = rateLimitStore.get(identifier);

  if (!rateLimit || now > rateLimit.resetTime) {
    // Initialize or reset rate limit
    rateLimit = {
      count: 0,
      resetTime: now + windowMs,
    };
  }

  // Increment count
  rateLimit.count += 1;

  // Update store
  rateLimitStore.set(identifier, rateLimit);

  // Calculate remaining requests and reset time
  const remaining = Math.max(0, limit - rateLimit.count);
  const reset = Math.ceil((rateLimit.resetTime - now) / 1000); // in seconds

  // Set rate limit headers
  const headers = {
    "X-RateLimit-Limit": limit.toString(),
    "X-RateLimit-Remaining": remaining.toString(),
    "X-RateLimit-Reset": reset.toString(),
  };

  // If limit exceeded, return 429 Too Many Requests
  if (rateLimit.count > limit) {
    return new NextResponse(
      JSON.stringify({
        success: false,
        message: "Too many requests, please try again later.",
      }),
      {
        status: 429,
        headers: {
          ...headers,
          "Retry-After": reset.toString(),
        },
      }
    );
  }

  // Request allowed, pass through with rate limit headers
  return null;
}

/**
 * Clean up expired rate limit entries from in-memory store
 */
function cleanupRateLimitStore() {
  const now = Date.now();

  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }

  // Run cleanup every minute
  setTimeout(cleanupRateLimitStore, 60 * 1000);
}

// Initialize cleanup for the in-memory fallback
cleanupRateLimitStore();

/**
 * Helper function to apply rate limiting to an API route
 * @param handler The API route handler
 * @param config Rate limiting configuration
 * @returns The rate-limited API route handler
 */
export function withRateLimit(
  handler: (req: NextRequest) => Promise<NextResponse> | NextResponse,
  config: RateLimitConfig
) {
  const rateLimiter = rateLimit(config);

  return async function rateLimitedHandler(req: NextRequest) {
    // Apply rate limiting
    const rateLimitResponse = await rateLimiter(req);

    // If rate limit exceeded, return 429 response
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Otherwise, call original handler
    return handler(req);
  };
}
