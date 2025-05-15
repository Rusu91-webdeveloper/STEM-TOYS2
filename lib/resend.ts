import { Resend } from "resend";

// Initialize Resend with API key
export const resend = new Resend(
  process.env.RESEND_API_KEY || "re_your_test_key"
);

// Email templates
export const emailTemplates = {
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
    return resend.emails.send({
      from: "orders@example.com",
      to,
      subject: `Order Confirmation #${order.id}`,
      html: `
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
      `,
    });
  },

  /**
   * Order shipping notification email
   */
  orderShipped: async ({
    to,
    order,
    trackingInfo,
  }: {
    to: string;
    order: {
      id: string;
    };
    trackingInfo: {
      carrier: string;
      trackingNumber: string;
      trackingUrl: string;
    };
  }) => {
    return resend.emails.send({
      from: "shipping@example.com",
      to,
      subject: `Your Order #${order.id} Has Shipped!`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Your Order Has Shipped!</h1>
          <p>Great news! Your order #${order.id} is on its way to you.</p>
          
          <div style="background-color: #f3f4f6; padding: 16px; border-radius: 4px; margin: 16px 0;">
            <h2 style="color: #333; margin-top: 0;">Tracking Information</h2>
            <p><strong>Carrier:</strong> ${trackingInfo.carrier}</p>
            <p><strong>Tracking Number:</strong> ${trackingInfo.trackingNumber}</p>
            <p><a href="${trackingInfo.trackingUrl}" style="color: #2563eb; text-decoration: none;">Track your package &rarr;</a></p>
          </div>
          
          <p>Thank you for shopping with us!</p>
        </div>
      `,
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
    return resend.emails.send({
      from: "support@example.com",
      to,
      subject: "Reset Your Password",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #333;">Reset Your Password</h1>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          
          <div style="text-align: center; margin: 24px 0;">
            <a href="${resetLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
          </div>
          
          <p>If you didn't request a password reset, you can safely ignore this email.</p>
          <p>This link will expire in 1 hour for security reasons.</p>
        </div>
      `,
    });
  },
};
