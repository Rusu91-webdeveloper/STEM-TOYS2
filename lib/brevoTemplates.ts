/**
 * Email templates for Brevo integration
 * These templates are optimized for SEO and include:
 * - Product links that drive traffic back to the site
 * - Rich schema markup for better email client rendering
 * - GDPR-compliant unsubscribe links
 * - Mobile-responsive design
 */

import { prisma } from "@/lib/prisma";
import { StoreSettings, Product } from "@/app/generated/prisma";
import { sendMail } from "./brevo";

// Type for SEO metadata
type SEOMetadata = {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
};

// Base URL for links
const getBaseUrl = () =>
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

// Get store settings singleton with cached result
let cachedStoreSettings: StoreSettings | null = null;
async function getStoreSettings(): Promise<StoreSettings> {
  if (cachedStoreSettings) return cachedStoreSettings;

  const settings = await prisma.storeSettings.findFirst();
  if (!settings) {
    throw new Error("Store settings not found");
  }

  cachedStoreSettings = settings;
  return settings;
}

/**
 * Format a price as currency
 */
function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

/**
 * Generate GDPR-compliant footer with unsubscribe link
 */
function generateEmailFooter(storeSettings: StoreSettings): string {
  const storeName = storeSettings.storeName;
  const year = new Date().getFullYear();

  return `
    <div style="margin-top: 48px; padding-top: 24px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; text-align: center;">
      <p>© ${year} ${storeName}. All rights reserved.</p>
      <p>${storeSettings.storeDescription}</p>
      <p>
        <a href="${getBaseUrl()}/privacy-policy" style="color: #6b7280; text-decoration: underline;">Privacy Policy</a> | 
        <a href="${getBaseUrl()}/terms" style="color: #6b7280; text-decoration: underline;">Terms of Service</a> | 
        <a href="${getBaseUrl()}/unsubscribe?email={{params.email}}" style="color: #6b7280; text-decoration: underline;">Unsubscribe</a>
      </p>
      <p>${storeSettings.contactEmail} | ${storeSettings.contactPhone}</p>
    </div>
  `;
}

// Email templates with Brevo integration
export const emailTemplates = {
  /**
   * Welcome email with SEO optimized links and content
   */
  welcome: async ({ to, name }: { to: string; name: string }) => {
    const storeSettings = await getStoreSettings();
    const baseUrl = getBaseUrl();

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to ${storeSettings.storeName}</title>
      </head>
      <body style="font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${baseUrl}/logo.png" alt="${storeSettings.storeName} Logo" style="max-width: 200px;">
        </div>
        
        <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h1 style="color: #333; margin-bottom: 24px; text-align: center;">Welcome to ${storeSettings.storeName}!</h1>
          
          <p>Hello ${name},</p>
          
          <p>Thank you for creating an account with ${storeSettings.storeName}. We're excited to have you join our community of curious minds exploring the world of STEM toys!</p>
          
          <p>With your new account, you can:</p>
          <ul style="margin-bottom: 20px;">
            <li>Shop our exclusive collection of STEM toys and educational products</li>
            <li>Track your orders and shipping status</li>
            <li>Save your favorite items for future purchases</li>
            <li>Get personalized recommendations based on age and interests</li>
          </ul>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${baseUrl}/products/featured" 
                style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Explore Featured STEM Toys
            </a>
          </div>
          
          <h2 style="color: #333; margin-top: 32px;">Recommended Categories</h2>
          <div style="display: flex; justify-content: space-between; margin-bottom: 32px; text-align: center;">
            <div style="flex: 1; margin: 0 8px;">
              <a href="${baseUrl}/category/science" style="text-decoration: none; color: #333;">
                <img src="${baseUrl}/images/categories/science.jpg" alt="Science Toys" style="width: 100%; border-radius: 4px; margin-bottom: 8px;">
                <p style="font-weight: bold;">Science</p>
              </a>
            </div>
            
            <div style="flex: 1; margin: 0 8px;">
              <a href="${baseUrl}/category/technology" style="text-decoration: none; color: #333;">
                <img src="${baseUrl}/images/categories/technology.jpg" alt="Technology Toys" style="width: 100%; border-radius: 4px; margin-bottom: 8px;">
                <p style="font-weight: bold;">Technology</p>
              </a>
            </div>
            
            <div style="flex: 1; margin: 0 8px;">
              <a href="${baseUrl}/category/engineering" style="text-decoration: none; color: #333;">
                <img src="${baseUrl}/images/categories/engineering.jpg" alt="Engineering Toys" style="width: 100%; border-radius: 4px; margin-bottom: 8px;">
                <p style="font-weight: bold;">Engineering</p>
              </a>
            </div>
          </div>
          
          <p>Happy learning!</p>
          <p>The ${storeSettings.storeName} Team</p>
        </div>
        
        ${generateEmailFooter(storeSettings)}
        
        <!-- Schema.org markup for email -->
        <script type="application/ld+json">
        {
          "@context": "http://schema.org",
          "@type": "EmailMessage",
          "description": "Welcome to ${storeSettings.storeName}",
          "action": {
            "@type": "ViewAction",
            "url": "${baseUrl}",
            "name": "View Our Products"
          }
        }
        </script>
      </body>
      </html>
    `;

    return sendMail({
      to,
      subject: `Welcome to ${storeSettings.storeName}!`,
      html,
      params: { email: to }, // For unsubscribe link
    });
  },

  /**
   * Verification email with SEO optimized links
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
    const storeSettings = await getStoreSettings();
    const baseUrl = getBaseUrl();

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email Address - ${storeSettings.storeName}</title>
      </head>
      <body style="font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${baseUrl}/logo.png" alt="${storeSettings.storeName} Logo" style="max-width: 200px;">
        </div>
        
        <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h1 style="color: #333; margin-bottom: 24px; text-align: center;">Verify Your Email Address</h1>
          
          <p>Hello ${name},</p>
          
          <p>Thank you for creating an account with ${storeSettings.storeName}. To complete your registration and start exploring our collection of educational STEM toys, please verify your email address by clicking the button below:</p>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${verificationLink}" 
               style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Verify Email Address
            </a>
          </div>
          
          <p style="margin-bottom: 24px;">Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #6b7280; margin-bottom: 24px;">${verificationLink}</p>
          
          <p><strong>Important:</strong> This link will expire in ${expiresIn}.</p>
          <p>If you did not create an account with ${storeSettings.storeName}, you can safely ignore this email.</p>
          
          <h2 style="color: #333; margin-top: 32px;">While you're waiting...</h2>
          <p>Check out our popular blog posts about STEM education:</p>
          <ul>
            <li><a href="${baseUrl}/blog/benefits-of-stem-toys" style="color: #3b82f6; text-decoration: none;">The Benefits of STEM Toys for Early Development</a></li>
            <li><a href="${baseUrl}/blog/stem-activities-for-kids" style="color: #3b82f6; text-decoration: none;">5 Fun STEM Activities You Can Do at Home</a></li>
          </ul>
        </div>
        
        ${generateEmailFooter(storeSettings)}
      </body>
      </html>
    `;

    return sendMail({
      to,
      subject: `Verify Your ${storeSettings.storeName} Account`,
      html,
      params: { email: to }, // For unsubscribe link
    });
  },

  /**
   * Password reset email with SEO optimized links
   */
  passwordReset: async ({
    to,
    resetLink,
    expiresIn = "1 hour",
  }: {
    to: string;
    resetLink: string;
    expiresIn?: string;
  }) => {
    const storeSettings = await getStoreSettings();
    const baseUrl = getBaseUrl();

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password - ${storeSettings.storeName}</title>
      </head>
      <body style="font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${baseUrl}/logo.png" alt="${storeSettings.storeName} Logo" style="max-width: 200px;">
        </div>
        
        <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h1 style="color: #333; margin-bottom: 24px; text-align: center;">Reset Your Password</h1>
          
          <p>We received a request to reset your password for your ${storeSettings.storeName} account.</p>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetLink}" 
               style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Reset Password
            </a>
          </div>
          
          <p style="margin-bottom: 24px;">Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #6b7280; margin-bottom: 24px;">${resetLink}</p>
          
          <p><strong>Important:</strong> This link will expire in ${expiresIn}.</p>
          <p>If you didn't request a password reset, you can safely ignore this email. Your account security is important to us.</p>
          
          <div style="background-color: #f9fafb; padding: 16px; border-radius: 4px; margin-top: 32px;">
            <h3 style="color: #333; margin-top: 0;">Account Security Tips:</h3>
            <ul style="margin-bottom: 0;">
              <li>Use a unique, strong password that you don't use elsewhere</li>
              <li>Never share your password with others</li>
              <li>Be cautious of suspicious emails asking for your login information</li>
            </ul>
            <p style="margin-bottom: 0; margin-top: 16px;">Learn more about <a href="${baseUrl}/security" style="color: #3b82f6; text-decoration: none;">account security</a>.</p>
          </div>
        </div>
        
        ${generateEmailFooter(storeSettings)}
      </body>
      </html>
    `;

    return sendMail({
      to,
      subject: `Reset Your ${storeSettings.storeName} Password`,
      html,
      params: { email: to }, // For unsubscribe link
    });
  },

  /**
   * Order confirmation email with SEO optimized product links
   */
  orderConfirmation: async ({
    to,
    order,
    user,
  }: {
    to: string;
    order: any; // Full order with items and products
    user: { name: string };
  }) => {
    const storeSettings = await getStoreSettings();
    const baseUrl = getBaseUrl();

    // Generate items HTML with SEO-optimized links to products
    const itemsHtml = order.items
      .map((item: any) => {
        const productLink = `${baseUrl}/products/${item.product.slug}`;
        const imageUrl =
          item.product.images && item.product.images.length > 0
            ? item.product.images[0]
            : `${baseUrl}/placeholder.png`;

        return `
        <tr>
          <td style="padding: 16px; border-bottom: 1px solid #e5e7eb;">
            <div style="display: flex; align-items: center;">
              <a href="${productLink}" style="text-decoration: none; color: inherit;">
                <img src="${imageUrl}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; margin-right: 12px; border-radius: 4px;">
              </a>
              <div>
                <a href="${productLink}" style="text-decoration: none; color: #333; font-weight: bold;">
                  ${item.name}
                </a>
                ${
                  item.product.description
                    ? `<p style="margin: 4px 0 0; font-size: 12px; color: #6b7280;">${item.product.description.substring(0, 100)}${item.product.description.length > 100 ? "..." : ""}</p>`
                    : ""
                }
              </div>
            </div>
          </td>
          <td style="padding: 16px; text-align: center; border-bottom: 1px solid #e5e7eb;">${item.quantity}</td>
          <td style="padding: 16px; text-align: right; border-bottom: 1px solid #e5e7eb;">${formatPrice(item.price)}</td>
          <td style="padding: 16px; text-align: right; border-bottom: 1px solid #e5e7eb;">${formatPrice(item.price * item.quantity)}</td>
        </tr>
      `;
      })
      .join("");

    // Find similar products based on categories
    const categoryIds = [
      ...new Set(order.items.map((item: any) => item.product.categoryId)),
    ];
    let relatedProductsHtml = "";

    if (categoryIds.length > 0) {
      const relatedProducts = await prisma.product.findMany({
        where: {
          categoryId: { in: categoryIds },
          id: { notIn: order.items.map((item: any) => item.productId) },
          isActive: true,
        },
        take: 3,
      });

      if (relatedProducts.length > 0) {
        relatedProductsHtml = `
          <div style="margin-top: 48px;">
            <h2 style="color: #333; text-align: center; margin-bottom: 24px;">You Might Also Like</h2>
            <div style="display: flex; justify-content: space-between;">
              ${relatedProducts
                .map((product: Product) => {
                  // Safely access the images array with type checking
                  const productImages = (product.images as string[]) || [];
                  const imageUrl =
                    productImages.length > 0
                      ? productImages[0]
                      : `${baseUrl}/placeholder.png`;

                  return `
                  <div style="flex: 1; margin: 0 8px; text-align: center;">
                    <a href="${baseUrl}/products/${product.slug}" style="text-decoration: none; color: inherit;">
                      <img src="${imageUrl}" 
                           alt="${product.name}" 
                           style="width: 100%; height: 120px; object-fit: cover; border-radius: 4px; margin-bottom: 8px;">
                      <h3 style="margin: 8px 0; font-size: 14px;">${product.name}</h3>
                      <p style="color: #2563eb; font-weight: bold; margin: 0;">${formatPrice(product.price)}</p>
                    </a>
                  </div>
                `;
                })
                .join("")}
            </div>
          </div>
        `;
      }
    }

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation #${order.orderNumber} - ${storeSettings.storeName}</title>
      </head>
      <body style="font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${baseUrl}/logo.png" alt="${storeSettings.storeName} Logo" style="max-width: 200px;">
        </div>
        
        <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h1 style="color: #333; margin-bottom: 16px; text-align: center;">Order Confirmation</h1>
          <p style="text-align: center; font-size: 18px; color: #4b5563; margin-bottom: 32px;">Thank you for your order!</p>
          
          <p>Hello ${user.name},</p>
          <p>We're excited to confirm that your order has been received and is being processed. Here are your order details:</p>
          
          <div style="background-color: #f9fafb; padding: 16px; border-radius: 4px; margin: 24px 0;">
            <p style="margin: 0;"><strong>Order Number:</strong> #${order.orderNumber}</p>
            <p style="margin: 8px 0 0;"><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
            <p style="margin: 8px 0 0;"><strong>Status:</strong> ${order.status}</p>
            <p style="margin: 8px 0 0;"><strong>Payment Status:</strong> ${order.paymentStatus}</p>
          </div>
          
          <h2 style="color: #333; margin-bottom: 16px;">Order Summary</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f3f4f6;">
                <th style="text-align: left; padding: 12px 16px; border-bottom: 2px solid #e5e7eb;">Product</th>
                <th style="text-align: center; padding: 12px 16px; border-bottom: 2px solid #e5e7eb;">Qty</th>
                <th style="text-align: right; padding: 12px 16px; border-bottom: 2px solid #e5e7eb;">Price</th>
                <th style="text-align: right; padding: 12px 16px; border-bottom: 2px solid #e5e7eb;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="text-align: right; padding: 12px 16px;">Subtotal:</td>
                <td style="text-align: right; padding: 12px 16px;">${formatPrice(order.subtotal)}</td>
              </tr>
              <tr>
                <td colspan="3" style="text-align: right; padding: 12px 16px;">Shipping:</td>
                <td style="text-align: right; padding: 12px 16px;">${formatPrice(order.shippingCost)}</td>
              </tr>
              <tr>
                <td colspan="3" style="text-align: right; padding: 12px 16px;">Tax:</td>
                <td style="text-align: right; padding: 12px 16px;">${formatPrice(order.tax)}</td>
              </tr>
              <tr style="font-weight: bold; font-size: 16px;">
                <td colspan="3" style="text-align: right; padding: 12px 16px; border-top: 2px solid #e5e7eb;">Total:</td>
                <td style="text-align: right; padding: 12px 16px; border-top: 2px solid #e5e7eb;">${formatPrice(order.total)}</td>
              </tr>
            </tfoot>
          </table>
          
          <div style="margin: 32px 0; text-align: center;">
            <a href="${baseUrl}/account/orders/${order.id}" 
               style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
              View Order Details
            </a>
          </div>
          
          <div style="margin-top: 32px; border-top: 1px solid #e5e7eb; padding-top: 24px;">
            <h2 style="color: #333; margin-bottom: 16px;">Shipping Information</h2>
            <p style="margin: 4px 0;"><strong>${order.shippingAddress.fullName}</strong></p>
            <p style="margin: 4px 0;">${order.shippingAddress.addressLine1}</p>
            ${order.shippingAddress.addressLine2 ? `<p style="margin: 4px 0;">${order.shippingAddress.addressLine2}</p>` : ""}
            <p style="margin: 4px 0;">${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}</p>
            <p style="margin: 4px 0;">${order.shippingAddress.country}</p>
            <p style="margin: 4px 0;">Phone: ${order.shippingAddress.phone}</p>
          </div>
          
          <div style="margin-top: 32px; background-color: #eef2ff; padding: 16px; border-radius: 4px;">
            <h3 style="color: #3b82f6; margin-top: 0;">What happens next?</h3>
            <p style="margin-bottom: 8px;">1. You'll receive a shipping confirmation when your order is on its way.</p>
            <p style="margin-bottom: 8px;">2. Track your order status anytime from your <a href="${baseUrl}/account/orders" style="color: #3b82f6; text-decoration: none;">account dashboard</a>.</p>
            <p style="margin-bottom: 0;">3. If you have any questions about your order, please <a href="${baseUrl}/contact" style="color: #3b82f6; text-decoration: none;">contact our support team</a>.</p>
          </div>
          
          ${relatedProductsHtml}
        </div>
        
        ${generateEmailFooter(storeSettings)}
        
        <!-- Schema.org markup for order -->
        <script type="application/ld+json">
        {
          "@context": "http://schema.org",
          "@type": "Order",
          "merchant": {
            "@type": "Organization",
            "name": "${storeSettings.storeName}"
          },
          "orderNumber": "${order.orderNumber}",
          "orderStatus": "http://schema.org/OrderProcessing",
          "acceptedOffer": [
            ${order.items
              .map(
                (item: any) => `{
              "@type": "Offer",
              "itemOffered": {
                "@type": "Product",
                "name": "${item.name}",
                "url": "${baseUrl}/products/${item.product.slug}"
              },
              "price": "${item.price}",
              "priceCurrency": "USD",
              "eligibleQuantity": {
                "@type": "QuantitativeValue",
                "value": "${item.quantity}"
              }
            }`
              )
              .join(",")}
          ],
          "priceSpecification": {
            "@type": "PriceSpecification",
            "price": "${order.total}",
            "priceCurrency": "USD"
          }
        }
        </script>
      </body>
      </html>
    `;

    return sendMail({
      to,
      subject: `Your Order Confirmation #${order.orderNumber} - ${storeSettings.storeName}`,
      html,
      params: { email: to }, // For unsubscribe link
    });
  },

  /**
   * Return processing email with SEO optimized links
   */
  returnProcessing: async ({
    to,
    order,
    returnStatus,
    returnDetails,
    user,
  }: {
    to: string;
    order: any; // Full order reference
    returnStatus: "RECEIVED" | "PROCESSING" | "APPROVED" | "COMPLETED";
    returnDetails: {
      id: string;
      reason: string;
      comments?: string;
    };
    user: { name: string };
  }) => {
    const storeSettings = await getStoreSettings();
    const baseUrl = getBaseUrl();

    // Return status information
    let statusInfo = {
      title: "",
      description: "",
      steps: [] as { status: string; active: boolean }[],
    };

    switch (returnStatus) {
      case "RECEIVED":
        statusInfo = {
          title: "Return Request Received",
          description:
            "We've received your return request and it is being reviewed by our team.",
          steps: [
            { status: "Request Received", active: true },
            { status: "Processing", active: false },
            { status: "Approved", active: false },
            { status: "Completed", active: false },
          ],
        };
        break;
      case "PROCESSING":
        statusInfo = {
          title: "Return Being Processed",
          description:
            "Your return is being processed. We'll send you another update when it's approved.",
          steps: [
            { status: "Request Received", active: true },
            { status: "Processing", active: true },
            { status: "Approved", active: false },
            { status: "Completed", active: false },
          ],
        };
        break;
      case "APPROVED":
        statusInfo = {
          title: "Return Approved",
          description:
            "Good news! Your return has been approved. Once we receive the items, we'll process your refund.",
          steps: [
            { status: "Request Received", active: true },
            { status: "Processing", active: true },
            { status: "Approved", active: true },
            { status: "Completed", active: false },
          ],
        };
        break;
      case "COMPLETED":
        statusInfo = {
          title: "Return Completed",
          description:
            "Your return has been completed and your refund has been processed. It may take a few business days to appear in your account.",
          steps: [
            { status: "Request Received", active: true },
            { status: "Processing", active: true },
            { status: "Approved", active: true },
            { status: "Completed", active: true },
          ],
        };
        break;
    }

    // Generate progress bar HTML
    const progressBarHtml = `
      <div style="margin: 32px 0;">
        <div style="display: flex; justify-content: space-between; position: relative;">
          ${statusInfo.steps
            .map(
              (step, index) => `
            <div style="display: flex; flex-direction: column; align-items: center; z-index: 1; flex: 1; text-align: center;">
              <div style="width: 24px; height: 24px; border-radius: 50%; background-color: ${step.active ? "#3b82f6" : "#e5e7eb"}; margin-bottom: 8px;"></div>
              <div style="font-size: 12px; color: ${step.active ? "#3b82f6" : "#6b7280"};">${step.status}</div>
            </div>
          `
            )
            .join("")}
          
          <div style="position: absolute; top: 12px; left: 0; right: 0; height: 2px; background-color: #e5e7eb; z-index: 0;"></div>
          <div style="position: absolute; top: 12px; left: 0; width: ${
            (statusInfo.steps.filter((s) => s.active).length /
              statusInfo.steps.length) *
            100
          }%; height: 2px; background-color: #3b82f6; z-index: 0;"></div>
        </div>
      </div>
    `;

    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${statusInfo.title} - Order #${order.orderNumber} - ${storeSettings.storeName}</title>
      </head>
      <body style="font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${baseUrl}/logo.png" alt="${storeSettings.storeName} Logo" style="max-width: 200px;">
        </div>
        
        <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h1 style="color: #333; margin-bottom: 16px; text-align: center;">${statusInfo.title}</h1>
          
          <p>Hello ${user.name},</p>
          <p>${statusInfo.description}</p>
          
          <div style="background-color: #f9fafb; padding: 16px; border-radius: 4px; margin: 24px 0;">
            <p style="margin: 0;"><strong>Return ID:</strong> ${returnDetails.id}</p>
            <p style="margin: 8px 0 0;"><strong>Related Order:</strong> #${order.orderNumber}</p>
            <p style="margin: 8px 0 0;"><strong>Return Reason:</strong> ${returnDetails.reason}</p>
            ${returnDetails.comments ? `<p style="margin: 8px 0 0;"><strong>Comments:</strong> ${returnDetails.comments}</p>` : ""}
          </div>
          
          ${progressBarHtml}
          
          <div style="margin: 32px 0; text-align: center;">
            <a href="${baseUrl}/account/returns/${returnDetails.id}" 
               style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
              View Return Details
            </a>
          </div>
          
          <div style="margin-top: 32px; background-color: #eef2ff; padding: 16px; border-radius: 4px;">
            <h3 style="color: #3b82f6; margin-top: 0;">Return Policy Highlights</h3>
            <ul style="margin-bottom: 0;">
              <li>Returns must be initiated within 30 days of delivery</li>
              <li>Products must be in original packaging and unused condition</li>
              <li>Include all accessories, manuals, and free gifts</li>
            </ul>
            <p style="margin-top: 16px; margin-bottom: 0;">
              <a href="${baseUrl}/returns-policy" style="color: #3b82f6; text-decoration: none;">Read our complete Returns & Refunds Policy</a>
            </p>
          </div>
          
          <div style="margin-top: 32px; text-align: center;">
            <p>Have questions about your return?</p>
            <p>Contact our customer service team at <a href="mailto:${storeSettings.contactEmail}" style="color: #3b82f6; text-decoration: none;">${storeSettings.contactEmail}</a> or call us at ${storeSettings.contactPhone}</p>
          </div>
          
          <h3 style="color: #333; margin-top: 32px;">Recommended Products</h3>
          <p>While you wait for your return to be processed, check out some of our top-rated STEM toys:</p>
          <div style="display: flex; justify-content: space-between;">
            <div style="flex: 1; margin: 0 8px; text-align: center;">
              <a href="${baseUrl}/products/featured" style="text-decoration: none; color: inherit;">
                <img src="${baseUrl}/images/featured/product1.jpg" 
                     alt="Featured Product" 
                     style="width: 100%; height: 120px; object-fit: cover; border-radius: 4px; margin-bottom: 8px;">
                <h3 style="margin: 8px 0; font-size: 14px;">Explore Featured Products</h3>
              </a>
            </div>
            <div style="flex: 1; margin: 0 8px; text-align: center;">
              <a href="${baseUrl}/products/new-arrivals" style="text-decoration: none; color: inherit;">
                <img src="${baseUrl}/images/featured/product2.jpg" 
                     alt="New Arrivals" 
                     style="width: 100%; height: 120px; object-fit: cover; border-radius: 4px; margin-bottom: 8px;">
                <h3 style="margin: 8px 0; font-size: 14px;">New Arrivals</h3>
              </a>
            </div>
          </div>
        </div>
        
        ${generateEmailFooter(storeSettings)}
      </body>
      </html>
    `;

    return sendMail({
      to,
      subject: `${statusInfo.title} - Order #${order.orderNumber} - ${storeSettings.storeName}`,
      html,
      params: { email: to }, // For unsubscribe link
    });
  },
};
