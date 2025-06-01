import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function GET(request: NextRequest) {
  // Only allow this route in development
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "This endpoint is only available in development mode" },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email") || process.env.ADMIN_EMAIL;

  if (!email) {
    return NextResponse.json(
      { error: "No recipient email specified and ADMIN_EMAIL not set" },
      { status: 400 }
    );
  }

  try {
    // Log Gmail configuration
    const emailHost = process.env.EMAIL_HOST || "smtp.gmail.com";
    const emailPort = parseInt(process.env.EMAIL_PORT || "587");
    const emailUser = process.env.EMAIL_USER || "";
    const emailPass = process.env.EMAIL_PASS || "";
    const emailFrom = process.env.EMAIL_FROM || "";

    console.log("Gmail SMTP Configuration:");
    console.log(`EMAIL_HOST: ${emailHost}`);
    console.log(`EMAIL_PORT: ${emailPort}`);
    console.log(`EMAIL_USER: ${emailUser}`);
    console.log(`EMAIL_PASS: ${emailPass ? "********" : "Not set"}`);
    console.log(`EMAIL_FROM: ${emailFrom}`);
    console.log(`Sending to: ${email}`);

    if (!emailUser || !emailPass) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Email credentials not configured. Check EMAIL_USER and EMAIL_PASS in .env.local",
        },
        { status: 500 }
      );
    }

    // Create a specific test transporter for Gmail
    const testTransporter = nodemailer.createTransport({
      host: emailHost,
      port: emailPort,
      secure: emailPort === 465,
      auth: {
        user: emailUser,
        pass: emailPass,
      },
      debug: true, // Show debug info
    });

    // Verify connection configuration
    console.log("Verifying SMTP connection...");
    const verifyResult = await testTransporter.verify();
    console.log("SMTP Verification Result:", verifyResult);

    // Try to send a test email
    console.log(`Sending test email to ${email}...`);
    const info = await testTransporter.sendMail({
      from: emailFrom || emailUser,
      to: email,
      subject: "Gmail SMTP Test from NextCommerce",
      text: "This is a test email to verify Gmail SMTP configuration",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4a5568;">Gmail SMTP Test</h1>
          <p>This is a test email to verify that your Gmail SMTP configuration is working correctly.</p>
          <p>If you're seeing this, your email is properly configured!</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
          <p style="color: #718096; font-size: 14px;">Configuration:</p>
          <ul style="color: #718096; font-size: 14px;">
            <li>Host: ${emailHost}</li>
            <li>Port: ${emailPort}</li>
            <li>User: ${emailUser}</li>
          </ul>
        </div>
      `,
    });

    console.log("Email sent:", info);

    return NextResponse.json({
      success: true,
      message: "Gmail SMTP test completed successfully",
      verifyResult,
      mailResult: {
        messageId: info.messageId,
        envelope: info.envelope,
        accepted: info.accepted,
        rejected: info.rejected,
      },
    });
  } catch (error) {
    console.error("Gmail SMTP test failed:", error);

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
