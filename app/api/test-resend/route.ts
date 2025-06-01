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

  // In Resend testing mode, we can only send to the account owner's email
  const resendAccountEmail =
    process.env.RESEND_ACCOUNT_EMAIL || "webira.rem.srl@gmail.com";

  // Get the requested recipient for informational purposes only
  const { searchParams } = new URL(request.url);
  const requestedEmail = searchParams.get("email") || process.env.ADMIN_EMAIL;

  try {
    // Log configuration
    const apiKey = process.env.RESEND_API_KEY || "";
    console.log(`RESEND_API_KEY configured: ${apiKey ? "Yes" : "No"}`);
    console.log(`Requested email: ${requestedEmail}`);
    console.log(
      `Actual recipient (Resend account owner): ${resendAccountEmail}`
    );

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Resend API key not configured. Check RESEND_API_KEY in .env.local",
        },
        { status: 500 }
      );
    }

    // Send a test email using Resend to the account owner's email
    const result = await resend.emails.send({
      from: "onboarding@resend.dev", // Default sender for testing
      to: resendAccountEmail, // Always send to the account owner in testing mode
      subject: "Resend Test from NextCommerce",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4a5568;">Resend Test</h1>
          <p>This is a test email to verify that your Resend integration is working correctly.</p>
          <p>If you're seeing this, your email configuration is properly set up!</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
          <p style="color: #718096; font-size: 14px;">Sent using Resend API</p>
          <p style="color: #718096; font-size: 14px;">Note: In testing mode, emails can only be sent to the Resend account owner (${resendAccountEmail}).</p>
          <p style="color: #718096; font-size: 14px;">Original requested recipient: ${requestedEmail}</p>
        </div>
      `,
      text: "This is a test email to verify that your Resend integration is working correctly.",
    });

    console.log("Resend response:", result);

    return NextResponse.json({
      success: true,
      message: `Resend test completed successfully. Email sent to ${resendAccountEmail}.`,
      note: "In testing mode, emails can only be sent to the Resend account owner.",
      requestedEmail,
      actualRecipient: resendAccountEmail,
      result,
    });
  } catch (error) {
    console.error("Resend test failed:", error);

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
