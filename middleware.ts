import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { securityHeaders, isDevelopment } from "@/lib/security";

// Supported locales
const locales = ["en", "ro"];
const defaultLocale = "en"; // Changed from "ro" to "en" as default until we have translated content

// Define a name for our redirect tracking cookie
const REDIRECT_COOKIE = "next-redirect-count";

/**
 * Next.js Middleware for applying security headers, authentication checks,
 * and other global request/response modifications.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for authentication by looking for auth cookies
  // We need to check all possible cookie names used by Next Auth
  const authCookies = [
    request.cookies.get("next-auth.session-token")?.value,
    request.cookies.get("__Secure-next-auth.session-token")?.value,
    // Development cookie name
    request.cookies.get("next-auth.session-token.0")?.value,
    request.cookies.get("__Host-next-auth.csrf-token")?.value,
  ];

  // Also check for guest sessions to support guest checkout
  const guestCookie = request.cookies.get("guest_id")?.value;

  // Consider the user authenticated if ANY auth cookie exists
  const isAuthenticated = authCookies.some((cookie) => !!cookie);

  // Check for a special header that might be set by client-side code
  const clientAuthHeader = request.headers.get("x-auth-token");
  const isClientAuthenticated = !!clientAuthHeader;

  // Final auth state combines both checks
  const isUserAuthenticated = isAuthenticated || isClientAuthenticated;

  // Debug authentication state
  console.log(
    `Path: ${pathname}, Auth Status: ${isUserAuthenticated ? "Authenticated" : "Not Authenticated"}`
  );
  if (isUserAuthenticated) {
    console.log(
      `Auth Cookie Present: ${isAuthenticated ? "Yes" : "No"}, Client Auth: ${isClientAuthenticated ? "Yes" : "No"}`
    );
  }

  // Handle auth redirects
  if (pathname === "/auth/signin") {
    if (isUserAuthenticated) {
      // If already logged in, redirect to home page
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }
  if (pathname === "/auth/signup") {
    if (isUserAuthenticated) {
      // If already logged in, redirect to home page
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.redirect(new URL("/auth/register", request.url));
  }

  // Protect checkout routes - ONLY if user is not authenticated
  if (pathname.startsWith("/checkout")) {
    // First check if URL contains our special auth parameter
    const hasAuthParam = request.nextUrl.searchParams.has("_auth");

    // Check for a special header from client-side navigation
    const isClientNav = request.headers.get("x-client-navigation") === "true";

    // Skip auth check for special browsers or crawlers that may not handle redirects well
    const userAgent = request.headers.get("user-agent") || "";
    const isSpecialClient =
      userAgent.includes("Googlebot") ||
      userAgent.includes("Headless") ||
      userAgent.includes("Puppeteer");

    // If URL has our special auth parameter, treat as authenticated
    if (isUserAuthenticated || isSpecialClient || hasAuthParam) {
      console.log(
        `User is authenticated or has auth param, allowing access to ${pathname}`
      );

      // Continue with the request if authenticated
      const response = NextResponse.next();

      // Clean up by removing the auth parameter if present
      if (hasAuthParam) {
        // Clone the URL
        const url = new URL(request.nextUrl);
        // Remove the auth parameter
        url.searchParams.delete("_auth");
        // Rewrite the URL while allowing access
        response.headers.set("x-middleware-rewrite", url.toString());
      }

      return response;
    } else {
      // Check if coming directly from a checkout button click in cart
      const referer = request.headers.get("referer") || "";
      const isComingFromCart = referer.includes("/cart");

      // If this is a client navigation or coming from cart, allow it
      // The client-side code will handle the redirect
      if (isClientNav || isComingFromCart) {
        console.log(
          `Client-side navigation to checkout, bypassing middleware redirect`
        );
        return NextResponse.next();
      }

      // Check for potential redirect loops using our cookie
      const redirectCount = parseInt(
        request.cookies.get(REDIRECT_COOKIE)?.value || "0"
      );

      // Don't redirect if:
      // 1. Coming from login page
      // 2. Coming from the same page (likely a language/currency change)
      // 3. We've already redirected too many times in a short period
      if (
        referer.includes("/auth/login") ||
        referer.split("?")[0] === request.nextUrl.origin + pathname ||
        redirectCount > 2
      ) {
        if (redirectCount > 2) {
          console.log(
            `Detected potential redirect loop (${redirectCount} redirects), allowing access`
          );
        } else {
          console.log(
            `Coming from login page or same page, not redirecting again`
          );
        }

        // Create a response that allows access
        const response = NextResponse.next();

        // Reset the redirect counter
        response.cookies.set(REDIRECT_COOKIE, "0", {
          maxAge: 60, // 1 minute expiry
          path: "/",
        });

        return response;
      } else {
        // Store the original checkout URL in a cookie so we can redirect back after login
        const signInUrl = new URL("/auth/login", request.url);
        signInUrl.searchParams.set("callbackUrl", pathname);
        console.log(
          `Redirecting unauthenticated user to login with callback to ${pathname}`
        );

        // Create the redirect response
        const response = NextResponse.redirect(signInUrl);

        // Increment the redirect counter
        response.cookies.set(REDIRECT_COOKIE, String(redirectCount + 1), {
          maxAge: 60, // 1 minute expiry
          path: "/",
        });

        return response;
      }
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
