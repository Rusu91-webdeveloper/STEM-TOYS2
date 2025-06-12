"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";

export function SessionValidator() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isValidating, setIsValidating] = useState(false);

  // Skip validation if there's no session or if we're already on the login page
  const shouldValidate =
    status === "authenticated" &&
    !pathname?.startsWith("/auth/") &&
    !pathname?.startsWith("/api/") &&
    pathname !== "/api/auth/clear-session";

  useEffect(() => {
    // Function to validate the session with the server
    async function validateSession() {
      if (!shouldValidate || isValidating) return;

      try {
        setIsValidating(true);

        // Add a cache-busting parameter to prevent caching
        const response = await fetch(
          `/api/auth/validate-session?t=${Date.now()}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!response.ok) {
          console.error("Session validation failed", response.status);
          return;
        }

        const data = await response.json();

        // If the session is invalid and the reason is that the user was deleted
        if (!data.valid && data.reason === "user-deleted") {
          console.log("User was deleted, signing out...");

          // Clear client-side authentication state
          await handleUserDeleted();
        }
      } catch (error) {
        console.error("Error validating session:", error);
      } finally {
        setIsValidating(false);
      }
    }

    // Aggressively clear all auth data when user is deleted
    async function handleUserDeleted() {
      // First, try to use the clear-session endpoint (server-side)
      try {
        window.location.href = "/api/auth/clear-session";
      } catch (error) {
        console.error("Failed to redirect to clear-session:", error);

        // Fallback: client-side logout + cookie clearing
        try {
          // Sign out using NextAuth
          await signOut({ redirect: false });

          // Clear cookies with client-side JavaScript
          document.cookie.split(";").forEach((cookie) => {
            const [name] = cookie.trim().split("=");
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/`;
          });

          // Clear storage
          localStorage.clear();
          sessionStorage.clear();

          // Redirect to login page
          router.push("/auth/login?error=UserDeleted");
        } catch (e) {
          console.error("Fallback logout failed:", e);
          // Last resort: hard redirect
          window.location.href = "/auth/login?error=UserDeleted";
        }
      }
    }

    // Run validation on component mount and when path changes
    validateSession();
  }, [shouldValidate, isValidating, router, pathname]);

  // This component doesn't render anything visible
  return null;
}
