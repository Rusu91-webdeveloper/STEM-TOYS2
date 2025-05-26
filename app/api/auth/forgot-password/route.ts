import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/email";

// Token expiration time (1 hour)
const TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour in milliseconds

// Schema for request validation
const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

// In-memory store for password reset tokens (replace with database in production)
// Format: { [email]: { token: string, expires: number } }
const resetTokens: { [key: string]: { token: string; expires: number } } = {};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = forgotPasswordSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { message: "Invalid email address" },
        { status: 400 }
      );
    }

    const { email } = validationResult.data;

    // In a real implementation, you would check if the email exists in your database
    // For now, we'll accept any email and generate a token

    // Generate a random token
    const token = crypto.randomBytes(32).toString("hex");
    const expires = Date.now() + TOKEN_EXPIRY;

    // Store the token (in a real app, this would be in a database)
    resetTokens[email] = { token, expires };

    // Remove expired tokens
    Object.keys(resetTokens).forEach((key) => {
      if (resetTokens[key].expires < Date.now()) {
        delete resetTokens[key];
      }
    });

    // Log token for development purposes
    console.log(`Password reset token for ${email}: ${token}`);
    console.log(`All current tokens:`, resetTokens);

    // Send password reset email
    await sendPasswordResetEmail(email, token);

    // Always return success for security reasons
    // (prevents user enumeration)
    return NextResponse.json({ message: "Password reset instructions sent" });
  } catch (error) {
    console.error("Error in forgot-password endpoint:", error);
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}

// Export the token store for use by the verification endpoint
export { resetTokens };
