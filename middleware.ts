import { NextResponse, type NextRequest } from "next/server";
import { securityHeaders, isDevelopment } from "@/lib/security";

/**
 * Next.js Middleware for applying security headers and other global
 * request/response modifications.
 */
export function middleware(request: NextRequest) {
  // Get the response
  const response = NextResponse.next();

  // Apply security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Add Content-Security-Policy header
  if (!response.headers.has("Content-Security-Policy")) {
    response.headers.set("Content-Security-Policy", getContentSecurityPolicy());
  }

  return response;
}

/**
 * Define routes that the middleware should run on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

/**
 * Generate the Content-Security-Policy header value
 */
function getContentSecurityPolicy() {
  // Check if we're in development mode
  const dev = isDevelopment();

  // Base directives common to both development and production
  const baseDirectives = {
    // Default source restrictions
    "default-src": ["'self'"],

    // Style sources
    "style-src": ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],

    // Font sources
    "font-src": ["'self'", "fonts.gstatic.com", "data:"],

    // Image sources
    "img-src": [
      "'self'",
      "data:",
      "blob:",
      "utfs.io",
      "stripe.com",
      "placehold.co",
    ],

    // Do not allow object sources
    "object-src": ["'none'"],

    // Base URI restriction
    "base-uri": ["'self'"],

    // Form submission restriction
    "form-action": ["'self'"],

    // Frame embedding restriction
    "frame-ancestors": ["'none'"],
  };

  // Development-specific directives (more permissive)
  if (dev) {
    return Object.entries({
      ...baseDirectives,

      // In development, we need unsafe-eval and unsafe-inline
      "script-src": [
        "'self'",
        "'unsafe-eval'",
        "'unsafe-inline'", // Allow all inline scripts in development
        "js.stripe.com",
        "uploadthing.com",
      ],

      // Broad connection permissions for development
      "connect-src": [
        "'self'",
        "ws:",
        "wss:",
        "localhost:*",
        "127.0.0.1:*",
        "api.stripe.com",
        "uploadthing.com",
        "utfs.io",
        "*",
      ],

      // Frame sources
      "frame-src": ["*"],
    })
      .map(([key, values]) => `${key} ${values.join(" ")}`)
      .join("; ");
  }

  // Production-specific directives (more restrictive)
  return Object.entries({
    ...baseDirectives,

    // In production, we restrict to specific hashes and no unsafe practices
    "script-src": [
      "'self'",
      "js.stripe.com",
      "uploadthing.com",
      // Common hashes for Next.js chunks
      "'sha256-3nDgRibK3UlmR76UWeJNDmmAY5aX4OOXTmuvgixQxZA='",
      // For production, you should collect all script hashes during build
    ],

    // Specific connection permissions for production
    "connect-src": ["'self'", "api.stripe.com", "uploadthing.com", "utfs.io"],

    // Frame sources
    "frame-src": ["js.stripe.com"],

    // Force HTTPS
    "upgrade-insecure-requests": [],
  })
    .map(([key, values]) => {
      // Filter out empty arrays to avoid trailing spaces
      if (values.length === 0) return key;
      return `${key} ${values.join(" ")}`;
    })
    .join("; ");
}
