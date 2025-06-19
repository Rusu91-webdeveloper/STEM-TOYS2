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
        digitalFiles: {
          where: { isActive: true },
          select: {
            language: true,
            format: true,
          },
        },
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
            digitalFiles: {
              where: { isActive: true },
              select: {
                language: true,
                format: true,
              },
            },
          },
        });
      }
    }

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    // Get unique languages available for this book
    const availableLanguages = [
      ...new Set(book.digitalFiles.map((file) => file.language)),
    ].map((language) => ({
      code: language,
      name: language === "en" ? "English" : "Română",
      formats: book.digitalFiles
        .filter((file) => file.language === language)
        .map((file) => file.format),
    }));

    return NextResponse.json({
      bookId: book.id,
      bookName: book.name,
      availableLanguages,
    });
  } catch (error) {
    console.error("Error fetching book languages:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
