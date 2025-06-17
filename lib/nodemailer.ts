import nodemailer from "nodemailer";
import { logger } from "./logger";

// Load environment variables
const EMAIL_HOST = process.env.EMAIL_HOST || "smtp.gmail.com";
const EMAIL_PORT = parseInt(process.env.EMAIL_PORT || "587");
const EMAIL_USER = process.env.EMAIL_USER || "";
const EMAIL_PASS = process.env.EMAIL_PASS || "";
const EMAIL_FROM = process.env.EMAIL_FROM || "";

// Check configuration on startup
if (!EMAIL_USER || !EMAIL_PASS) {
  logger.warn("Email credentials are not properly configured in .env.local!");
  logger.warn(
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
    // Only disable certificate validation in development
    rejectUnauthorized: process.env.NODE_ENV !== "development",
  },
});

// For development environment, provide console-based email simulation
const devTransporter = {
  sendMail: async (options: any) => {
    logger.debug("Email would be sent (DEV MODE)", {
      from: options.from,
      to: options.to,
      subject: options.subject,
      contentPreview: options.html.substring(0, 100) + "...",
    });
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
    logger.info("Email transport configured successfully");
  })
  .catch((error) => {
    logger.error("Email transport configuration failed", error);
    logger.info("Will use fallback development mode for emails");
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
      logger.debug("Email would be sent (DEV MODE)", {
        from,
        to: typeof to === "string" ? to : to.join(", "),
        subject,
        contentPreview: html.substring(0, 100) + "...",
      });
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

    logger.info("Email sent successfully", { messageId: info.messageId });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error("Error sending email", error);

    // In development mode, simulate success
    if (process.env.NODE_ENV === "development") {
      logger.debug("Email would be sent despite error (DEV MODE)", {
        from,
        to: typeof to === "string" ? to : to.join(", "),
        subject,
      });
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
   * Return notification email for admin
   */
  returnNotification: async ({
    to,
    orderNumber,
    productName,
    productSku,
    customerName,
    customerEmail,
    reason,
    details,
    returnId,
  }: {
    to: string;
    orderNumber: string;
    productName: string;
    productSku?: string;
    customerName: string;
    customerEmail: string;
    reason: string;
    details?: string;
    returnId: string;
  }) => {
    // Make sure we log the email being used
    logger.info("Sending return notification email", {
      to,
      from: EMAIL_FROM || process.env.EMAIL_FROM || "webira.rem.srl@gmail.com",
    });

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">New Return Request Received</h1>
        <p>A customer has initiated a return request:</p>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p><strong>Return ID:</strong> ${returnId}</p>
          <p><strong>Order:</strong> #${orderNumber}</p>
          <p><strong>Product:</strong> ${productName} ${productSku ? `(SKU: ${productSku})` : ""}</p>
          <p><strong>Customer:</strong> ${customerName}</p>
          <p><strong>Email:</strong> ${customerEmail}</p>
          <p><strong>Reason:</strong> ${reason}</p>
          ${details ? `<p><strong>Details:</strong> ${details}</p>` : ""}
          <p><strong>Date Requested:</strong> ${new Date().toLocaleString()}</p>
        </div>
        <p>Please review this return request in your <a href="${process.env.NEXT_PUBLIC_BASE_URL || "https://techtots.com"}/admin/returns">admin dashboard</a>.</p>
      </div>
    `;

    // Force the use of the EMAIL_FROM environment variable
    const from =
      EMAIL_FROM || process.env.EMAIL_FROM || "webira.rem.srl@gmail.com";

    return sendMail({
      to,
      from,
      subject: `New Return Request - Order #${orderNumber}`,
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
      subtotal?: number;
      tax?: number;
      shippingCost?: number;
      shippingAddress?: any;
      shippingMethod?: any;
      orderDate?: string;
    };
  }) => {
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Confirmare Comandă</h1>
        <p>Vă mulțumim pentru comanda dumneavoastră! Am primit comanda și o vom procesa în curând.</p>
        
        <h2 style="color: #333;">Detalii Comandă</h2>
        <p><strong>ID Comandă:</strong> ${order.id}</p>
        <p><strong>Data comenzii:</strong> ${order.orderDate ? new Date(order.orderDate).toLocaleDateString("ro-RO") : new Date().toLocaleDateString("ro-RO")}</p>
        
        ${
          order.shippingAddress
            ? `
        <h3 style="color: #333; margin-top: 20px;">Adresă de livrare</h3>
        <p>${order.shippingAddress.fullName}<br>
        ${order.shippingAddress.addressLine1}<br>
        ${order.shippingAddress.addressLine2 ? `${order.shippingAddress.addressLine2}<br>` : ""}
        ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}<br>
        ${order.shippingAddress.country}<br>
        Tel: ${order.shippingAddress.phone}</p>
        `
            : ""
        }
        
        ${
          order.shippingMethod
            ? `
        <h3 style="color: #333;">Metoda de livrare</h3>
        <p><strong>${order.shippingMethod.name || "Livrare standard"}</strong><br>
        ${order.shippingMethod.description || "Livrare între 3-5 zile lucrătoare"}<br>
        <strong>Cost livrare:</strong> ${(order.shippingMethod.price || 0).toFixed(2)} Lei</p>
        `
            : ""
        }
        
        <h3 style="color: #333; margin-top: 20px;">Produse comandate</h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
          <thead>
            <tr style="background-color: #f3f4f6;">
              <th style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd;">Produs</th>
              <th style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">Cant.</th>
              <th style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">Preț</th>
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
                <td style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">${item.price.toFixed(
                  2
                )} Lei</td>
                <td style="padding: 8px; text-align: right; border-bottom: 1px solid #ddd;">${(
                  item.price * item.quantity
                ).toFixed(2)} Lei</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="padding: 8px; text-align: right;">Subtotal:</td>
              <td style="padding: 8px; text-align: right;">${(order.subtotal || order.total).toFixed(2)} Lei</td>
            </tr>
            ${
              order.tax !== undefined
                ? `
            <tr>
              <td colspan="3" style="padding: 8px; text-align: right;">TVA (19%):</td>
              <td style="padding: 8px; text-align: right;">${order.tax.toFixed(2)} Lei</td>
            </tr>`
                : ""
            }
            ${
              order.shippingMethod
                ? `
            <tr>
              <td colspan="3" style="padding: 8px; text-align: right;">Livrare (${order.shippingMethod.name || "Standard"}):</td>
              <td style="padding: 8px; text-align: right;">${(order.shippingCost || order.shippingMethod.price || 0).toFixed(2)} Lei</td>
            </tr>
            <tr style="background-color: #f9fafb;">
              <td colspan="3" style="padding: 8px; text-align: right; font-weight: bold;">Total comandă:</td>
              <td style="padding: 8px; text-align: right; font-weight: bold;">${order.total.toFixed(2)} Lei</td>
            </tr>
            `
                : `
            <tr style="background-color: #f9fafb;">
              <td colspan="3" style="padding: 8px; text-align: right; font-weight: bold;">Total:</td>
              <td style="padding: 8px; text-align: right; font-weight: bold;">${order.total.toFixed(2)} Lei</td>
            </tr>
            `
            }
          </tfoot>
        </table>
        
        <div style="margin-top: 24px; padding: 15px; background-color: #f9fafb; border-radius: 5px;">
          <h3 style="color: #333; margin-top: 0;">Informații importante</h3>
          <p>Vă vom informa prin email când comanda dumneavoastră va fi expediată.</p>
          <p>Pentru orice întrebări legate de comanda dumneavoastră, vă rugăm să ne contactați la <a href="mailto:webira.rem.srl@gmail.com">webira.rem.srl@gmail.com</a> și menționați ID-ul comenzii.</p>
        </div>
        
        <div style="margin-top: 24px; border-top: 1px solid #e5e7eb; padding-top: 16px;">
          <p>Vă mulțumim că ați ales TeechTots!</p>
          <p>Cu stimă,<br>Echipa TeechTots</p>
        </div>
      </div>
    `;

    return sendMail({
      to,
      subject: `Confirmare Comandă TeechTots #${order.id}`,
      html,
      from: `"TeechTots" <webira.rem.srl@gmail.com>`,
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
