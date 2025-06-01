import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json(
      {
        error: "Email parameter is required",
      },
      { status: 400 }
    );
  }

  try {
    const user = await db.user.findFirst({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        {
          error: "User not found",
        },
        { status: 404 }
      );
    }

    // Verify the user without email
    await db.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: `User ${email} has been verified successfully. You can now log in.`,
    });
  } catch (error) {
    console.error("Error verifying user:", error);
    return NextResponse.json(
      {
        error: "Failed to verify user",
      },
      { status: 500 }
    );
  }
}
