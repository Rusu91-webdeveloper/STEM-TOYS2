import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

interface Props {
  params: Promise<{
    slug: string;
  }>;
}

export async function GET(request: NextRequest, { params }: Props) {
  try {
    const { slug } = await params;

    // First, try to find the book directly by slug
    let book = await db.book.findUnique({
      where: { slug },
      include: {
        languages: true,
      },
    });

    // If not found, try to find by product slug and map to book
    if (!book) {
      const product = await db.product.findUnique({
        where: { slug },
        select: { slug: true },
      });

      if (product) {
        book = await db.book.findUnique({
          where: { slug: product.slug },
          include: {
            languages: true,
          },
        });
      }
    }

    if (!book) {
      const errorResponse = NextResponse.json(
        { error: "Book not found" },
        { status: 404 }
      );
      // **PERFORMANCE**: Cache 404s briefly to reduce repeated failed lookups
      errorResponse.headers.set("Cache-Control", "public, max-age=60");
      return errorResponse;
    }

    // Get unique languages available for this book using the languages relation
    const availableLanguages = book.languages.map((language: any) => ({
      code: language.code,
      name: language.name,
      formats: ["EPUB", "PDF"], // Default formats - can be enhanced later
    }));

    const responseData = {
      bookId: book.id,
      bookName: book.name,
      availableLanguages,
    };

    const response = NextResponse.json(responseData);

    // **PERFORMANCE**: Add HTTP caching headers to reduce repeated requests
    response.headers.set(
      "Cache-Control",
      "public, max-age=300, s-maxage=300, stale-while-revalidate=3600"
    ); // 5 min fresh, 1 hour stale
    response.headers.set("Vary", "Accept-Encoding");
    response.headers.set(
      "ETag",
      `"book-lang-${book.id}-${book.updatedAt.getTime()}"`
    );

    return response;
  } catch (error) {
    console.error("Error fetching book languages:", error);
    const errorResponse = NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
    // **PERFORMANCE**: Don't cache server errors
    errorResponse.headers.set(
      "Cache-Control",
      "no-cache, no-store, must-revalidate"
    );
    return errorResponse;
  }
}
