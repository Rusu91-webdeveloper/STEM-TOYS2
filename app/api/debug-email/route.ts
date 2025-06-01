import { NextRequest, NextResponse } from "next/server";
import { resend } from "@/lib/resend";

export async function GET(request: NextRequest) {
  // Only allow this route in development
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "This endpoint is only available in development mode" },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json(
      { error: "Email parameter is required" },
      { status: 400 }
    );
  }

  try {
    // Log environment variables (without revealing full API keys)
    const apiKey = process.env.RESEND_API_KEY || "";
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";

    console.log("Debug Email Environment Variables:");
    console.log(
      `RESEND_API_KEY: ${apiKey ? apiKey.substring(0, 8) + "..." : "Not set"}`
    );
    console.log(`NEXT_PUBLIC_SITE_URL: ${siteUrl || "Not set"}`);

    // Try sending a simple test email directly with Resend
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error: "RESEND_API_KEY is not configured in .env.local",
          resendConfigured: false,
          siteUrlConfigured: !!siteUrl,
        },
        { status: 500 }
      );
    }

    console.log(`Attempting to send a test email to ${email}...`);

    const result = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Test Email from NextCommerce",
      html: "<h1>This is a test email</h1><p>If you're seeing this, the Resend API is working correctly!</p>",
      text: "This is a test email. If you're seeing this, the Resend API is working correctly!",
    });

    console.log("Resend API response:", result);

    return NextResponse.json({
      success: true,
      message: "Check server logs for detailed information",
      resendConfigured: true,
      siteUrlConfigured: !!siteUrl,
      result: result,
    });
  } catch (error) {
    console.error("Error in debug-email endpoint:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
