import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { revalidateTag } from "next/cache";

// Schema for product validation
const productSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  slug: z
    .string()
    .min(3, { message: "Slug must be at least 3 characters" })
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: "Slug must contain only lowercase letters, numbers, and hyphens",
    }),
  description: z
    .string()
    .min(10, { message: "Description must be at least 10 characters" }),
  price: z.number().positive({ message: "Price must be positive" }),
  compareAtPrice: z.number().positive().optional(),
  images: z
    .array(z.string())
    .min(1, { message: "At least one image is required" }),
  categoryId: z.string().min(1, { message: "Category is required" }),
  tags: z.array(z.string()).optional().default([]),
  attributes: z.record(z.string()).optional(),
  isActive: z.boolean().optional().default(true),
  // SEO fields
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.array(z.string()).optional(),
  // STEM specific fields
  ageRange: z.string().optional(),
  stemCategory: z.string().optional(),
  difficultyLevel: z.string().optional(),
  learningObjectives: z.array(z.string()).optional(),
});

// Schema for product update validation (similar to create but all fields optional)
const productUpdateSchema = productSchema.partial().extend({
  id: z.string().min(1, { message: "Product ID is required" }),
});

// Helper function to check if user is admin
async function isAdmin(request: NextRequest) {
  const session = await auth();
  return session?.user?.role === "ADMIN";
}

// GET all products
export async function GET(request: NextRequest) {
  try {
    // Check if user is admin
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Log that we're attempting to fetch products
    console.log("Fetching products from database");

    let products;

    if (process.env.USE_MOCK_DATA === "true") {
      console.log("Using mock data for products");
      // Return mock products if in development mode
      products = [
        {
          id: "P001",
          name: "Robotic Building Kit",
          price: 59.99,
          category: { name: "Technology" },
          inventory: 32,
          status: "In Stock",
          featured: true,
          image:
            "https://placehold.co/400x300/4F46E5/FFFFFF.png?text=Robot+Kit",
        },
        // ... other mock products
      ];
    } else {
      // Fetch from database with proper error handling
      try {
        products = await db.product.findMany({
          include: {
            category: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        });
        console.log(`Found ${products.length} products in database`);
      } catch (dbError) {
        console.error("Database error when fetching products:", dbError);
        return NextResponse.json(
          { error: "Database error", details: dbError },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: error },
      { status: 500 }
    );
  }
}

// POST new product
export async function POST(request: NextRequest) {
  try {
    // Get the auth session and enforce admin role check
    const session = await auth();
    console.log("Auth session in POST /api/admin/products:", session);

    if (session?.user?.role !== "ADMIN") {
      console.log("Unauthorized access attempt: User is not an admin");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Creating new product");
    const body = await request.json();
    console.log("Request body:", JSON.stringify(body, null, 2));

    // Validate input
    const validationResult = productSchema.safeParse(body);
    if (!validationResult.success) {
      console.error("Validation error:", validationResult.error.format());
      return NextResponse.json(
        { error: "Invalid input", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const data = validationResult.data;
    console.log("Validated data:", JSON.stringify(data, null, 2));

    // Check if slug is already in use
    const existingProduct = await db.product.findUnique({
      where: { slug: data.slug },
    });

    if (existingProduct) {
      console.log("Slug already in use:", data.slug);
      return NextResponse.json(
        { error: "Slug already in use" },
        { status: 400 }
      );
    }

    // Create product in database
    try {
      console.log("Attempting to create product in database");
      const product = await db.product.create({
        data: {
          name: data.name,
          slug: data.slug,
          description: data.description,
          price: data.price,
          compareAtPrice: data.compareAtPrice,
          images: data.images,
          categoryId: data.categoryId,
          tags: data.tags || [],
          attributes: {
            // Include SEO metadata in attributes
            metaTitle: data.metaTitle || data.name,
            metaDescription:
              data.metaDescription || data.description.substring(0, 160),
            metaKeywords: data.metaKeywords || data.tags || [],
            ageRange: data.ageRange,
            stemCategory: data.stemCategory
              ? data.stemCategory.toUpperCase()
              : undefined,
            difficultyLevel: data.difficultyLevel,
            learningObjectives: data.learningObjectives,
            // Any other custom attributes
            ...(data.attributes || {}),
          },
          isActive: data.isActive,
        },
        include: {
          category: true,
        },
      });

      console.log("Product created successfully:", product.id);
      return NextResponse.json(product, { status: 201 });
    } catch (dbError) {
      console.error("Database error creating product:", dbError);
      return NextResponse.json(
        { error: "Database error", details: String(dbError) },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product", details: String(error) },
      { status: 500 }
    );
  }
}

// PUT - Update existing product
export async function PUT(request: NextRequest) {
  try {
    // Check if user is admin
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate input
    const validationResult = productUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Check if product exists
    const existingProduct = await db.product.findUnique({
      where: { id: data.id },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check if new slug (if provided) is already in use by another product
    if (data.slug && data.slug !== existingProduct.slug) {
      const slugExists = await db.product.findUnique({
        where: { slug: data.slug },
      });

      if (slugExists && slugExists.id !== data.id) {
        return NextResponse.json(
          { error: "Slug already in use by another product" },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: any = {};

    // Add basic fields if they exist
    if (data.name !== undefined) updateData.name = data.name;
    if (data.slug !== undefined) updateData.slug = data.slug;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.compareAtPrice !== undefined)
      updateData.compareAtPrice = data.compareAtPrice;
    if (data.images !== undefined) updateData.images = data.images;
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;
    if (data.tags !== undefined) updateData.tags = data.tags;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    // Handle attributes update
    if (existingProduct.attributes) {
      const currentAttributes = existingProduct.attributes as Record<
        string,
        any
      >;

      const updatedAttributes = {
        ...currentAttributes,
        ...(data.metaTitle !== undefined && {
          metaTitle: data.metaTitle || data.name,
        }),
        ...(data.metaDescription !== undefined && {
          metaDescription:
            data.metaDescription ||
            (data.description ? data.description.substring(0, 160) : undefined),
        }),
        ...(data.metaKeywords !== undefined && {
          metaKeywords: data.metaKeywords,
        }),
        ...(data.ageRange !== undefined && { ageRange: data.ageRange }),
        ...(data.stemCategory !== undefined && {
          stemCategory: data.stemCategory
            ? data.stemCategory.toUpperCase()
            : undefined,
        }),
        ...(data.difficultyLevel !== undefined && {
          difficultyLevel: data.difficultyLevel,
        }),
        ...(data.learningObjectives !== undefined && {
          learningObjectives: data.learningObjectives,
        }),
        ...(data.attributes || {}),
      };

      updateData.attributes = updatedAttributes;
    } else if (
      data.metaTitle ||
      data.metaDescription ||
      data.metaKeywords ||
      data.ageRange ||
      data.stemCategory ||
      data.difficultyLevel ||
      data.learningObjectives ||
      data.attributes
    ) {
      // If there were no previous attributes but now we have some
      updateData.attributes = {
        ...(data.metaTitle && { metaTitle: data.metaTitle || data.name }),
        ...(data.metaDescription && {
          metaDescription:
            data.metaDescription ||
            (data.description ? data.description.substring(0, 160) : undefined),
        }),
        ...(data.metaKeywords && { metaKeywords: data.metaKeywords }),
        ...(data.ageRange && { ageRange: data.ageRange }),
        ...(data.stemCategory && {
          stemCategory: data.stemCategory
            ? data.stemCategory.toUpperCase()
            : undefined,
        }),
        ...(data.difficultyLevel && { difficultyLevel: data.difficultyLevel }),
        ...(data.learningObjectives && {
          learningObjectives: data.learningObjectives,
        }),
        ...(data.attributes || {}),
      };
    }

    // Update product in database
    const updatedProduct = await db.product.update({
      where: { id: data.id },
      data: updateData,
      include: {
        category: true,
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE - Remove a product
export async function DELETE(request: NextRequest) {
  try {
    // Check if user is admin
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get product ID from URL
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Check if product exists
    const existingProduct = await db.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Store product images before deleting the product
    const productImages = existingProduct.images as string[];

    // Store product info for cache invalidation
    const productSlug = existingProduct.slug;
    const categoryId = existingProduct.categoryId;

    // Delete product
    await db.product.delete({
      where: { id },
    });

    // Delete associated images from UploadThing
    if (productImages && productImages.length > 0) {
      try {
        const { deleteUploadThingFiles } = await import("@/lib/uploadthing");
        const deleteResult = await deleteUploadThingFiles(productImages);
        console.log("UploadThing delete result:", deleteResult);
      } catch (imageError) {
        // Log but don't fail the request if image deletion fails
        console.error("Failed to delete product images:", imageError);
      }
    }

    // Revalidate caches to ensure product disappears from the UI
    console.log("Revalidating cache tags for product deletion");

    // Revalidate the products list
    revalidateTag("products");

    // Revalidate specific product
    revalidateTag(`product-${productSlug}`);

    // Revalidate category if it exists
    if (categoryId) {
      revalidateTag(`category-${categoryId}`);
    }

    return NextResponse.json(
      { message: "Product deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
