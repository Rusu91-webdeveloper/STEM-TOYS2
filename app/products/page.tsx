// Server Component
import React, { Suspense } from "react";
import { getProducts } from "@/lib/api/products";
import { ProductsPageSkeleton } from "@/components/skeletons/products-skeleton";
import ClientProductsPage from "@/features/products/components/ClientProductsPage";
import type { Product } from "@/types/product";

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

  // Transform the products to match the expected type
  const products = productsData.map((product) => {
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
