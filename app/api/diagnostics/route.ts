import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Basic environment info
    const envInfo = {
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || "Not set",
      NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || "Not set",
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || "Not set",
      DATABASE_URL: process.env.DATABASE_URL
        ? "Set (hidden for security)"
        : "Not set",
    };

    // Test database connection
    let dbConnectionStatus = "Unknown";
    let productCount = 0;
    let blogCount = 0;
    let error = null;

    try {
      // Try to count products and blogs to verify database access
      productCount = await db.product.count();
      blogCount = await db.blog.count();
      dbConnectionStatus = "Connected";
    } catch (err: any) {
      dbConnectionStatus = "Error";
      error = {
        message: err.message,
        code: err.code,
      };
    }

    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      environment: envInfo,
      database: {
        status: dbConnectionStatus,
        productCount,
        blogCount,
        error,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        message: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
