// Server Component
import React, { Suspense } from "react";
import { getProducts } from "@/lib/api/products";
import { getBooks } from "@/lib/api/books";
import { ProductsPageSkeleton } from "@/components/skeletons/products-skeleton";
import ClientProductsPage from "@/features/products/components/ClientProductsPage";
import type { Product } from "@/types/product";
import type { Book } from "@/types/book";

interface CategoryData {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

// Product data interface to match what the client component expects
interface ProductData extends Omit<Product, "category"> {
  category?: CategoryData;
  stemCategory?: string;
}

// Metadata is exported from a separate file
export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // Use await for searchParams to avoid the Next.js error
  const params = await searchParams;

  // Fetch products server-side for initial render
  const productsData = await getProducts({
    category: typeof params.category === "string" ? params.category : undefined,
  });

  // Fetch books as well
  let booksData: Book[] = [];
  try {
    booksData = await getBooks();
    console.log(`Found ${booksData.length} books`);
  } catch (error) {
    console.error("Error fetching books:", error);
  }

  // Convert books to product format
  const booksAsProducts = booksData.map((book) => {
    return {
      id: book.id,
      name: book.name,
      slug: book.slug,
      description: book.description,
      price: book.price,
      compareAtPrice: undefined, // Use undefined instead of null to match type
      images: book.coverImage ? [book.coverImage] : [],
      category: {
        id: "educational-books",
        name: "Educational Books",
        slug: "educational-books",
      },
      tags: ["book", "educational"],
      attributes: {
        author: book.author,
        languages: book.languages.map((lang) => lang.name),
      },
      isActive: book.isActive,
      createdAt: book.createdAt,
      updatedAt: book.updatedAt,
      stockQuantity: 10, // Default stock for books
      featured: true, // Feature all books
    } as unknown as ProductData; // Cast to unknown first to avoid type issues
  });

  // Transform the products to match the expected type
  const products = [...productsData, ...booksAsProducts].map((product) => {
    // Handle the category property conversion
    let categoryData: CategoryData | undefined = undefined;

    if (product.category) {
      if (typeof product.category === "string") {
        categoryData = {
          id: product.category,
          name: product.category,
          slug: product.category,
        };
      } else {
        categoryData = product.category as unknown as CategoryData;
      }
    }

    return {
      ...product,
      category: categoryData,
    } as ProductData;
  });

  return (
    <Suspense fallback={<ProductsPageSkeleton />}>
      <ClientProductsPage
        initialProducts={products}
        searchParams={params}
      />
    </Suspense>
  );
}
