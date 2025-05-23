"use client";

import React, { useState, useEffect } from "react";
import { notFound } from "next/navigation";
import { ArrowLeft, Truck, ShieldCheck, RotateCcw } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  ProductVariantProvider,
  ProductAddToCartButton,
} from "@/features/products";
import type { Product } from "@/types/product";

// Mock data for demonstration
const mockProducts: Product[] = Array.from({ length: 12 }).map((_, i) => ({
  id: `product-${i + 1}`,
  name: `STEM Educational ${
    i % 4 === 0
      ? "Robot"
      : i % 3 === 0
        ? "Chemistry Set"
        : i % 2 === 0
          ? "Math Puzzle"
          : "Coding Kit"
  } ${i + 1}`,
  slug: `stem-toy-${i + 1}`,
  description: `This educational toy helps children learn about ${
    i % 4 === 0
      ? "robotics and programming"
      : i % 3 === 0
        ? "chemistry and scientific experiments"
        : i % 2 === 0
          ? "mathematical concepts"
          : "the basics of coding"
  }. Great for ages ${6 + (i % 5)}-${12 + (i % 5)}.`,
  price: 29.99 + i * 5,
  compareAtPrice: i % 3 === 0 ? (29.99 + i * 5) * 1.2 : undefined,
  images: Array.from(
    { length: Math.min(1 + (i % 4), 5) },
    (_, imgIndex) =>
      `https://picsum.photos/seed/stem-toy-${i + 1}-${imgIndex}/600/400`
  ),
  stemCategory:
    i % 4 === 0
      ? "technology"
      : i % 3 === 0
        ? "science"
        : i % 2 === 0
          ? "mathematics"
          : "engineering",
  ageRange: `${6 + (i % 5)}-${12 + (i % 5)}`,
  rating: 3 + (i % 3),
  reviewCount: 10 + i,
  variants:
    i % 2 === 0
      ? [
          {
            id: `variant-${i}-1`,
            name: "Standard Edition",
            price: 29.99 + i * 5,
            attributes: { edition: "Standard" },
            isAvailable: true,
          },
          {
            id: `variant-${i}-2`,
            name: "Deluxe Edition",
            price: (29.99 + i * 5) * 1.5,
            attributes: { edition: "Deluxe" },
            isAvailable: true,
          },
        ]
      : undefined,
}));

// In a real app, this would get the product from an API or database
const getProductBySlug = (slug: string): Product | undefined => {
  return mockProducts.find((product) => product.slug === slug);
};

export default function ProductPage({ params }: { params: { slug: string } }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>("");

  // Fetch product data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Convert slug to string to ensure it's not a Promise
        const slugString = String(params.slug);

        setLoading(true);
        // Simulate API call with timeout
        setTimeout(() => {
          // Find product by slug
          const foundProduct = getProductBySlug(slugString);

          if (!foundProduct) {
            setLoading(false);
            return;
          }

          setProduct(foundProduct);
          if (foundProduct.images && foundProduct.images.length > 0) {
            setSelectedImage(foundProduct.images[0]);
          }
          setLoading(false);
        }, 300);
      } catch (error) {
        console.error("Error fetching product:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [params.slug]);

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 animate-pulse">
        <div className="h-6 w-40 bg-muted rounded mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-square bg-muted rounded-lg"></div>
          <div className="space-y-4">
            <div className="h-8 w-3/4 bg-muted rounded"></div>
            <div className="h-4 w-1/4 bg-muted rounded"></div>
            <div className="h-4 w-full bg-muted rounded mt-6"></div>
            <div className="h-4 w-full bg-muted rounded"></div>
            <div className="h-4 w-3/4 bg-muted rounded"></div>
            <div className="h-10 w-1/2 bg-muted rounded mt-6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return notFound();
  }

  // Format price with currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  // Determine if product is on sale
  const isOnSale =
    product.compareAtPrice && product.compareAtPrice > product.price;

  // Calculate discount percentage for sale items
  const discountPercentage = isOnSale
    ? Math.round(
        ((product.compareAtPrice! - product.price) / product.compareAtPrice!) *
          100
      )
    : 0;

  return (
    <ProductVariantProvider>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/products"
            className="flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Products
          </Link>
        </div>

        {/* Product Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-lg border">
              {selectedImage && (
                <Image
                  src={selectedImage}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                  className="object-cover"
                />
              )}
            </div>
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    className={`relative aspect-square overflow-hidden rounded border ${
                      selectedImage === image
                        ? "ring-2 ring-primary"
                        : "hover:ring-1 hover:ring-primary/50"
                    }`}
                    onClick={() => setSelectedImage(image)}>
                    <Image
                      src={image}
                      alt={`${product.name} - view ${index + 1}`}
                      fill
                      sizes="20vw"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">{product.name}</h1>
              <div className="flex items-center mt-2">
                <div className="flex items-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={`inline-block ${
                        i < (product.rating || 0)
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}>
                      ★
                    </span>
                  ))}
                </div>
                <span className="ml-2 text-sm text-muted-foreground">
                  ({product.reviewCount || 0} reviews)
                </span>
              </div>
            </div>

            <div className="flex items-center">
              <div className="text-2xl font-bold">
                {formatPrice(product.price)}
              </div>
              {isOnSale && (
                <>
                  <div className="ml-2 text-lg text-muted-foreground line-through">
                    {formatPrice(product.compareAtPrice!)}
                  </div>
                  <Badge className="ml-2 bg-red-500">
                    {discountPercentage}% OFF
                  </Badge>
                </>
              )}
            </div>

            <p className="text-muted-foreground">{product.description}</p>

            <div className="space-y-4">
              <div>
                <span className="font-medium">Age Range:</span>{" "}
                {product.ageRange}
              </div>
              <div>
                <span className="font-medium">Category:</span>{" "}
                <span className="capitalize">{product.stemCategory}</span>
              </div>
            </div>

            {/* Add to Cart Button */}
            <div className="pt-4">
              <ProductAddToCartButton product={product} />
            </div>

            {/* Shipping Info */}
            <div className="space-y-4 pt-6">
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                <div className="flex flex-col items-center text-center p-4">
                  <Truck className="h-5 w-5 mb-2" />
                  <div className="text-sm font-medium">Free Shipping</div>
                  <div className="text-xs text-muted-foreground">
                    On orders over $50
                  </div>
                </div>
                <div className="flex flex-col items-center text-center p-4">
                  <RotateCcw className="h-5 w-5 mb-2" />
                  <div className="text-sm font-medium">30-Day Returns</div>
                  <div className="text-xs text-muted-foreground">
                    Money back guarantee
                  </div>
                </div>
                <div className="flex flex-col items-center text-center p-4">
                  <ShieldCheck className="h-5 w-5 mb-2" />
                  <div className="text-sm font-medium">Secure Checkout</div>
                  <div className="text-xs text-muted-foreground">
                    Protected by SSL
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-4">Product Description</h2>
          <Separator className="mb-6" />
          <div className="prose max-w-none">
            <p>{product.description}</p>
            <p>
              This STEM toy is designed to inspire young minds and introduce
              children to the wonderful world of {product.stemCategory}. It
              provides hands-on learning experiences that are both educational
              and fun.
            </p>
            <h3 className="text-xl font-semibold mt-6">Features & Benefits</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Develops critical thinking and problem-solving skills</li>
              <li>Encourages creativity and innovation</li>
              <li>Builds confidence through accomplishment</li>
              <li>
                Teaches fundamental concepts in {product.stemCategory} in an
                engaging way
              </li>
              <li>Safe materials suitable for children</li>
            </ul>
          </div>
        </div>
      </div>
    </ProductVariantProvider>
  );
}
