import nodemailer from "nodemailer";

// Load environment variables
const EMAIL_HOST = process.env.EMAIL_HOST || "smtp.gmail.com";
const EMAIL_PORT = parseInt(process.env.EMAIL_PORT || "587");
const EMAIL_USER = process.env.EMAIL_USER || "";
const EMAIL_PASS = process.env.EMAIL_PASS || "";
const EMAIL_FROM = process.env.EMAIL_FROM || "";

// Check configuration on startup
if (!EMAIL_USER || !EMAIL_PASS) {
  console.warn(
    "⚠️ Email credentials are not properly configured in .env.local!"
  );
  console.warn(
    "Required variables: EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_FROM"
  );
}

// Create reusable transporter with Gmail configuration
export const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: EMAIL_PORT === 465, // true for 465, false for other ports
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
  // Required for Gmail since May 30, 2022
  tls: {
    // Do not fail on invalid certificates
    rejectUnauthorized: false,
  },
});

// For development environment, provide console-based email simulation
const devTransporter = {
  sendMail: async (options: any) => {
    console.log(`\n📧 [DEV MODE] Email would be sent:`);
    console.log(`From: ${options.from}`);
    console.log(`To: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`HTML Content: ${options.html.substring(0, 300)}...`);
    return { messageId: `dev-${Date.now()}@localhost` };
  },
  verify: async () => true,
};

// Use dev transporter in development mode if email credentials are missing
const activeTransporter =
  process.env.NODE_ENV === "development" && (!EMAIL_USER || !EMAIL_PASS)
    ? devTransporter
    : transporter;

// Verify transporter configuration on startup
activeTransporter
  .verify()
  .then(() => {
    console.log("✅ Email transport configured successfully");
  })
  .catch((error) => {
    console.error("❌ Email transport configuration failed:", error);
    console.log("📝 Will use fallback development mode for emails");
  });

// Send an email using Nodemailer
export async function sendMail({
  to,
  subject,
  html,
  text,
  from = EMAIL_FROM,
}: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
}) {
  try {
    // In development mode with missing credentials, use the dev transporter
    if (
      process.env.NODE_ENV === "development" &&
      (!EMAIL_USER || !EMAIL_PASS)
    ) {
      console.log(`\n📧 [DEV MODE] Email would be sent:`);
      console.log(`From: ${from}`);
      console.log(`To: ${typeof to === "string" ? to : to.join(", ")}`);
      console.log(`Subject: ${subject}`);
      console.log(`HTML Content: ${html.substring(0, 300)}...`);
      return { success: true, messageId: `dev-${Date.now()}@localhost` };
    }

    // Send mail with defined transport object
    const info = await activeTransporter.sendMail({
      from,
      to,
      subject,
      text,
      html,
    });

    console.log(`✅ Email sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error sending email:", error);

    // In development mode, simulate success
    if (process.env.NODE_ENV === "development") {
      console.log(`\n📧 [DEV MODE] Email would be sent despite error:`);
      console.log(`From: ${from}`);
      console.log(`To: ${typeof to === "string" ? to : to.join(", ")}`);
      console.log(`Subject: ${subject}`);
      return { success: true, messageId: `dev-error-${Date.now()}@localhost` };
    }

    throw error;
  }
}

// Email templates
export const emailTemplates = {
  /**
   * Welcome email
   */
  welcome: async ({ to, name }: { to: string; name: string }) => {
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Welcome to TeechTots!</h1>
        <p>Hello ${name},</p>
        <p>Thank you for creating an account with TeechTots. We're excited to have you join our community of curious minds!</p>
        <p>With your new account, you can:</p>
        <ul>
          <li>Shop our exclusive collection of STEM toys and educational products</li>
          <li>Track your orders and shipping status</li>
          <li>Save your favorite items for future purchases</li>
          <li>Get personalized recommendations based on age and interests</li>
        </ul>
        <p>Start exploring our collection today!</p>
        <div style="text-align: center; margin: 24px 0;">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}" 
              style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Explore TeechTots
          </a>
        </div>
        <p>Happy learning!</p>
        <p>The TeechTots Team</p>
      </div>
    `;

    return sendMail({
      to,
      subject: "Welcome to TeechTots!",
      html,
    });
  },

  /**
   * Verification email
   */
  verification: async ({
    to,
    name,
    verificationLink,
    expiresIn = "24 hours",
  }: {
    to: string;
    name: string;
    verificationLink: string;
    expiresIn?: string;
  }) => {
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Verify Your Email Address</h1>
        <p>Hello ${name},</p>
        <p>Thank you for creating an account with TeechTots. To complete your registration and start exploring our collection of educational STEM toys, please verify your email address by clicking the button below:</p>
        
        <div style="text-align: center; margin: 24px 0;">
          <a href="${verificationLink}" 
             style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #6b7280;">${verificationLink}</p>
        
        <p><strong>Important:</strong> This link will expire in ${expiresIn}.</p>
        <p>If you did not create an account with TeechTots, you can safely ignore this email.</p>
      </div>
    `;

    return sendMail({
      to,
      subject: "Verify Your TeechTots Account",
      html,
    });
  },

  /**
   * Order confirmation email
   */
  orderConfirmation: async ({
    to,
    order,
  }: {
    to: string;
    order: {
      id: string;
      items: Array<{
        name: string;
        quantity: number;
        price: number;
      }>;
      total: number;
    };
  }) => {
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Order Confirmation</h1>
        <p>Thank you for your order! We've received your order and will process it shortly.</p>
        
        <h2 style="color: #333;">Order Details</h2>
        <p><strong>Order ID:</strong> ${order.id}</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
          <thead>
            <tr style="background-color: #f3f4f6;">
              <th style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd;">Item</th>
              <th style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">Qty</th>
              <th style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">Price</th>
              <th style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${order.items
              .map(
                (item) => `
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${
                  item.name
                }</td>
                <td style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">${
                  item.quantity
                }</td>
                <td style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">$${item.price.toFixed(
                  2
                )}</td>
                <td style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">$${(
                  item.price * item.quantity
                ).toFixed(2)}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
          <tfoot>
            <tr style="background-color: #f9fafb;">
              <td colspan="3" style="padding: 8px; text-align: right; font-weight: bold;">Total:</td>
              <td style="padding: 8px; text-align: right; font-weight: bold;">$${order.total.toFixed(
                2
              )}</td>
            </tr>
          </tfoot>
        </table>
        
        <div style="margin-top: 24px;">
          <p>If you have any questions about your order, please contact our customer service team.</p>
          <p>Thank you for shopping with us!</p>
        </div>
      </div>
    `;

    return sendMail({
      to,
      subject: `Order Confirmation #${order.id}`,
      html,
    });
  },

  /**
   * Password reset email
   */
  passwordReset: async ({
    to,
    resetLink,
  }: {
    to: string;
    resetLink: string;
  }) => {
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Reset Your Password</h1>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        
        <div style="text-align: center; margin: 24px 0;">
          <a href="${resetLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
        </div>
        
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #6b7280;">${resetLink}</p>
        
        <p>If you didn't request a password reset, you can safely ignore this email.</p>
        <p>This link will expire in 1 hour for security reasons.</p>
      </div>
    `;

    return sendMail({
      to,
      subject: "Reset Your Password",
      html,
    });
  },
};
