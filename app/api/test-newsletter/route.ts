import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { emailTemplates } from "@/lib/brevoTemplates";
import { auth } from "@/lib/auth";

// Define types for raw query results
type CountResult = { count: string | number }[];
type NewsletterResult = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  isActive: boolean;
  categories: string[];
  createdAt: Date;
  updatedAt: Date;
}[];

/**
 * Test the newsletter system
 * This is a protected route that only admins can access
 * Or when a special test parameter is provided
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "all";
    const email = searchParams.get("email") || "test@example.com";
    const firstName = searchParams.get("firstName") || "Test";
    const testMode = searchParams.get("testMode") === "true";

    // Check authentication and authorization unless in test mode
    if (!testMode) {
      const session = await auth();

      if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json(
          { success: false, message: "Acces neautorizat" },
          { status: 401 }
        );
      }
    }

    const results: Record<string, any> = {};

    // Use direct database queries for the Newsletter model
    const db = prisma;

    // Test subscription
    if (action === "subscribe" || action === "all") {
      // Delete any existing subscriber with this email to start fresh
      await db.$executeRaw`DELETE FROM "Newsletter" WHERE email = ${email}`;

      // Create a new subscriber
      const subscriber = await db.$executeRaw`
        INSERT INTO "Newsletter" (id, email, "firstName", "categories", "isActive", "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), ${email}, ${firstName}, ARRAY['SCIENCE', 'TECHNOLOGY']::text[], true, NOW(), NOW())
        RETURNING *
      `;

      // Send welcome email
      await emailTemplates.newsletterWelcome({
        to: email,
        name: firstName,
      });

      results.subscribe = {
        success: true,
        message: "Subscriber created and welcome email sent",
      };
    }

    // Test unsubscription
    if (action === "unsubscribe" || action === "all") {
      // Check if subscriber exists
      const subscriberExists = await db.$queryRaw<CountResult>`
        SELECT COUNT(*) FROM "Newsletter" WHERE email = ${email}
      `;

      const exists = Number(subscriberExists[0].count) > 0;

      if (!exists && action === "unsubscribe") {
        // Create the subscriber first if testing only unsubscribe
        await db.$executeRaw`
          INSERT INTO "Newsletter" (id, email, "firstName", "categories", "isActive", "createdAt", "updatedAt")
          VALUES (gen_random_uuid(), ${email}, ${firstName}, ARRAY['SCIENCE', 'TECHNOLOGY']::text[], true, NOW(), NOW())
        `;
      }

      // Update to inactive
      if (exists || action === "unsubscribe") {
        await db.$executeRaw`
          UPDATE "Newsletter" SET "isActive" = false, "updatedAt" = NOW() WHERE email = ${email}
        `;

        results.unsubscribe = {
          success: true,
          message: "Subscriber marked as inactive",
        };
      }
    }

    // Test blog notification
    if (action === "notify" || action === "all") {
      // Check if subscriber exists and is active
      const subscriberData = await db.$queryRaw<NewsletterResult>`
        SELECT * FROM "Newsletter" WHERE email = ${email}
      `;

      const subscriber = subscriberData[0];

      if (!subscriber || !subscriber.isActive) {
        // Create or reactivate the subscriber
        if (!subscriber) {
          await db.$executeRaw`
            INSERT INTO "Newsletter" (id, email, "firstName", "categories", "isActive", "createdAt", "updatedAt")
            VALUES (gen_random_uuid(), ${email}, ${firstName}, ARRAY['SCIENCE', 'TECHNOLOGY']::text[], true, NOW(), NOW())
          `;
        } else {
          await db.$executeRaw`
            UPDATE "Newsletter" SET "isActive" = true, "updatedAt" = NOW() WHERE email = ${email}
          `;
        }
      }

      // Find a blog post to use
      const blog = await prisma.blog.findFirst({
        where: { isPublished: true },
        include: {
          author: {
            select: {
              name: true,
            },
          },
          category: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
      });

      if (blog) {
        // Send notification
        await emailTemplates.blogNotification({
          to: email,
          name: firstName,
          blog,
        });

        results.notify = {
          success: true,
          blog: {
            id: blog.id,
            title: blog.title,
            slug: blog.slug,
          },
          message: "Blog notification email sent",
        };
      } else {
        results.notify = {
          success: false,
          message: "No published blog posts found",
        };
      }
    }

    return NextResponse.json({
      success: true,
      action,
      results,
    });
  } catch (error) {
    console.error("Newsletter test error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "A apărut o eroare la testarea newsletter-ului",
        error: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
