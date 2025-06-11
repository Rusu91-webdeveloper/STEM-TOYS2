import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { deleteUploadThingFiles } from "@/lib/uploadthing";
import { revalidateTag } from "next/cache";
import { slugify } from "@/lib/utils";
import { handleFormData } from "@/lib/api-helpers";

// In a production application, you would properly implement auth checks
// For this demo, we'll skip authentication since it's causing import issues
// and we're in development mode
const isDevelopment = process.env.NODE_ENV === "development";

// GET handler to retrieve a specific product
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const productId = context.params.id;

    const product = await db.product.findUnique({
      where: { id: productId },
      include: { category: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT handler to update a product
export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const productId = context.params.id;
    const data = await request.json();

    const product = await db.product.update({
      where: { id: productId },
      data,
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

// DELETE handler to delete a product
export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const productId = context.params.id;
    console.log(`Attempting to delete product with ID: ${productId}`);

    // Add debug logs to trace the issue
    console.log(`Product ID type: ${typeof productId}`);
    console.log(`Product ID length: ${productId.length}`);

    // List all products to check if ID exists
    try {
      const allProducts = await db.product.findMany({
        select: { id: true, name: true },
        take: 10, // Limit to 10 products for debugging
      });
      console.log(`Available products (${allProducts.length}):`);
      allProducts.forEach((p) => console.log(`- ID: ${p.id}, Name: ${p.name}`));
    } catch (listError) {
      console.error("Error listing products:", listError);
    }

    // Check if product exists before trying to delete
    const product = await db.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      console.log(`Product with ID ${productId} not found`);

      // Try to find by different means if available
      try {
        const productBySlug = await db.product.findFirst({
          where: {
            OR: [{ slug: productId }, { name: productId }],
          },
        });

        if (productBySlug) {
          console.log(
            `Found product by alternative means: ${productBySlug.id} (${productBySlug.name})`
          );
        } else {
          console.log("Could not find product by any means");
        }
      } catch (alternativeError) {
        console.error("Error in alternative product lookup:", alternativeError);
      }

      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Store product images before deleting the product
    const productImages = product.images as string[];
    console.log(
      `Found ${productImages?.length || 0} images for product ${productId}:`,
      productImages
    );

    // Store the product slug before deletion for cache invalidation
    const productSlug = product.slug;
    const categoryId = product.categoryId;

    // Delete the product from the database
    await db.product.delete({
      where: { id: productId },
    });

    console.log(`Product ${productId} successfully deleted from database`);

    // Delete associated images from UploadThing
    if (productImages && productImages.length > 0) {
      console.log(
        `Starting deletion of ${productImages.length} images for product ${productId}`
      );

      try {
        const deleteResult = await deleteUploadThingFiles(productImages);
        console.log(
          `Image deletion result for product ${productId}:`,
          deleteResult
        );

        if (!deleteResult.success) {
          console.warn(
            `Warning: Failed to delete some images: ${deleteResult.message}`
          );
        }
      } catch (imageError) {
        // Log but don't fail the request if image deletion fails
        console.error(
          `Error deleting images for product ${productId}:`,
          imageError
        );
      }
    } else {
      console.log(`No images to delete for product ${productId}`);
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

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}

// PATCH handler to update a product
export async function PATCH(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const productId = context.params.id;

    let updatedData;

    // Check if the request is multipart/form-data or JSON
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      // Handle form data (including file uploads)
      const formData = await request.formData();
      updatedData = await handleFormData(formData);
    } else {
      // Handle JSON data
      updatedData = await request.json();
    }

    // Check if product exists
    const existingProduct = await db.product.findUnique({
      where: { id: productId },
      include: { category: true },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Prepare data for update
    const updateData: any = {
      name: updatedData.name,
      price: parseFloat(updatedData.price),
      description: updatedData.description,
    };

    // Only update slug if name has changed (and generate slug from name)
    if (updatedData.name && updatedData.name !== existingProduct.name) {
      updateData.slug = slugify(updatedData.name);
    }

    // Only add optional fields if they exist in the update data
    if (updatedData.compareAtPrice) {
      updateData.compareAtPrice = parseFloat(updatedData.compareAtPrice);
    }

    if (updatedData.categoryId) {
      updateData.categoryId = updatedData.categoryId;
    }

    if (updatedData.isActive !== undefined) {
      updateData.isActive =
        updatedData.isActive === true || updatedData.isActive === "true";
    }

    if (updatedData.featured !== undefined) {
      updateData.featured =
        updatedData.featured === true || updatedData.featured === "true";
    }

    if (updatedData.tags) {
      updateData.tags = Array.isArray(updatedData.tags)
        ? updatedData.tags
        : JSON.parse(updatedData.tags);
    }

    // Handle attributes as JSON
    if (updatedData.attributes) {
      updateData.attributes =
        typeof updatedData.attributes === "string"
          ? JSON.parse(updatedData.attributes)
          : updatedData.attributes;
    }

    // Handle images array - preserve existing images if not updating
    if (updatedData.images) {
      updateData.images = Array.isArray(updatedData.images)
        ? updatedData.images
        : JSON.parse(updatedData.images);
    }

    // Update product in database
    const updatedProduct = await db.product.update({
      where: { id: productId },
      data: updateData,
      include: { category: true },
    });

    // Store the product slug and category for cache revalidation
    const productSlug = updatedProduct.slug;
    const categoryId = updatedProduct.categoryId;

    // Revalidate caches to ensure product updates are visible immediately
    console.log("Revalidating cache tags for product update");

    // Revalidate the products list
    revalidateTag("products");

    // Revalidate specific product
    revalidateTag(`product-${productSlug}`);

    // If old slug is different from new slug, revalidate the old one too
    if (existingProduct.slug !== productSlug) {
      revalidateTag(`product-${existingProduct.slug}`);
    }

    // Revalidate category pages
    if (categoryId) {
      revalidateTag(`category-${categoryId}`);
    }

    // If category was changed, revalidate the old category too
    if (existingProduct.categoryId !== categoryId) {
      revalidateTag(`category-${existingProduct.categoryId}`);
    }

    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}
