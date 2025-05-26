import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { resetTokens } from "../forgot-password/route";

// Schema for request validation
const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  email: z.string().email().optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validationResult = resetPasswordSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          message: "Invalid request",
          errors: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { token, email, password } = validationResult.data;

    // Find the token in our store
    let tokenEmail: string | null = null;
    let validToken = false;

    // If email is provided, only check that specific email
    if (email && resetTokens[email]) {
      const resetData = resetTokens[email];
      if (resetData.token === token && resetData.expires > Date.now()) {
        validToken = true;
        tokenEmail = email;
      }
    } else {
      // Otherwise, check all emails
      for (const e of Object.keys(resetTokens)) {
        const resetData = resetTokens[e];
        if (resetData.token === token && resetData.expires > Date.now()) {
          validToken = true;
          tokenEmail = e;
          break;
        }
      }
    }

    if (!validToken || !tokenEmail) {
      return NextResponse.json(
        { message: "Invalid or expired token" },
        { status: 400 }
      );
    }

    // In a real implementation, you would update the user's password in the database
    // For development, we'll just log the password change
    console.log(`Password reset for ${tokenEmail} successful`);

    // Remove the used token
    delete resetTokens[tokenEmail];

    // Return success
    return NextResponse.json({
      message: "Password reset successful",
      email: tokenEmail, // In production, you might not want to return this
    });
  } catch (error) {
    console.error("Error in reset-password endpoint:", error);
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}
