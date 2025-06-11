import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Get counts of products by category
    const categoryCounts = await db.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        _count: {
          select: {
            products: {
              where: {
                isActive: true,
              },
            },
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    // Get price ranges
    const priceStats = await db.product.aggregate({
      _min: {
        price: true,
      },
      _max: {
        price: true,
      },
      _avg: {
        price: true,
      },
      _count: true,
      where: {
        isActive: true,
      },
    });

    // Get counts of products with stemCategory attribute
    const products = await db.product.findMany({
      select: {
        id: true,
        attributes: true,
      },
      where: {
        isActive: true,
      },
    });

    // Count products by stemCategory
    const stemCategoryCounts: Record<string, number> = {};

    products.forEach((product) => {
      if (product.attributes && typeof product.attributes === "object") {
        const attrs = product.attributes as Record<string, any>;
        if (attrs.stemCategory) {
          const stemCat = String(attrs.stemCategory).toLowerCase();
          stemCategoryCounts[stemCat] = (stemCategoryCounts[stemCat] || 0) + 1;
        }
      }
    });

    return NextResponse.json({
      categories: categoryCounts.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        productCount: c._count.products,
      })),
      stemCategories: stemCategoryCounts,
      productStats: {
        totalCount: priceStats._count,
        minPrice: priceStats._min.price,
        maxPrice: priceStats._max.price,
        avgPrice: priceStats._avg.price,
      },
    });
  } catch (error) {
    console.error("Debug API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch debug information" },
      { status: 500 }
    );
  }
}
