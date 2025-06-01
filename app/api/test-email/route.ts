import { NextRequest, NextResponse } from "next/server";
import {
  sendWelcomeEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "@/lib/email";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");
  const type = searchParams.get("type") || "welcome";

  if (!email) {
    return NextResponse.json(
      { error: "Email parameter is required" },
      { status: 400 }
    );
  }

  // Only allow this route in development
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "This endpoint is only available in development mode" },
      { status: 403 }
    );
  }

  try {
    let result = false;

    switch (type) {
      case "welcome":
        result = await sendWelcomeEmail(email, "Test User");
        break;
      case "verification":
        const mockToken = "test-verification-token-" + Date.now();
        result = await sendVerificationEmail(email, "Test User", mockToken);
        break;
      case "reset":
        const resetToken = "test-reset-token-" + Date.now();
        result = await sendPasswordResetEmail(email, resetToken);
        break;
      default:
        return NextResponse.json(
          {
            error:
              "Invalid email type. Use 'welcome', 'verification', or 'reset'",
          },
          { status: 400 }
        );
    }

    if (result) {
      return NextResponse.json({
        success: true,
        message: `${type} email sent to ${email}`,
        resendApiKey: process.env.RESEND_API_KEY ? "Configured" : "Missing",
        emailFrom: process.env.EMAIL_FROM || "Using default",
      });
    } else {
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error sending test email:", error);
    return NextResponse.json(
      { error: "An error occurred while sending the email", details: error },
      { status: 500 }
    );
  }
}
