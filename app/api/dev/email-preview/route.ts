import { NextRequest, NextResponse } from "next/server";
import { isDevelopment } from "@/lib/security";

// Mock email templates for development
const mockTemplates = {
  welcome: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
      <h1 style="color: #3b82f6;">Welcome to NextCommerce!</h1>
      <p>Hello {{name}},</p>
      <p>Thank you for creating an account with NextCommerce. We're excited to have you on board!</p>
      <p>You can now shop for your favorite products, track orders, and much more.</p>
      <div style="margin: 30px 0; text-align: center;">
        <a href="http://localhost:3000/products" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Start Shopping</a>
      </div>
      <p>If you have any questions, please don't hesitate to contact our support team.</p>
      <p>Best regards,<br>The NextCommerce Team</p>
    </div>
  `,
  verification: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
      <h1 style="color: #3b82f6;">Verify Your Email</h1>
      <p>Hello {{name}},</p>
      <p>Thank you for registering with NextCommerce. Please verify your email address by clicking the button below:</p>
      <div style="margin: 30px 0; text-align: center;">
        <a href="{{verificationLink}}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
      </div>
      <p>This link will expire in {{expiresIn}}.</p>
      <p>If you didn't create an account, you can safely ignore this email.</p>
      <p>Best regards,<br>The NextCommerce Team</p>
    </div>
  `,
  "password-reset": `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
      <h1 style="color: #3b82f6;">Reset Your Password</h1>
      <p>Hello,</p>
      <p>We received a request to reset your password. Click the button below to create a new password:</p>
      <div style="margin: 30px 0; text-align: center;">
        <a href="{{resetLink}}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
      </div>
      <p>This link will expire in {{expiresIn}}.</p>
      <p>If you didn't request a password reset, you can safely ignore this email.</p>
      <p>Best regards,<br>The NextCommerce Team</p>
    </div>
  `,
  "order-confirmation": `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
      <h1 style="color: #3b82f6;">Order Confirmation</h1>
      <p>Hello {{name}},</p>
      <p>Thank you for your order! We've received your payment and are processing your order.</p>
      <h2>Order Details</h2>
      <p><strong>Order Number:</strong> {{orderNumber}}</p>
      <p><strong>Order Date:</strong> {{orderDate}}</p>
      <p><strong>Total Amount:</strong> {{total}}</p>
      <div style="margin: 30px 0; text-align: center;">
        <a href="{{orderLink}}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Order</a>
      </div>
      <p>If you have any questions about your order, please contact our customer support.</p>
      <p>Best regards,<br>The NextCommerce Team</p>
    </div>
  `,
};

/**
 * Replace template variables with actual values
 */
function renderTemplate(template: string, data: Record<string, any>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return data[key] !== undefined ? data[key] : match;
  });
}

export async function GET(request: NextRequest) {
  // Only available in development mode
  if (!isDevelopment()) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const searchParams = request.nextUrl.searchParams;
  const emailId = searchParams.get("id");

  if (!emailId) {
    return NextResponse.json(
      { error: "Email ID is required" },
      { status: 400 }
    );
  }

  try {
    // Decode the email data
    const emailData = JSON.parse(Buffer.from(emailId, "base64").toString());
    const { to, template, timestamp } = emailData;

    // Simulate loading email data from a database in real implementation
    // For now, we'll create mock data
    const mockEmailData = {
      to,
      template,
      timestamp,
      // Mock data based on template
      data:
        template === "welcome"
          ? {
              name: "Demo User",
            }
          : template === "verification"
            ? {
                name: "Demo User",
                verificationLink:
                  "http://localhost:3000/auth/verify?token=mock-token",
                expiresIn: "24 hours",
              }
            : template === "password-reset"
              ? {
                  resetLink:
                    "http://localhost:3000/auth/reset-password?token=mock-token",
                  expiresIn: "1 hour",
                }
              : template === "order-confirmation"
                ? {
                    name: "Demo User",
                    orderNumber: "ORD-123456",
                    orderDate: new Date().toLocaleDateString(),
                    total: "$99.99",
                    orderLink: "http://localhost:3000/orders/123456",
                  }
                : {},
    };

    // Get the template HTML
    const templateHtml =
      mockTemplates[mockEmailData.template as keyof typeof mockTemplates] || "";
    if (!templateHtml) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      );
    }

    // Render the template with the data
    const renderedHtml = renderTemplate(templateHtml, mockEmailData.data);

    // Create a preview page
    const previewHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Email Preview - ${mockEmailData.template}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 20px;
              background-color: #f4f4f4;
            }
            .email-info {
              background-color: #333;
              color: white;
              padding: 10px 20px;
              margin-bottom: 20px;
              border-radius: 5px;
            }
            .email-content {
              background-color: white;
              padding: 20px;
              border-radius: 5px;
              box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }
          </style>
        </head>
        <body>
          <div class="email-info">
            <p><strong>To:</strong> ${mockEmailData.to}</p>
            <p><strong>Template:</strong> ${mockEmailData.template}</p>
            <p><strong>Time:</strong> ${new Date(mockEmailData.timestamp).toLocaleString()}</p>
          </div>
          <div class="email-content">
            ${renderedHtml}
          </div>
        </body>
      </html>
    `;

    return new NextResponse(previewHtml, {
      headers: {
        "Content-Type": "text/html",
      },
    });
  } catch (error) {
    console.error("Error generating email preview:", error);
    return NextResponse.json({ error: "Invalid email data" }, { status: 400 });
  }
}
