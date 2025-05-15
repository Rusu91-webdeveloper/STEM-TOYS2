"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Product } from "@/types/product";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProductAddToCartButton } from "./ProductAddToCartButton";
import { StarIcon } from "lucide-react";

interface ProductCardProps {
  product: Product;
  className?: string;
  imageHeight?: number;
  layout?: "grid" | "list";
}

export function ProductCard({
  product,
  className,
  imageHeight = 280,
  layout = "grid",
}: ProductCardProps) {
  const isOnSale =
    product.compareAtPrice && product.compareAtPrice > product.price;

  // Format price to 2 decimal places and add currency symbol
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  // Render star rating
  const renderRating = () => {
    if (!product.rating) return null;

    return (
      <div className="flex items-center space-x-1">
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <StarIcon
              key={i}
              className={cn(
                "h-4 w-4",
                i < Math.floor(product.rating || 0)
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-300"
              )}
            />
          ))}
        </div>
        {product.reviewCount && (
          <span className="text-xs text-muted-foreground">
            ({product.reviewCount})
          </span>
        )}
      </div>
    );
  };

  // Prepare product data for ProductAddToCartButton
  const productData = {
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.images[0],
    variants: product.variants,
  };

  if (layout === "list") {
    return (
      <div className={cn("flex border rounded-lg overflow-hidden", className)}>
        <div className="relative w-1/3 max-w-[240px]">
          <Link href={`/products/${product.slug}`}>
            <div className="relative h-full w-full">
              <Image
                src={product.images[0] || "/placeholder-product.png"}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
            {isOnSale && (
              <Badge className="absolute top-2 left-2 bg-red-500">Sale</Badge>
            )}
            {product.stemCategory && (
              <Badge
                className="absolute top-2 right-2 capitalize"
                variant="outline">
                {product.stemCategory}
              </Badge>
            )}
          </Link>
        </div>
        <div className="flex flex-col flex-1 p-4 justify-between">
          <div className="space-y-2">
            <Link
              href={`/products/${product.slug}`}
              className="block">
              <h3 className="font-medium line-clamp-2 hover:underline">
                {product.name}
              </h3>
            </Link>
            {product.ageRange && (
              <p className="text-sm text-muted-foreground">
                Ages: {product.ageRange}
              </p>
            )}
            {renderRating()}
            <p className="text-sm line-clamp-3 text-muted-foreground">
              {product.description}
            </p>
          </div>
          <div className="flex items-end justify-between mt-4">
            <div className="flex items-baseline space-x-2">
              <span
                className={cn(
                  "font-medium text-lg",
                  isOnSale && "text-red-500"
                )}>
                {formatPrice(product.price)}
              </span>
              {isOnSale && product.compareAtPrice && (
                <span className="text-sm line-through text-muted-foreground">
                  {formatPrice(product.compareAtPrice)}
                </span>
              )}
            </div>
            <ProductAddToCartButton
              product={productData}
              showQuantity={false}
            />
          </div>
        </div>
      </div>
    );
  }

  // Default grid layout
  return (
    <div
      className={cn(
        "group border rounded-lg overflow-hidden h-full flex flex-col",
        className
      )}>
      <div
        className="relative overflow-hidden"
        style={{ height: imageHeight }}>
        <Link href={`/products/${product.slug}`}>
          <Image
            src={product.images[0] || "/placeholder-product.png"}
            alt={product.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {isOnSale && (
            <Badge className="absolute top-2 left-2 bg-red-500">Sale</Badge>
          )}
          {product.stemCategory && (
            <Badge
              className="absolute top-2 right-2 capitalize"
              variant="outline">
              {product.stemCategory}
            </Badge>
          )}
        </Link>
      </div>
      <div className="flex flex-col flex-1 p-4 space-y-2">
        <Link
          href={`/products/${product.slug}`}
          className="block flex-grow">
          <h3 className="font-medium line-clamp-2 group-hover:underline">
            {product.name}
          </h3>
        </Link>
        {product.ageRange && (
          <p className="text-sm text-muted-foreground">
            Ages: {product.ageRange}
          </p>
        )}
        {renderRating()}
        <div className="flex items-end justify-between mt-auto pt-2">
          <div className="flex items-baseline space-x-2">
            <span className={cn("font-medium", isOnSale && "text-red-500")}>
              {formatPrice(product.price)}
            </span>
            {isOnSale && product.compareAtPrice && (
              <span className="text-sm line-through text-muted-foreground">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>
          <ProductAddToCartButton
            product={productData}
            showQuantity={false}
            className="min-w-[90px]"
          />
        </div>
      </div>
    </div>
  );
}
