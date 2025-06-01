import React from "react";
import { notFound } from "next/navigation";
import { Metadata, ResolvingMetadata } from "next";
import { getProduct } from "@/lib/api/products";
import ProductDetailClient from "@/features/products/components/ProductDetailClient";

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

    // Get previous image for og:image fallback
    const previousImages = (await parent).openGraph?.images || [];

    // Get category name safely
    const categoryName =
      product.stemCategory ||
      (typeof product.category === "object" && product.category
        ? (product.category as Category).name || "STEM Toy"
        : typeof product.category === "string"
          ? product.category
          : "STEM Toy");

    // Define age range for better SEO targeting
    const ageRange =
      product.ageRange ||
      (product.attributes?.age ? product.attributes.age : "8-12");

    // Define unique keywords for this product in both Romanian and English
    const keywords = [
      // Romanian keywords
      `${product.name} jucărie educativă`,
      `${categoryName} pentru copii`,
      `jucării STEM ${ageRange} ani`,
      `jucării educaționale ${categoryName.toLowerCase()}`,
      `jocuri educative România`,
      `${categoryName} educativ`,
      `cadou educațional copii`,
      `jucării știință tehnologie`,
      // English keywords
      product.name,
      `${categoryName} toy`,
      `STEM toys ${ageRange} years`,
      `educational ${categoryName.toLowerCase()} toys`,
      `learning toys Romania`,
      `${categoryName.toLowerCase()} for kids`,
      `educational gift`,
      `STEM education`,
    ];

    // Add price and currency formatting for display
    const price = new Intl.NumberFormat("ro-RO", {
      style: "currency",
      currency: "RON",
      minimumFractionDigits: 0,
    }).format(product.price);

    // Create dynamic translations for this product
    const translations = {
      ro: {
        title: `${product.name} | TechTots - Jucării STEM`,
        description:
          product.description.length > 160
            ? `${product.description.substring(0, 157)}...`
            : product.description,
      },
      en: {
        title: `${product.name} | TechTots - STEM Toys`,
        description:
          product.description.length > 160
            ? `${product.description.substring(0, 157)}...`
            : product.description,
      },
    };

    // Add additional structured data for the product
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      description: product.description,
      image: product.images[0],
      sku: product.id,
      mpn: product.id,
      brand: {
        "@type": "Brand",
        name: "TechTots",
      },
      offers: {
        "@type": "Offer",
        url: `https://techtots.com/products/${slug}`,
        priceCurrency: "RON",
        price: product.price,
        priceValidUntil: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
        availability: product.isActive
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
        seller: {
          "@type": "Organization",
          name: "TechTots",
        },
      },
      audience: {
        "@type": "PeopleAudience",
        suggestedMinAge: parseInt(ageRange.split("-")[0]),
        suggestedMaxAge: parseInt(ageRange.split("-")[1]),
      },
      category: categoryName,
      // Add review information if available
      aggregateRating: product.rating
        ? {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.reviewCount || 0,
            bestRating: 5,
            worstRating: 1,
          }
        : undefined,
    };

    // Add language-specific metadata using the `other` field
    const otherMetadata: Record<string, string> = {
      structuredData: JSON.stringify(structuredData),
      "product:price:amount": product.price.toString(),
      "product:price:currency": "RON",
      "product:availability": product.isActive ? "in stock" : "out of stock",
      "product:category": categoryName,
      "product:condition": "new",
      "product:age_group": ageRange,
      // Add translated titles and descriptions for search engines
      "title-ro": translations.ro.title,
      "description-ro": translations.ro.description,
      "title-en": translations.en.title,
      "description-en": translations.en.description,
    };

    return {
      title: `${product.name} | TechTots - STEM Toys`,
      description:
        product.description.length > 160
          ? `${product.description.substring(0, 157)}...`
          : product.description,
      keywords: keywords,
      openGraph: {
        title: `${product.name} | TechTots - Jucării STEM Educaționale`,
        description: product.description,
        locale: "ro_RO",
        alternateLocale: ["en_US"],
        images:
          product.images && product.images.length > 0
            ? [
                {
                  url: product.images[0],
                  width: 800,
                  height: 600,
                  alt: product.name,
                },
              ]
            : previousImages,
        type: "website",
        siteName: "TechTots",
        url: `https://techtots.com/products/${slug}`,
      },
      twitter: {
        card: "summary_large_image",
        title: product.name,
        description: product.description.substring(0, 190),
        images:
          product.images && product.images.length > 0
            ? [product.images[0]]
            : [],
      },
      alternates: {
        canonical: `https://techtots.com/products/${slug}`,
        languages: {
          ro: `/ro/products/${slug}`,
          en: `/en/products/${slug}`,
        },
      },
      other: otherMetadata,
      robots: {
        index: true,
        follow: true,
        nocache: false,
        googleBot: {
          index: true,
          follow: true,
          "max-image-preview": "large",
          "max-snippet": -1,
          "max-video-preview": -1,
        },
      },
      category: categoryName,
      verification: {
        google: "your-google-verification-code",
        yandex: "your-yandex-verification-code",
      },
    };
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
