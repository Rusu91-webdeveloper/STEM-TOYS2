import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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

// In-memory storage for rate limiting
// In a production app, you would use Redis or another distributed cache
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Rate limiting middleware for Next.js API routes
 * @param config Rate limiting configuration
 * @returns A function that can be used to rate limit requests
 */
export function rateLimit(config: RateLimitConfig) {
  const { limit, windowMs, identifierFn } = config;

  // Clean up expired entries periodically
  cleanupRateLimitStore();

  return async function rateLimitMiddleware(req: NextRequest) {
    // Get identifier (default to IP from headers)
    const identifier = identifierFn
      ? identifierFn(req)
      : req.headers.get("x-forwarded-for") ||
        req.headers.get("x-real-ip") ||
        "unknown";

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
  };
}

/**
 * Cleanup function to remove expired rate limit entries
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
