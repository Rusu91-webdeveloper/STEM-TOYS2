import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Middleware to protect admin routes by checking for admin role
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get the token from the request
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET || "placeholder-secret-for-development",
  });

  // Check if the user is authenticated and has admin role
  const isAuthenticated = !!token;
  const isAdmin = isAuthenticated && token?.role === "ADMIN";

  // If not authenticated or not admin, redirect to login
  if (!isAuthenticated || !isAdmin) {
    const signInUrl = new URL("/auth/login", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Allow access to admin routes
  return NextResponse.next();
}

/**
 * Apply middleware only to admin routes
 */
export const config = {
  matcher: ["/admin/:path*"],
};
