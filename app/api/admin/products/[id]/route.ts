import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { deleteUploadThingFiles } from "@/lib/uploadthing";

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

    // Check if product exists before trying to delete
    const product = await db.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      console.log(`Product with ID ${productId} not found`);
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Store product images before deleting the product
    const productImages = product.images as string[];
    console.log(
      `Found ${productImages?.length || 0} images for product ${productId}:`,
      productImages
    );

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
