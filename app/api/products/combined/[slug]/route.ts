import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = await params.slug;
    console.log(`Looking for combined product/book with slug: ${slug}`);

    // First, try to find a product with this slug
    const product = await db.product.findFirst({
      where: {
        slug: slug,
        isActive: true,
      },
      include: {
        category: true,
      },
    });

    if (product) {
      console.log(`Found product with slug: ${slug}`);
      return NextResponse.json(product);
    }

    // If no product found, try to find a book
    console.log(`No product found, looking for book with slug: ${slug}`);
    const book = await db.book.findFirst({
      where: {
        slug: slug,
        isActive: true,
      },
      include: {
        languages: true,
      },
    });

    if (book) {
      console.log(`Found book with slug: ${slug}`);

      // Convert book to product format
      const bookAsProduct = {
        id: book.id,
        name: book.name,
        slug: book.slug,
        description: book.description,
        price: book.price,
        compareAtPrice: null,
        images: book.coverImage ? [book.coverImage] : [],
        category: {
          id: "educational-books",
          name: "Educational Books",
          slug: "educational-books",
        },
        tags: ["book", "educational"],
        attributes: {
          author: book.author,
          languages: book.languages.map((lang) => lang.name).join(", "),
          type: "Book",
          isBook: "true",
        },
        isActive: book.isActive,
        createdAt: book.createdAt,
        updatedAt: book.updatedAt,
        stockQuantity: 10, // Default stock for books
        featured: true, // Feature all books
        isBook: true, // Add a flag to indicate this is a book
      };

      return NextResponse.json(bookAsProduct);
    }

    // If neither product nor book found, return 404
    console.log(`No product or book found with slug: ${slug}`);
    return new NextResponse(null, { status: 404 });
  } catch (error) {
    console.error(
      `Error fetching combined product/book with slug ${await params.slug}:`,
      error
    );
    return new NextResponse(
      JSON.stringify({ error: "Failed to fetch product" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
