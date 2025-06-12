"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

/**
 * Custom hook to validate user sessions and redirect deleted users
 * @param redirectPath - Path to redirect to if session is invalid (default: "/auth/login")
 * @returns Object containing session status information
 */
export function useSessionGuard(redirectPath = "/auth/login") {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [isValidating, setIsValidating] = useState(false);
  const validateAttempted = useRef(false);

  useEffect(() => {
    const validateSession = async () => {
      // Skip validation if already in progress or not authenticated
      if (isValidating || status !== "authenticated" || !session?.user?.id) {
        return;
      }

      // Skip if we've already validated once
      if (validateAttempted.current) {
        return;
      }

      try {
        setIsValidating(true);
        validateAttempted.current = true;

        // Check if user exists in the database
        const res = await fetch("/api/auth/validate-session");
        const data = await res.json();

        if (!data.valid) {
          console.warn("Session invalid, redirecting to clear session...");
          router.push("/api/auth/clear-session");
        }
      } catch (error) {
        console.error("Error validating session:", error);
      } finally {
        setIsValidating(false);
      }
    };

    validateSession();
  }, [session, status, router, redirectPath, isValidating]);

  return {
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading" || isValidating,
    session,
    status,
  };
}
