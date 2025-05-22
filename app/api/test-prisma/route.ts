import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    // Get user model fields
    const userFieldsPromise = db.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'User'
    `;

    const userFields = await userFieldsPromise;

    return NextResponse.json({
      message: "Database schema info retrieved successfully",
      userFields,
    });
  } catch (error) {
    console.error("Database schema check error:", error);
    return NextResponse.json(
      { error: "Error checking database schema" },
      { status: 500 }
    );
  }
}
