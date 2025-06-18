import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

// Type definitions to help with type safety
type StemCategoryMap = {
  science: string[];
  technology: string[];
  engineering: string[];
  mathematics: string[];
  "educational-books": string[];
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = new URL(request.url).searchParams;
    const category = searchParams.get("category");
    const featured = searchParams.get("featured");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");

    console.log("API Request Params:", {
      category,
      featured,
      minPrice,
      maxPrice,
    });

    // Map STEM categories to their variations and translations
    const stemCategories: StemCategoryMap = {
      science: ["science", "stiinta", "știință", "ştiinţă", "stiinţă"],
      technology: ["technology", "tehnologie", "tech"],
      engineering: ["engineering", "inginerie"],
      mathematics: ["mathematics", "matematica", "matematică", "math", "mate"],
      "educational-books": [
        "educational-books",
        "books",
        "carti",
        "cărți",
        "carte",
        "educational books",
        "carti educationale",
        "cărți educaționale",
      ],
    };

    // Standardize category name for consistent matching
    const normalizeCategory = (categoryName: string): string => {
      if (!categoryName) return "";

      const lowerCat = categoryName.toLowerCase().trim();

      // Check each stem category for a match
      for (const [standardCategory, variations] of Object.entries(
        stemCategories
      )) {
        if (variations.includes(lowerCat)) {
          return standardCategory;
        }
      }

      return lowerCat;
    };

    // Build where clause based on the request parameters
    let where: any = {
      isActive: true, // Only return active products
    };

    // Handle price filtering
    if (minPrice || maxPrice) {
      where.price = {};

      if (minPrice) {
        where.price.gte = parseFloat(minPrice);
      }

      if (maxPrice) {
        where.price.lte = parseFloat(maxPrice);
      }
    }

    // Handle category filtering with improved debug
    if (category) {
      console.log(`Processing category filter: ${category}`);
      const normalizedCategory = normalizeCategory(category);
      console.log(`Normalized category: ${normalizedCategory}`);

      // Special handling for standard STEM categories
      if (Object.keys(stemCategories).includes(normalizedCategory)) {
        console.log(`Handling STEM category: ${normalizedCategory}`);

        // For books - check specifically for book category matches
        if (normalizedCategory === "educational-books") {
          where.OR = [
            {
              category: {
                slug: {
                  in: [
                    "educational-books",
                    "carti",
                    "books",
                    "carti-educationale",
                  ],
                },
              },
            },
            { category: { name: { contains: "book", mode: "insensitive" } } },
            { category: { name: { contains: "carti", mode: "insensitive" } } },
            { category: { name: { contains: "carte", mode: "insensitive" } } },
          ];
        }
        // For the other STEM categories, check both category and stemCategory attribute
        else {
          // Type assertion to ensure TypeScript understands this is a valid key
          const key = normalizedCategory as keyof StemCategoryMap;
          const variations = stemCategories[key];

          where.OR = [
            // Match by category (string variations)
            {
              category: {
                OR: [
                  { slug: { in: variations } },
                  { name: { in: variations } },
                ],
              },
            },
            // Match by stemCategory in attributes JSON (string)
            {
              attributes: {
                path: ["stemCategory"],
                string_contains: normalizedCategory,
              },
            },
          ];
        }
      } else {
        // For custom categories
        where.OR = [
          { category: { slug: normalizedCategory } },
          { category: { name: normalizedCategory } },
        ];
      }
    }

    // Handle featured products filter
    if (featured === "true") {
      where.featured = true;
    }

    console.log("Final query where clause:", JSON.stringify(where, null, 2));

    try {
      // Fetch products with the built where clause
      const products = await db.product.findMany({
        where,
        include: {
          category: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      console.log(`Found ${products.length} products matching criteria`);

      // Transform product data for the response
      const transformedProducts = products.map((product) => {
        // Extract data safely
        const productData = {
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          images: product.images,
          featured: product.featured,
          isActive: product.isActive,
          category: product.category
            ? {
                id: product.category.id,
                name: product.category.name,
                slug: product.category.slug,
              }
            : null,
          attributes: product.attributes,
        };

        // Add additional fields that might not be in all product records
        const result: any = { ...productData };

        // Extract stemCategory from attributes if it exists
        if (product.attributes && typeof product.attributes === "object") {
          const attrs = product.attributes as Record<string, any>;
          if (attrs.stemCategory) {
            result.stemCategory = attrs.stemCategory;
          }
        }

        // Add these fields only if they exist in the product record
        if ("ageRange" in product) {
          result.ageRange = (product as any).ageRange;
        }

        if ("stockLevel" in product) {
          result.stockLevel = (product as any).stockLevel;
        }

        return result;
      });

      console.log("Response structure format:", {
        count: products.length,
        hasProducts: true,
        format: "standard",
      });

      // Return the products - ensure consistent format between environments
      return NextResponse.json(transformedProducts);
    } catch (dbError) {
      console.error("Database error when fetching products:", dbError);
      return NextResponse.json(
        { error: "Database error", details: dbError },
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
