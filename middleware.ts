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
  const sessionCookie = request.cookies.get("next-auth.session-token")?.value;
  const secureSessionCookie = request.cookies.get(
    "__Secure-next-auth.session-token"
  )?.value;

  // We'll use either the regular or secure cookie, depending on which is available
  const authCookie = sessionCookie || secureSessionCookie;

  // Consider the user authenticated if ANY auth cookie exists
  const isAuthenticated = !!authCookie;

  // Debug authentication state
  console.log(
    `Path: ${pathname}, Auth Status: ${isAuthenticated ? "Authenticated" : "Not Authenticated"}`
  );
  if (isAuthenticated) {
    console.log(`Auth Cookie Present: ${authCookie ? "Yes" : "No"}`);
  }

  // Handle auth redirects
  if (pathname === "/auth/signin") {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }
  if (pathname === "/auth/signup") {
    return NextResponse.redirect(new URL("/auth/register", request.url));
  }

  // Protect checkout routes - ONLY if user is not authenticated
  if (pathname.startsWith("/checkout")) {
    if (isAuthenticated) {
      console.log(`User is authenticated, allowing access to ${pathname}`);
      // Continue with the request if authenticated
      return NextResponse.next();
    } else {
      // Check referer to avoid redirect loops and allow same-page refreshes
      const referer = request.headers.get("referer") || "";
      const currentOrigin = request.nextUrl.origin;
      const currentPath = pathname;

      // Check for cart in the referer - this means they are coming from the cart page
      const comingFromCart =
        referer.includes("/cart") ||
        referer.includes("minicart") ||
        referer.includes("shopping-cart");

      // Normalize the referer to check if it's from the same page
      const refererPath = referer.replace(currentOrigin, "").split("?")[0];

      // Check for potential redirect loops using our cookie
      const redirectCount = parseInt(
        request.cookies.get(REDIRECT_COOKIE)?.value || "0"
      );

      // Don't redirect if:
      // 1. Coming from login page
      // 2. Coming from any cart-related UI
      // 3. Coming from the same page (likely a language/currency change)
      // 4. We've already redirected too many times in a short period
      if (
        referer.includes("/auth/login") ||
        comingFromCart ||
        refererPath === currentPath ||
        redirectCount > 2
      ) {
        if (redirectCount > 2) {
          console.log(
            `Detected potential redirect loop (${redirectCount} redirects), allowing access`
          );
        } else {
          console.log(
            `Coming from login page, cart, or same page (${refererPath}), not redirecting again`
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
