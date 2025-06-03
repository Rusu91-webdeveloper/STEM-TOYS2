import React from "react";
import { notFound } from "next/navigation";
import { Metadata, ResolvingMetadata } from "next";
import { getProduct } from "@/lib/api/products";
import ProductDetailClient from "@/features/products/components/ProductDetailClient";
import { generateProductMetadata } from "@/lib/utils/seo";

type ProductPageProps = {
  params: {
    slug: string;
  };
};

// Define Category type to fix type errors
type Category = {
  name: string;
  [key: string]: any;
};

export async function generateMetadata(
  { params }: ProductPageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // Get product data
  try {
    // Ensure params is resolved if it's a promise
    const resolvedParams = params instanceof Promise ? await params : params;
    const slug = resolvedParams.slug;

    const product = await getProduct(slug);

    if (!product) {
      return {
        title: "Product Not Found",
        description: "The requested product could not be found",
      };
    }

    // Use our SEO utility to generate metadata
    return generateProductMetadata(product);
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Product | TechTots",
      description: "Explore our STEM toys and educational products",
    };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  try {
    // Ensure params is resolved if it's a promise
    const resolvedParams = params instanceof Promise ? await params : params;
    const slug = resolvedParams.slug;

    // Get product data
    const product = await getProduct(slug);

    if (!product) {
      return notFound();
    }

    // Pass product data to client component
    return <ProductDetailClient product={product} />;
  } catch (error) {
    console.error("Error fetching product:", error);
    return notFound();
  }
}
