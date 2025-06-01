import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = new URL(request.url).searchParams;
    const category = searchParams.get("category");
    const stemCategory = searchParams.get("stemCategory");
    const featured = searchParams.get("featured");

    console.log("API Request Params:", { category, stemCategory, featured });

    // Build query filters
    const filters: any = {
      isActive: true, // Only return active products
    };

    if (category) {
      filters.categoryId = category;
    }

    if (stemCategory) {
      filters.stemCategory = stemCategory;
    }

    // Get all products first
    try {
      const allProducts = await db.product.findMany({
        where: {
          isActive: true,
        },
        include: {
          category: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      console.log(`Found ${allProducts.length} active products in database`);

      // Log all products to inspect their properties
      console.log(
        "All products:",
        allProducts.map((p) => ({
          id: p.id,
          name: p.name,
          featured: p.featured,
          hasOwnProperty: Object.prototype.hasOwnProperty.call(p, "featured"),
        }))
      );

      // If featured is requested, filter in memory
      if (featured === "true") {
        const featuredProducts = allProducts.filter((product) => {
          const isFeatured = product.featured === true;
          console.log(`Product ${product.name} featured status:`, isFeatured);
          return isFeatured;
        });
        console.log(`Filtered to ${featuredProducts.length} featured products`);
        return NextResponse.json(featuredProducts);
      }

      return NextResponse.json(allProducts);
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
