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
import { ro as roTranslations } from "@/lib/i18n/translations/ro";

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
  return new Intl.NumberFormat("ro-RO", {
    style: "currency",
    currency: "RON",
    minimumFractionDigits: 2,
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
      <html lang="ro">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bine ai venit la ${storeSettings.storeName}</title>
      </head>
      <body style="font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${baseUrl}/logo.png" alt="${storeSettings.storeName} Logo" style="max-width: 200px;">
        </div>
        <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h1 style="color: #333; margin-bottom: 24px; text-align: center;">Bine ai venit la ${storeSettings.storeName}!</h1>
          <p>Salut, ${name},</p>
          <p>Îți mulțumim că ți-ai creat un cont la ${storeSettings.storeName}. Suntem încântați să te avem în comunitatea noastră de minți curioase care explorează lumea jucăriilor STEM!</p>
          <p>Cu noul tău cont poți:</p>
          <ul style="margin-bottom: 20px;">
            <li>Cumpără din colecția noastră exclusivă de jucării și produse educaționale STEM</li>
            <li>Urmărește comenzile și statusul livrărilor</li>
            <li>Salvează produsele preferate pentru achiziții viitoare</li>
            <li>Primește recomandări personalizate în funcție de vârstă și interese</li>
          </ul>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${baseUrl}/products/featured" 
                style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Descoperă jucăriile STEM recomandate
            </a>
          </div>
          <h2 style="color: #333; margin-top: 32px;">Categorii recomandate</h2>
          <div style="display: flex; justify-content: space-between; margin-bottom: 32px; text-align: center;">
            <div style="flex: 1; margin: 0 8px;">
              <a href="${baseUrl}/category/science" style="text-decoration: none; color: #333;">
                <img src="${baseUrl}/images/categories/science.jpg" alt="Jucării Știință" style="width: 100%; border-radius: 4px; margin-bottom: 8px;">
                <p style="font-weight: bold;">Știință</p>
              </a>
            </div>
            <div style="flex: 1; margin: 0 8px;">
              <a href="${baseUrl}/category/technology" style="text-decoration: none; color: #333;">
                <img src="${baseUrl}/images/categories/technology.jpg" alt="Jucării Tehnologie" style="width: 100%; border-radius: 4px; margin-bottom: 8px;">
                <p style="font-weight: bold;">Tehnologie</p>
              </a>
            </div>
            <div style="flex: 1; margin: 0 8px;">
              <a href="${baseUrl}/category/engineering" style="text-decoration: none; color: #333;">
                <img src="${baseUrl}/images/categories/engineering.jpg" alt="Jucării Inginerie" style="width: 100%; border-radius: 4px; margin-bottom: 8px;">
                <p style="font-weight: bold;">Inginerie</p>
              </a>
            </div>
          </div>
          <p>Îți dorim mult succes la învățare!</p>
          <p>Echipa ${storeSettings.storeName}</p>
        </div>
        ${generateEmailFooter(storeSettings)}
      </body>
      </html>
    `;
    return sendMail({
      to,
      subject: roTranslations.email_welcome_subject,
      html,
      params: { email: to },
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
      <html lang="ro">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verifică adresa de email - ${storeSettings.storeName}</title>
      </head>
      <body style="font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${baseUrl}/logo.png" alt="${storeSettings.storeName} Logo" style="max-width: 200px;">
        </div>
        <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h1 style="color: #333; margin-bottom: 24px; text-align: center;">Verifică adresa ta de email</h1>
          <p>Salut ${name},</p>
          <p>Îți mulțumim că ți-ai creat un cont la ${storeSettings.storeName}. Pentru a finaliza înregistrarea și a începe să explorezi colecția noastră de jucării educaționale STEM, te rugăm să îți verifici adresa de email făcând clic pe butonul de mai jos:</p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${verificationLink}" 
               style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Verifică adresa de email
            </a>
          </div>
          <p style="margin-bottom: 24px;">Sau copiază și lipește acest link în browserul tău:</p>
          <p style="word-break: break-all; color: #6b7280; margin-bottom: 24px;">${verificationLink}</p>
          <p><strong>Important:</strong> Acest link va expira în ${expiresIn}.</p>
          <p>Dacă nu ți-ai creat un cont la ${storeSettings.storeName}, poți ignora acest email.</p>
          <h2 style="color: #333; margin-top: 32px;">În timp ce aștepți...</h2>
          <p>Consultă articolele noastre populare despre educația STEM:</p>
          <ul>
            <li><a href="${baseUrl}/blog/benefits-of-stem-toys" style="color: #3b82f6; text-decoration: none;">Beneficiile jucăriilor STEM pentru dezvoltarea timpurie</a></li>
            <li><a href="${baseUrl}/blog/stem-activities-for-kids" style="color: #3b82f6; text-decoration: none;">5 activități STEM distractive pe care le poți face acasă</a></li>
          </ul>
        </div>
        ${generateEmailFooter(storeSettings)}
      </body>
      </html>
    `;

    return sendMail({
      to,
      subject: roTranslations.email_verification_subject,
      html,
      params: { email: to },
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
      <html lang="ro">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Resetare Parolă - ${storeSettings.storeName}</title>
      </head>
      <body style="font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${baseUrl}/logo.png" alt="${storeSettings.storeName} Logo" style="max-width: 200px;">
        </div>
        
        <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h1 style="color: #333; margin-bottom: 24px; text-align: center;">Resetare Parolă</h1>
          
          <p>Am primit o solicitare de resetare a parolei pentru contul tău ${storeSettings.storeName}.</p>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetLink}" 
               style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Resetează Parola
            </a>
          </div>
          
          <p style="margin-bottom: 24px;">Sau copiază și lipește acest link în browserul tău:</p>
          <p style="word-break: break-all; color: #6b7280; margin-bottom: 24px;">${resetLink}</p>
          
          <p><strong>Important:</strong> Acest link va expira în ${expiresIn}.</p>
          <p>Dacă nu ai solicitat resetarea parolei, poți ignora acest email. Securitatea contului tău este importantă pentru noi.</p>
          
          <div style="background-color: #f9fafb; padding: 16px; border-radius: 4px; margin-top: 32px;">
            <h3 style="color: #333; margin-top: 0;">Sfaturi pentru securitatea contului:</h3>
            <ul style="margin-bottom: 0;">
              <li>Folosește o parolă unică și puternică, pe care nu o folosești în altă parte</li>
              <li>Nu-ți împărtăși niciodată parola cu alții</li>
              <li>Fii prudent cu emailurile suspecte care îți cer informațiile de autentificare</li>
            </ul>
            <p style="margin-bottom: 0; margin-top: 16px;">Află mai multe despre <a href="${baseUrl}/security" style="color: #3b82f6; text-decoration: none;">securitatea contului</a>.</p>
          </div>
        </div>
        
        ${generateEmailFooter(storeSettings)}
      </body>
      </html>
    `;

    return sendMail({
      to,
      subject: roTranslations.email_password_reset_subject,
      html,
      params: { email: to },
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

        // Properly check and cast the images array
        let imageUrl = `${baseUrl}/placeholder.png`;
        if (Array.isArray(item.product.images)) {
          const images = item.product.images as string[];
          if (images.length > 0) {
            imageUrl = images[0];
          }
        }

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
            <h2 style="color: #333; text-align: center; margin-bottom: 24px;">Ți-ar putea plăcea și</h2>
            <div style="display: flex; justify-content: space-between;">
              ${relatedProducts
                .map((product) => {
                  // Safely get the first image URL or use placeholder
                  let imageUrl = `${baseUrl}/placeholder.png`;

                  // Handle the Product.images type
                  const productImages = product.images;
                  if (productImages && Array.isArray(productImages)) {
                    const images = productImages as string[];
                    if (images.length > 0) {
                      imageUrl = images[0];
                    }
                  }

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
      <html lang="ro">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirmare Comandă #${order.orderNumber} - ${storeSettings.storeName}</title>
      </head>
      <body style="font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${baseUrl}/logo.png" alt="${storeSettings.storeName} Logo" style="max-width: 200px;">
        </div>
        
        <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h1 style="color: #333; margin-bottom: 16px; text-align: center;">Confirmare Comandă</h1>
          <p style="text-align: center; font-size: 18px; color: #4b5563; margin-bottom: 32px;">Îți mulțumim pentru comandă!</p>
          
          <p>Salut ${user.name},</p>
          <p>Suntem încântați să confirmăm că am primit comanda ta și este în curs de procesare. Iată detaliile comenzii tale:</p>
          
          <div style="background-color: #f9fafb; padding: 16px; border-radius: 4px; margin: 24px 0;">
            <p style="margin: 0;"><strong>Număr Comandă:</strong> #${order.orderNumber}</p>
            <p style="margin: 8px 0 0;"><strong>Data:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
            <p style="margin: 8px 0 0;"><strong>Status:</strong> ${order.status}</p>
            <p style="margin: 8px 0 0;"><strong>Status Plată:</strong> ${order.paymentStatus}</p>
          </div>
          
          <h2 style="color: #333; margin-bottom: 16px;">Sumar Comandă</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f3f4f6;">
                <th style="text-align: left; padding: 12px 16px; border-bottom: 2px solid #e5e7eb;">Produs</th>
                <th style="text-align: center; padding: 12px 16px; border-bottom: 2px solid #e5e7eb;">Cant.</th>
                <th style="text-align: right; padding: 12px 16px; border-bottom: 2px solid #e5e7eb;">Preț</th>
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
                <td colspan="3" style="text-align: right; padding: 12px 16px;">Transport:</td>
                <td style="text-align: right; padding: 12px 16px;">${formatPrice(order.shippingCost)}</td>
              </tr>
              <tr>
                <td colspan="3" style="text-align: right; padding: 12px 16px;">TVA:</td>
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
              Vezi Detalii Comandă
            </a>
          </div>
          
          <div style="margin-top: 32px; border-top: 1px solid #e5e7eb; padding-top: 24px;">
            <h2 style="color: #333; margin-bottom: 16px;">Informații Livrare</h2>
            <p style="margin: 4px 0;"><strong>${order.shippingAddress.fullName}</strong></p>
            <p style="margin: 4px 0;">${order.shippingAddress.addressLine1}</p>
            ${order.shippingAddress.addressLine2 ? `<p style="margin: 4px 0;">${order.shippingAddress.addressLine2}</p>` : ""}
            <p style="margin: 4px 0;">${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}</p>
            <p style="margin: 4px 0;">${order.shippingAddress.country}</p>
            <p style="margin: 4px 0;">Telefon: ${order.shippingAddress.phone}</p>
          </div>
          
          <div style="margin-top: 32px; background-color: #eef2ff; padding: 16px; border-radius: 4px;">
            <h3 style="color: #3b82f6; margin-top: 0;">Ce urmează?</h3>
            <p style="margin-bottom: 8px;">1. Vei primi o confirmare de expediere când comanda ta este pe drum.</p>
            <p style="margin-bottom: 8px;">2. Poți urmări statusul comenzii tale oricând din <a href="${baseUrl}/account/orders" style="color: #3b82f6; text-decoration: none;">panoul de control al contului tău</a>.</p>
            <p style="margin-bottom: 0;">3. Dacă ai întrebări despre comanda ta, te rugăm să <a href="${baseUrl}/contact" style="color: #3b82f6; text-decoration: none;">contactezi echipa noastră de asistență</a>.</p>
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
      subject: roTranslations.email_order_confirmation_subject,
      html,
      params: { email: to },
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
          title: "Cerere de Retur Primită",
          description:
            "Am primit cererea ta de retur și este analizată de echipa noastră.",
          steps: [
            { status: "Cerere Primită", active: true },
            { status: "În Procesare", active: false },
            { status: "Aprobat", active: false },
            { status: "Finalizat", active: false },
          ],
        };
        break;
      case "PROCESSING":
        statusInfo = {
          title: "Retur în Procesare",
          description:
            "Returul tău este în curs de procesare. Îți vom trimite o actualizare când va fi aprobat.",
          steps: [
            { status: "Cerere Primită", active: true },
            { status: "În Procesare", active: true },
            { status: "Aprobat", active: false },
            { status: "Finalizat", active: false },
          ],
        };
        break;
      case "APPROVED":
        statusInfo = {
          title: "Retur Aprobat",
          description:
            "Vești bune! Returul tău a fost aprobat. După ce primim produsele, vom procesa rambursarea.",
          steps: [
            { status: "Cerere Primită", active: true },
            { status: "În Procesare", active: true },
            { status: "Aprobat", active: true },
            { status: "Finalizat", active: false },
          ],
        };
        break;
      case "COMPLETED":
        statusInfo = {
          title: "Retur Finalizat",
          description:
            "Returul tău a fost finalizat și rambursarea a fost procesată. Poate dura câteva zile lucrătoare până va apărea în contul tău.",
          steps: [
            { status: "Cerere Primită", active: true },
            { status: "În Procesare", active: true },
            { status: "Aprobat", active: true },
            { status: "Finalizat", active: true },
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
      <html lang="ro">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${statusInfo.title} - Comandă #${order.orderNumber} - ${storeSettings.storeName}</title>
      </head>
      <body style="font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="${baseUrl}/logo.png" alt="${storeSettings.storeName} Logo" style="max-width: 200px;">
        </div>
        
        <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h1 style="color: #333; margin-bottom: 16px; text-align: center;">${statusInfo.title}</h1>
          
          <p>Salut ${user.name},</p>
          <p>${statusInfo.description}</p>
          
          <div style="background-color: #f9fafb; padding: 16px; border-radius: 4px; margin: 24px 0;">
            <p style="margin: 0;"><strong>ID Retur:</strong> ${returnDetails.id}</p>
            <p style="margin: 8px 0 0;"><strong>Comandă Asociată:</strong> #${order.orderNumber}</p>
            <p style="margin: 8px 0 0;"><strong>Motiv Retur:</strong> ${returnDetails.reason}</p>
            ${returnDetails.comments ? `<p style="margin: 8px 0 0;"><strong>Comentarii:</strong> ${returnDetails.comments}</p>` : ""}
          </div>
          
          ${progressBarHtml}
          
          <div style="margin: 32px 0; text-align: center;">
            <a href="${baseUrl}/account/returns/${returnDetails.id}" 
               style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
              Vezi Detalii Retur
            </a>
          </div>
          
          <div style="margin-top: 32px; background-color: #eef2ff; padding: 16px; border-radius: 4px;">
            <h3 style="color: #3b82f6; margin-top: 0;">Aspecte importante din Politica de Retur</h3>
            <ul style="margin-bottom: 0;">
              <li>Retururile trebuie inițiate în termen de 30 de zile de la livrare</li>
              <li>Produsele trebuie să fie în ambalajul original și în stare nefolosită</li>
              <li>Includeți toate accesoriile, manualele și cadourile gratuite</li>
            </ul>
            <p style="margin-top: 16px; margin-bottom: 0;">
              <a href="${baseUrl}/returns-policy" style="color: #3b82f6; text-decoration: none;">Citește Politica noastră completă de Returnare și Rambursare</a>
            </p>
          </div>
          
          <div style="margin-top: 32px; text-align: center;">
            <p>Ai întrebări despre returul tău?</p>
            <p>Contactează echipa noastră de relații cu clienții la <a href="mailto:${storeSettings.contactEmail}" style="color: #3b82f6; text-decoration: none;">${storeSettings.contactEmail}</a> sau sună-ne la ${storeSettings.contactPhone}</p>
          </div>
          
          <h3 style="color: #333; margin-top: 32px;">Produse Recomandate</h3>
          <p>În timp ce aștepți procesarea returului tău, aruncă o privire la câteva dintre jucăriile noastre STEM de top:</p>
          <div style="display: flex; justify-content: space-between;">
            <div style="flex: 1; margin: 0 8px; text-align: center;">
              <a href="${baseUrl}/products/featured" style="text-decoration: none; color: inherit;">
                <img src="${baseUrl}/images/featured/product1.jpg" 
                     alt="Produse Recomandate" 
                     style="width: 100%; height: 120px; object-fit: cover; border-radius: 4px; margin-bottom: 8px;">
                <h3 style="margin: 8px 0; font-size: 14px;">Explorează Produsele Recomandate</h3>
              </a>
            </div>
            <div style="flex: 1; margin: 0 8px; text-align: center;">
              <a href="${baseUrl}/products/new-arrivals" style="text-decoration: none; color: inherit;">
                <img src="${baseUrl}/images/featured/product2.jpg" 
                     alt="Noutăți" 
                     style="width: 100%; height: 120px; object-fit: cover; border-radius: 4px; margin-bottom: 8px;">
                <h3 style="margin: 8px 0; font-size: 14px;">Noutăți</h3>
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
      subject: roTranslations.email_return_approved_subject.replace(
        "#{orderNumber}",
        order.orderNumber
      ),
      html,
      params: { email: to },
    });
  },
};
