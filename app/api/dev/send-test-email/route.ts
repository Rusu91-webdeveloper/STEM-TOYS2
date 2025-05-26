import { NextRequest, NextResponse } from "next/server";
import { isDevelopment } from "@/lib/security";
import {
  sendWelcomeEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendEmail,
  EmailTemplate,
} from "@/lib/email";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  // Only available in development mode
  if (!isDevelopment()) {
    return NextResponse.json(
      { error: "Only available in development mode" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { email, type, name } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Generate a mock token for email templates that need it
    const mockToken = crypto.randomBytes(32).toString("hex");

    let result: boolean;

    switch (type as EmailTemplate) {
      case "welcome":
        result = await sendWelcomeEmail(email, name || "Test User");
        break;
      case "verification":
        result = await sendVerificationEmail(
          email,
          name || "Test User",
          mockToken
        );
        break;
      case "password-reset":
        result = await sendPasswordResetEmail(email, mockToken);
        break;
      case "order-confirmation":
        result = await sendEmail({
          to: email,
          subject: "Your Order Confirmation",
          template: "order-confirmation",
          data: {
            name: name || "Test User",
            orderNumber:
              body.orderNumber || "ORD-" + Math.floor(Math.random() * 1000000),
            orderDate: new Date().toLocaleDateString(),
            total: body.total || "$99.99",
            orderLink: "http://localhost:3000/orders/123456",
          },
        });
        break;
      default:
        return NextResponse.json(
          { error: "Invalid email type" },
          { status: 400 }
        );
    }

    if (result) {
      return NextResponse.json({ message: "Test email sent successfully" });
    } else {
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error sending test email:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
