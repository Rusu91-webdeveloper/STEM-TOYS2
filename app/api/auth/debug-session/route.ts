import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { logger } from "@/lib/logger";
import { verifyUserExists } from "@/lib/db-helpers";

/**
 * API endpoint to check the authentication state and database connection
 * Useful for debugging auth issues
 *
 * @returns JSON with session details and database check results
 */
export async function GET(request: NextRequest) {
  try {
    // Get current session
    const session = await auth();

    // Database connection test
    let dbConnectionOk = false;
    try {
      // Try a simple query to check if DB connection works
      await db.$queryRaw`SELECT 1`;
      dbConnectionOk = true;
    } catch (dbError) {
      logger.error("Database connection error", {
        error: dbError instanceof Error ? dbError.message : String(dbError),
      });
    }

    // If not authenticated, just return basic info
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({
        authenticated: false,
        session: null,
        dbConnectionOk,
        message: "Not authenticated",
      });
    }

    // For authenticated sessions, check user in database
    const userId = session.user.id;

    // Get token information for debugging
    const token = (session as any).token || {};
    const isRecentGoogleAuth =
      token.googleAuthTimestamp &&
      Date.now() - token.googleAuthTimestamp < 60000;

    // Check if user exists in database
    let userExists = false;
    let userDetails = null;
    try {
      userExists = await verifyUserExists(userId);

      if (userExists) {
        // Get basic user details for debugging
        userDetails = await db.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            email: true,
            isActive: true,
            role: true,
            createdAt: true,
          },
        });
      }
    } catch (userError) {
      logger.error("Error checking user in debug endpoint", {
        error:
          userError instanceof Error ? userError.message : String(userError),
        userId,
      });
    }

    // Return comprehensive debug information
    return NextResponse.json({
      authenticated: true,
      sessionExpires: session.expires,
      sessionUser: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
      },
      googleAuthInfo: {
        isRecentAuth: isRecentGoogleAuth,
        timestamp: token.googleAuthTimestamp,
        age: token.googleAuthTimestamp
          ? `${Math.round((Date.now() - token.googleAuthTimestamp) / 1000)} seconds`
          : null,
      },
      database: {
        connectionOk: dbConnectionOk,
        userExists,
        userDetails,
      },
    });
  } catch (error) {
    logger.error("Error in debug-session endpoint", {
      error: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      {
        error: "Failed to check session",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
