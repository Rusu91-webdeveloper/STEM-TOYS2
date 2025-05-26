/**
 * Email service for NextCommerce
 * In development mode, emails are logged to the console
 * In production, this would connect to a real email service like SendGrid, Mailgun, etc.
 */

import { isDevelopment } from "./security";

// Email types
export type EmailTemplate =
  | "welcome"
  | "verification"
  | "password-reset"
  | "order-confirmation";

interface EmailOptions {
  to: string;
  subject: string;
  template: EmailTemplate;
  data: Record<string, any>;
}

/**
 * Send an email
 * @param options Email options including recipient, subject, template and data
 * @returns Promise that resolves when the email is sent
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  // In development, we'll log the email details
  if (isDevelopment()) {
    console.log("\n------- EMAIL SENDING SIMULATION -------");
    console.log(`To: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Template: ${options.template}`);
    console.log("Data:", options.data);

    const previewUrl = await generateDevelopmentEmailPreview(options);
    console.log(`Email preview: ${previewUrl}`);
    console.log("---------------------------------------\n");

    // Create simulated preview URL for development
    return true;
  }

  try {
    // In production, we would use a real email service
    // For example, with SendGrid:
    // const msg = {
    //   to: options.to,
    //   from: 'noreply@example.com',
    //   subject: options.subject,
    //   templateId: getTemplateId(options.template),
    //   dynamicTemplateData: options.data
    // };
    // await sendgrid.send(msg);

    // For demonstration purposes, we'll just pretend it was sent
    await simulateNetworkDelay();
    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
}

/**
 * Generate a verification email link
 * @param email User's email address
 * @param token Verification token
 * @returns The verification URL
 */
export function generateVerificationLink(email: string, token: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  return `${baseUrl}/auth/verify?token=${token}&email=${encodeURIComponent(email)}`;
}

/**
 * Generate a password reset link
 * @param email User's email address
 * @param token Reset token
 * @returns The password reset URL
 */
export function generatePasswordResetLink(
  email: string,
  token: string
): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  return `${baseUrl}/auth/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
}

/**
 * Send a welcome email
 * @param email User's email address
 * @param name User's name
 * @returns Promise that resolves when the email is sent
 */
export async function sendWelcomeEmail(
  email: string,
  name: string
): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: "Welcome to NextCommerce!",
    template: "welcome",
    data: { name },
  });
}

/**
 * Send a verification email
 * @param email User's email address
 * @param name User's name
 * @param token Verification token
 * @returns Promise that resolves when the email is sent
 */
export async function sendVerificationEmail(
  email: string,
  name: string,
  token: string
): Promise<boolean> {
  const verificationLink = generateVerificationLink(email, token);

  return sendEmail({
    to: email,
    subject: "Verify your email address",
    template: "verification",
    data: {
      name,
      verificationLink,
      expiresIn: "24 hours",
    },
  });
}

/**
 * Send a password reset email
 * @param email User's email address
 * @param token Reset token
 * @returns Promise that resolves when the email is sent
 */
export async function sendPasswordResetEmail(
  email: string,
  token: string
): Promise<boolean> {
  const resetLink = generatePasswordResetLink(email, token);

  return sendEmail({
    to: email,
    subject: "Reset your password",
    template: "password-reset",
    data: {
      resetLink,
      expiresIn: "1 hour",
    },
  });
}

// Helpers

/**
 * Simulate a network delay for development
 * @param ms Milliseconds to delay
 */
function simulateNetworkDelay(ms = 800): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate a simulated development email preview URL
 * This would typically create a local preview using something like Ethereal or Mailtrap
 */
async function generateDevelopmentEmailPreview(
  options: EmailOptions
): Promise<string> {
  // In a real implementation, this might:
  // 1. Save the email to a local database
  // 2. Generate a preview URL with an email service like Ethereal or Mailtrap

  // For now, just generate a mock URL
  const token = Buffer.from(
    JSON.stringify({
      to: options.to,
      template: options.template,
      timestamp: Date.now(),
    })
  ).toString("base64");

  return `http://localhost:3000/api/dev/email-preview?id=${token}`;
}
