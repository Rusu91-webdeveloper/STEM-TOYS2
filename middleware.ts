import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { securityHeaders, isDevelopment } from "@/lib/security";

// Supported locales
const locales = ["en", "ro"];
const defaultLocale = "en"; // Changed from "ro" to "en" as default until we have translated content

/**
 * Next.js Middleware for applying security headers, authentication checks,
 * and other global request/response modifications.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authCookie =
    request.cookies.get("next-auth.session-token") ||
    request.cookies.get("__Secure-next-auth.session-token");
  const isAuthenticated = !!authCookie;

  // Handle auth redirects
  if (pathname === "/auth/signin") {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }
  if (pathname === "/auth/signup") {
    return NextResponse.redirect(new URL("/auth/register", request.url));
  }

  // Protect checkout routes
  if (pathname.startsWith("/checkout")) {
    if (!isAuthenticated) {
      const signInUrl = new URL("/auth/login", request.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  // For now, we'll disable automatic locale redirection until we have the proper i18n setup
  // This will allow the root route to work properly
  /*
  // Handle i18n routing
  const pathnameHasLocale = locales.some(
    (locale: string) =>
      pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (!pathnameHasLocale) {
    // Redirect if there is no locale
    const locale = defaultLocale;

    // e.g. incoming request is /products
    // The new URL is now /en/products
    return NextResponse.redirect(
      new URL(
        `/${locale}${pathname.startsWith("/") ? "" : "/"}${pathname}`,
        request.url
      )
    );
  }
  */

  // Get the response
  const response = NextResponse.next();

  // Add security headers
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
    /**
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
    // Add protection for checkout routes
    "/checkout/:path*",
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
