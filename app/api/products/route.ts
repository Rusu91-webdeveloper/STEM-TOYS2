import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = new URL(request.url).searchParams;
    const category = searchParams.get("category");
    const stemCategory = searchParams.get("stemCategory");
    const featured = searchParams.get("featured");

    console.log("API Request Params:", { category, stemCategory, featured });

    // Build where clause directly instead of filtering in memory
    const where = {
      isActive: true, // Only return active products
      ...(category ? { categoryId: category } : {}),
      ...(stemCategory ? { stemCategory: stemCategory } : {}),
      ...(featured === "true" ? { featured: true } : {}),
    };

    // Let the database filter instead of filtering in memory
    try {
      const products = await db.product.findMany({
        where,
        include: {
          category: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      console.log(`Found ${products.length} matching products in database`);

      // Create response with products
      const response = NextResponse.json(products);

      // Add cache control header for CDN and browser caching
      response.headers.set(
        "Cache-Control",
        "public, s-maxage=60, stale-while-revalidate=300"
      );

      return response;
    } catch (error) {
      console.error("Database query error:", error);
      return NextResponse.json(
        {
          error: "Database query failed",
          details: error instanceof Error ? error.message : String(error),
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
