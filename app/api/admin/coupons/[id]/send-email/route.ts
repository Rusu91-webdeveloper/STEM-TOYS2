import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { sendMail } from "@/lib/brevo";

// Validation schema for sending coupon emails
const sendCouponEmailSchema = z.object({
  recipients: z.enum(["subscribers", "all_users", "custom"]),
  customEmails: z.array(z.string().email()).optional(),
  subject: z.string().min(1).max(200),
  message: z.string().min(1).max(1000).optional(),
});

// POST /api/admin/coupons/[id]/send-email - Send coupon via email
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await request.json();
    const validatedData = sendCouponEmailSchema.parse(body);

    // Get coupon details
    const coupon = await db.coupon.findUnique({
      where: { id },
    });

    if (!coupon) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    if (!coupon.isActive) {
      return NextResponse.json(
        { error: "Cannot send emails for inactive coupons" },
        { status: 400 }
      );
    }

    // Determine recipients
    let recipients: string[] = [];

    switch (validatedData.recipients) {
      case "subscribers":
        const subscribers = await db.newsletter.findMany({
          where: { isActive: true },
          select: { email: true },
        });
        recipients = subscribers.map((s) => s.email);
        break;

      case "all_users":
        const users = await db.user.findMany({
          where: {
            isActive: true,
            emailVerified: { not: null },
          },
          select: { email: true },
        });
        recipients = users.map((u) => u.email);
        break;

      case "custom":
        if (
          !validatedData.customEmails ||
          validatedData.customEmails.length === 0
        ) {
          return NextResponse.json(
            { error: "Custom emails list cannot be empty" },
            { status: 400 }
          );
        }
        recipients = validatedData.customEmails;
        break;
    }

    if (recipients.length === 0) {
      return NextResponse.json(
        { error: "No recipients found" },
        { status: 400 }
      );
    }

    // Get store settings for branding
    const storeSettings = await db.storeSettings.findFirst();
    const storeName = storeSettings?.storeName || "TechTots";

    // Create email content
    const discountText =
      coupon.type === "PERCENTAGE"
        ? `${coupon.value}% OFF`
        : `${coupon.value} LEI OFF`;

    const expiryText = coupon.expiresAt
      ? `Expires: ${coupon.expiresAt.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}`
      : "No expiry date";

    const minOrderText = coupon.minimumOrderValue
      ? `Minimum order value: ${coupon.minimumOrderValue} LEI`
      : "";

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0;">${storeName}</h1>
        </div>
        
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
          <h2 style="margin: 0 0 10px 0; font-size: 24px;">🎉 Special Discount for You!</h2>
          <div style="font-size: 36px; font-weight: bold; margin: 20px 0;">${discountText}</div>
          <div style="font-size: 18px; margin: 10px 0;">Use code: <strong style="background: rgba(255,255,255,0.2); padding: 8px 16px; border-radius: 5px; font-size: 20px;">${coupon.code}</strong></div>
        </div>

        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="margin: 0 0 15px 0; color: #374151;">${coupon.name}</h3>
          ${coupon.description ? `<p style="color: #6b7280; margin: 0 0 15px 0;">${coupon.description}</p>` : ""}
          ${validatedData.message ? `<p style="color: #374151; margin: 0 0 15px 0;">${validatedData.message}</p>` : ""}
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 15px; margin-top: 15px;">
            <p style="margin: 5px 0; color: #6b7280; font-size: 14px;"><strong>📅 ${expiryText}</strong></p>
            ${minOrderText ? `<p style="margin: 5px 0; color: #6b7280; font-size: 14px;"><strong>💰 ${minOrderText}</strong></p>` : ""}
            ${coupon.maxUsesPerUser ? `<p style="margin: 5px 0; color: #6b7280; font-size: 14px;"><strong>👤 Limit: ${coupon.maxUsesPerUser} use(s) per customer</strong></p>` : ""}
          </div>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${storeSettings?.storeUrl || "https://techtots.com"}/products" 
             style="display: inline-block; background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
            Shop Now
          </a>
        </div>

        <div style="text-align: center; padding: 20px; border-top: 1px solid #e5e7eb; margin-top: 30px;">
          <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            You received this email because you're subscribed to ${storeName} updates.<br>
            <a href="${storeSettings?.storeUrl || "https://techtots.com"}/unsubscribe" style="color: #6b7280;">Unsubscribe</a>
          </p>
        </div>
      </div>
    `;

    // Send emails in batches to avoid overwhelming the email service
    const batchSize = 50;
    const batches = [];
    for (let i = 0; i < recipients.length; i += batchSize) {
      batches.push(recipients.slice(i, i + batchSize));
    }

    let successCount = 0;
    let failureCount = 0;

    for (const batch of batches) {
      const emailPromises = batch.map(async (email) => {
        try {
          await sendMail({
            to: email,
            subject: validatedData.subject,
            html: emailHtml,
            from: storeSettings?.contactEmail || "noreply@techtots.com",
            fromName: storeName,
          });
          return { email, success: true };
        } catch (error) {
          console.error(`Failed to send email to ${email}:`, error);
          return { email, success: false, error };
        }
      });

      const results = await Promise.allSettled(emailPromises);

      results.forEach((result) => {
        if (result.status === "fulfilled" && result.value.success) {
          successCount++;
        } else {
          failureCount++;
        }
      });

      // Add delay between batches to be respectful to email service
      if (batches.indexOf(batch) < batches.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    return NextResponse.json({
      message: "Coupon emails sent successfully",
      stats: {
        totalRecipients: recipients.length,
        successCount,
        failureCount,
        couponCode: coupon.code,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error sending coupon emails:", error);
    return NextResponse.json(
      { error: "Failed to send coupon emails" },
      { status: 500 }
    );
  }
}
