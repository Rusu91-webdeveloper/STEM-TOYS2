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

  console.log("Environment:", process.env.NODE_ENV);
  console.log("API URL:", process.env.NEXT_PUBLIC_API_URL || "Not set");

  // Debug database connection
  try {
    console.log("Fetching products from API...");

    // Fetch products server-side for initial render
    const productsData = await getProducts({
      category:
        typeof params.category === "string" ? params.category : undefined,
    });

    console.log(
      `Found ${productsData.length} products from API with category filter:`,
      params.category
    );

    // Log the actual data structure for debugging
    if (productsData.length === 0) {
      console.log(
        "No products returned from API. Raw response:",
        JSON.stringify(productsData)
      );
    } else {
      console.log("First product sample:", JSON.stringify(productsData[0]));
    }

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

      // Extract stemCategory from attributes if it exists
      let stemCategory = product.stemCategory;
      if (
        !stemCategory &&
        product.attributes &&
        typeof product.attributes === "object"
      ) {
        const attrs = product.attributes as Record<string, any>;
        stemCategory = attrs.stemCategory || null;
      }

      // Debug the product's stemCategory and category information
      console.log(`Product ${product.name} mapping:`, {
        categoryId: product.categoryId,
        categoryName: categoryData?.name,
        categorySlug: categoryData?.slug,
        stemCategory: stemCategory,
      });

      return {
        ...product,
        category: categoryData,
        stemCategory: stemCategory,
      } as ProductData;
    });

    console.log(
      `Total products after combining with books: ${products.length}`
    );

    return (
      <Suspense fallback={<ProductsPageSkeleton />}>
        <ClientProductsPage
          initialProducts={products}
          searchParams={params}
        />
      </Suspense>
    );
  } catch (error) {
    console.error("Error in ProductsPage component:", error);
    return (
      <div className="container mx-auto py-12">
        <h1 className="text-2xl font-bold mb-4">Error Loading Products</h1>
        <p>There was an error loading the products. Please try again later.</p>
        <pre className="bg-gray-100 p-4 mt-4 rounded overflow-auto max-h-96">
          {JSON.stringify(error, null, 2)}
        </pre>
      </div>
    );
  }
}
