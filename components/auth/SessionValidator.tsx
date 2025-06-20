"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

/**
 * **OPTIMIZED** Session validator component that efficiently checks session validity
 * Reduced validation frequency and smarter caching for better performance
 */
export function SessionValidator() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const isValidating = useRef(false);
  const lastValidationTime = useRef(0);
  const validationCache = useRef<
    Map<string, { valid: boolean; timestamp: number }>
  >(new Map());
  const [validationError, setValidationError] = useState<string | null>(null);

  // **PERFORMANCE**: Only validate on critical routes
  const criticalRoutes = ["/account", "/admin", "/checkout"];
  const shouldCheckSession =
    status === "authenticated" &&
    criticalRoutes.some((route) => pathname.startsWith(route)) &&
    !pathname.startsWith("/auth") &&
    !pathname.startsWith("/api/auth") &&
    !pathname.includes("/api/auth/clear-session");

  // **PERFORMANCE**: Debounced validation to prevent excessive calls
  const VALIDATION_COOLDOWN = 2 * 60 * 1000; // 2 minutes between validations
  const CACHE_DURATION = 5 * 60 * 1000; // Cache results for 5 minutes

  const getCachedValidation = (userId: string) => {
    const cached = validationCache.current.get(userId);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached;
    }
    return null;
  };

  const setCachedValidation = (userId: string, valid: boolean) => {
    validationCache.current.set(userId, {
      valid,
      timestamp: Date.now(),
    });

    // Clean up old cache entries
    for (const [key, value] of validationCache.current.entries()) {
      if (Date.now() - value.timestamp > CACHE_DURATION) {
        validationCache.current.delete(key);
      }
    }
  };

  useEffect(() => {
    // Skip if not on critical routes or already validating
    if (!shouldCheckSession || isValidating.current) return;

    // **PERFORMANCE**: Skip if validated recently
    const now = Date.now();
    if (now - lastValidationTime.current < VALIDATION_COOLDOWN) {
      return;
    }

    // Check for error flag in session
    if (session?.user && (session.user as any).error === "RefetchError") {
      console.warn("Session error detected, redirecting to clear session...");
      router.push("/api/auth/clear-session");
      return;
    }

    // **PERFORMANCE**: Check cache first
    if (session?.user?.id) {
      const cached = getCachedValidation(session.user.id);
      if (cached) {
        if (!cached.valid) {
          console.warn("Cached session invalid, redirecting...");
          router.push("/api/auth/clear-session");
        }
        return;
      }
    }

    // Optimized session validation with timeout and error handling
    const validateSession = async () => {
      if (!session?.user?.id) return;

      try {
        isValidating.current = true;
        lastValidationTime.current = now;
        setValidationError(null);

        // **PERFORMANCE**: Add timeout to prevent hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        const res = await fetch("/api/auth/validate-session", {
          signal: controller.signal,
          cache: "no-cache", // Ensure fresh validation
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
          throw new Error(`Validation failed: ${res.status}`);
        }

        const data = await res.json();

        // Cache the result
        setCachedValidation(session.user.id, data.valid);

        if (!data.valid) {
          console.warn("Session invalid, redirecting to clear session...");
          router.push("/api/auth/clear-session");
        }
      } catch (error) {
        if (error instanceof Error) {
          if (error.name === "AbortError") {
            console.warn(
              "Session validation timeout - continuing with session"
            );
            setValidationError("Validation timeout");
          } else {
            console.error("Error validating session:", error.message);
            setValidationError(error.message);
          }
        }
        // **PERFORMANCE**: Don't redirect on network errors - continue with existing session
      } finally {
        isValidating.current = false;
      }
    };

    // Run validation
    validateSession();

    // **PERFORMANCE**: Reduced periodic validation frequency
    // Only set interval if on critical routes and session exists
    if (shouldCheckSession && session?.user?.id) {
      const interval = setInterval(validateSession, 10 * 60 * 1000); // Every 10 minutes instead of 5
      return () => clearInterval(interval);
    }
  }, [session, router, shouldCheckSession, pathname]);

  // **DEBUG**: Show validation errors in development
  if (process.env.NODE_ENV === "development" && validationError) {
    console.warn("SessionValidator error:", validationError);
  }

  return null;
}
