"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

/**
 * Session validator component that checks if the user session is still valid
 * This helps catch cases where a user has been deleted from the database
 * but still has a valid session token in their browser
 */
export function SessionValidator() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const isValidating = useRef(false);

  // Only run on authenticated routes
  const shouldCheckSession =
    status === "authenticated" &&
    !pathname.startsWith("/auth") &&
    !pathname.startsWith("/api/auth") &&
    !pathname.includes("/api/auth/clear-session");

  useEffect(() => {
    // Avoid multiple simultaneous validation attempts
    if (isValidating.current || !shouldCheckSession) return;

    // Check for error flag in session
    if (session?.user && (session.user as any).error === "RefetchError") {
      console.warn("Session error detected, redirecting to clear session...");
      router.push("/api/auth/clear-session");
      return;
    }

    // Periodic session validation
    const validateSession = async () => {
      try {
        isValidating.current = true;

        // Call server endpoint to validate session
        const res = await fetch("/api/auth/validate-session");
        const data = await res.json();

        if (!data.valid) {
          console.warn("Session invalid, redirecting to clear session...");
          router.push("/api/auth/clear-session");
        }
      } catch (error) {
        console.error("Error validating session:", error);
      } finally {
        isValidating.current = false;
      }
    };

    // Run on mount
    validateSession();

    // And then periodically (every 5 minutes)
    const interval = setInterval(validateSession, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [session, router, shouldCheckSession, pathname]);

  return null;
}
