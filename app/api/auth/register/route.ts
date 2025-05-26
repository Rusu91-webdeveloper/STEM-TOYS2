import { NextResponse } from "next/server";
import { z } from "zod";
import { hash } from "bcrypt";
import { db } from "@/lib/db";
import { randomBytes } from "crypto";
import { sendWelcomeEmail, sendVerificationEmail } from "@/lib/email";

// Registration schema
const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate input
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, email, password } = result.data;

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error:
            "An account with this email already exists. Please use a different email or try logging in.",
        },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Generate verification token
    const verificationToken = randomBytes(32).toString("hex");

    // Create user with verification token
    const newUser = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        verificationToken,
        isActive: false,
      },
    });

    // Send welcome and verification emails
    try {
      // Send welcome email
      await sendWelcomeEmail(email, name);

      // Send verification email
      await sendVerificationEmail(email, name, verificationToken);
    } catch (emailError) {
      console.error("Failed to send emails:", emailError);
      // We'll continue the registration process even if email fails
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;

    // Create verification URL for the response in development mode
    const isDev = process.env.NODE_ENV === "development";
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const verificationUrl = isDev
      ? `${baseUrl}/api/auth/verify?token=${verificationToken}`
      : undefined;

    return NextResponse.json(
      {
        user: userWithoutPassword,
        message:
          "User registered successfully. Please check your email to verify your account.",
        requiresVerification: true,
        ...(isDev && {
          devInfo: {
            verificationUrl,
            note: "This verification URL is only included in development mode",
          },
        }),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
