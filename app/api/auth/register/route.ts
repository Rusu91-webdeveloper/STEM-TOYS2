import { NextResponse } from "next/server";
import { z } from "zod";
import { hash } from "bcrypt";
import { db } from "@/lib/db";
import { randomBytes } from "crypto";
import nodemailer from "nodemailer";

// Registration schema
const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// Function to send verification email
async function sendVerificationEmail(
  email: string,
  name: string,
  token: string
) {
  // Create verification URL
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const verificationUrl = `${baseUrl}/api/auth/verify?token=${token}`;

  // In development, log the verification URL instead of sending an email
  const isDev =
    process.env.NODE_ENV === "development" || !process.env.EMAIL_SERVER_HOST;
  if (isDev) {
    console.log("\n----------------------------------------------------");
    console.log("DEVELOPMENT MODE - Email would be sent to:", email);
    console.log("Verification URL:", verificationUrl);
    console.log("----------------------------------------------------\n");
    return; // Don't attempt to send email in development
  }

  // In production, use actual SMTP configuration
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: parseInt(process.env.EMAIL_SERVER_PORT || "587"),
    secure: process.env.EMAIL_SERVER_SECURE === "true",
    auth: {
      user: process.env.EMAIL_SERVER_USER,
      pass: process.env.EMAIL_SERVER_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || "TechTots <no-reply@techtots.com>",
    to: email,
    subject: "Verify your TechTots account",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #6366f1;">Welcome to TechTots!</h2>
        <p>Hi ${name},</p>
        <p>Thank you for registering with TechTots. Please click the button below to verify your email address:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
            Verify Email Address
          </a>
        </div>
        <p>Or copy and paste this link in your browser:</p>
        <p style="word-break: break-all; color: #6366f1;">${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
        <p>If you did not create an account, no further action is required.</p>
        <p>Thanks,<br>The TechTots Team</p>
      </div>
    `,
  });
}

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

    // Send verification email
    try {
      await sendVerificationEmail(email, name || "User", verificationToken);
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // We'll continue the registration process even if email fails
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;

    // Create verification URL for the response in development mode
    const isDev =
      process.env.NODE_ENV === "development" || !process.env.EMAIL_SERVER_HOST;
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
