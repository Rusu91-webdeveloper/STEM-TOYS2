import { Resend } from "resend";

// Lazy initialization of Resend client
let resendInstance: Resend | null = null;

function getResendClient(): Resend {
  if (!resendInstance) {
    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY is not set in environment variables");
      // For build-time compatibility, create a mock instance
      if (process.env.NODE_ENV === "development" || !process.env.NODE_ENV) {
        throw new Error("RESEND_API_KEY is required for email functionality");
      }
      // Return a mock instance for build time
      return new Resend("re_mock_key_for_build");
    }
    resendInstance = new Resend(process.env.RESEND_API_KEY);
  }
  return resendInstance;
}

// Export the lazy getter instead of direct instance
export const resend = {
  get emails() {
    return getResendClient().emails;
  },
  get contacts() {
    return getResendClient().contacts;
  },
  get audiences() {
    return getResendClient().audiences;
  },
  get domains() {
    return getResendClient().domains;
  },
  get apiKeys() {
    return getResendClient().apiKeys;
  },
};

// Default configuration for emails
export const defaultEmailConfig = {
  from: process.env.EMAIL_FROM || "onboarding@resend.dev",
  fromName: process.env.EMAIL_FROM_NAME || "TechTots STEM Store",
};

// Helper function to send transactional emails
export async function sendTransactionalEmail({
  to,
  subject,
  html,
  text,
  from = defaultEmailConfig.from,
  replyTo,
}: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
}) {
  try {
    const resendClient = getResendClient();
    const result = await resendClient.emails.send({
      from,
      to,
      subject,
      html,
      text,
      replyTo,
    });

    return { success: true, data: result };
  } catch (error) {
    console.error("Failed to send email with Resend:", error);
    return { success: false, error };
  }
}

// Email templates for different types of emails
export const emailTemplates = {
  async orderConfirmation(data: {
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
  }) {
    const { to, order } = data;

    const itemsHtml = order.items
      .map(
        (item) =>
          `<tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.quantity}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">$${item.price.toFixed(2)}</td>
          </tr>`
      )
      .join("");

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Order Confirmation</h1>
        <p>Thank you for your order! Here are the details:</p>
        
        <h2>Order #${order.id}</h2>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background: #f5f5f5;">
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Item</th>
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Quantity</th>
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        
        <p style="font-size: 18px; font-weight: bold;">Total: $${order.total.toFixed(2)}</p>
        
        <p>We'll send you a shipping confirmation email once your order is on its way.</p>
        
        <p>Best regards,<br>The TechTots Team</p>
      </div>
    `;

    return await sendTransactionalEmail({
      to,
      subject: `Order Confirmation - #${order.id}`,
      html,
    });
  },

  async orderShipped(data: {
    to: string;
    order: { id: string };
    trackingInfo: {
      carrier: string;
      trackingNumber: string;
      trackingUrl: string;
    };
  }) {
    const { to, order, trackingInfo } = data;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Your Order Has Shipped!</h1>
        <p>Great news! Your order #${order.id} is on its way to you.</p>
        
        <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Shipping Details</h3>
          <p><strong>Carrier:</strong> ${trackingInfo.carrier}</p>
          <p><strong>Tracking Number:</strong> ${trackingInfo.trackingNumber}</p>
          <p><a href="${trackingInfo.trackingUrl}" style="color: #0066cc; text-decoration: none;">Track Your Package</a></p>
        </div>
        
        <p>You can track your package using the link above. Delivery typically takes 3-5 business days.</p>
        
        <p>Best regards,<br>The TechTots Team</p>
      </div>
    `;

    return await sendTransactionalEmail({
      to,
      subject: `Order Shipped - #${order.id}`,
      html,
    });
  },

  async passwordReset(data: { to: string; resetLink: string }) {
    const { to, resetLink } = data;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Reset Your Password</h1>
        <p>You requested to reset your password. Click the button below to create a new password:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" 
             style="background: #0066cc; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Reset Password
          </a>
        </div>
        
        <p>If you didn't request this password reset, you can safely ignore this email.</p>
        <p>This link will expire in 1 hour for security reasons.</p>
        
        <p>Best regards,<br>The TechTots Team</p>
      </div>
    `;

    return await sendTransactionalEmail({
      to,
      subject: "Reset Your Password",
      html,
    });
  },
};
