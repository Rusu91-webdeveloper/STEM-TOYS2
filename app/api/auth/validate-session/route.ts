import { auth } from "@/lib/auth";
import { verifyUserExists } from "@/lib/db-helpers";
import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";

/**
 * API route to validate a user's session against the database
 * This helps catch cases where a user has been deleted but
 * still has a valid session token in their browser
 */
export async function GET(request: NextRequest) {
  try {
    // Get current session
    const session = await auth();

    // If no session, return false
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ valid: false, reason: "no-session" });
    }

    // Extract user ID for clarity
    const userId = session.user.id;

    // Check if this is a fresh Google auth session
    const tokenData = (session as any).token || {};
    const isRecentGoogleAuth =
      tokenData.googleAuthTimestamp &&
      Date.now() - tokenData.googleAuthTimestamp < 120000; // 2 minute grace period

    if (isRecentGoogleAuth) {
      logger.info(
        "Validating fresh Google auth session with extended verification",
        {
          userId,
        }
      );

      // For fresh Google auth, use extended verification with multiple retries and longer delays
      let userExists = false;

      // Multiple rounds of verification with increasing delays
      for (let attempt = 0; attempt < 5; attempt++) {
        userExists = await verifyUserExists(userId, {
          maxRetries: 3,
          delayMs: 500 * (attempt + 1), // Increasing delay with each attempt
        });

        if (userExists) {
          logger.info(
            `User verified on attempt ${attempt + 1} in validation endpoint`,
            { userId }
          );
          return NextResponse.json({ valid: true });
        }

        // Wait before next verification round
        await new Promise((resolve) =>
          setTimeout(resolve, 500 * (attempt + 1))
        );
      }

      // If still not found after all attempts
      logger.warn(
        "Fresh auth session validation failed - user not found after extended verification",
        { userId }
      );
      return NextResponse.json({
        valid: false,
        reason: "user-not-found-extended",
        isRecentAuth: true,
      });
    }

    // Standard verification for established sessions
    const userExists = await verifyUserExists(userId);

    if (userExists) {
      return NextResponse.json({ valid: true });
    } else {
      logger.warn("Session validation failed - user doesn't exist", { userId });
      return NextResponse.json({
        valid: false,
        reason: "user-not-found",
      });
    }
  } catch (error) {
    logger.error("Error validating session", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({
      valid: false,
      reason: "server-error",
    });
  }
}
