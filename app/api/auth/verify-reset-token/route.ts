import { NextRequest, NextResponse } from "next/server";
import { resetTokens } from "../forgot-password/route";

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token");

    if (!token) {
      return NextResponse.json({ valid: false }, { status: 400 });
    }

    // Find the token in our store
    let found = false;
    let expired = true;

    for (const email of Object.keys(resetTokens)) {
      const resetData = resetTokens[email];

      if (resetData.token === token) {
        found = true;

        // Check if token is expired
        if (resetData.expires > Date.now()) {
          expired = false;
          break;
        }
      }
    }

    if (!found) {
      return NextResponse.json({ valid: false, reason: "token_not_found" });
    }

    if (expired) {
      return NextResponse.json({ valid: false, reason: "token_expired" });
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error("Error verifying reset token:", error);
    return NextResponse.json(
      { valid: false, reason: "server_error" },
      { status: 500 }
    );
  }
}
