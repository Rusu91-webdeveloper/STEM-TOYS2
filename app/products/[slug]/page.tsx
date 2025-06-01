"use client";

import React, { useState, useEffect } from "react";
import { notFound, useParams } from "next/navigation";
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
import { useTranslation } from "@/lib/i18n";
import { useCurrency } from "@/lib/currency";
import type { Product } from "@/types/product";

export default function ProductPage() {
  // Use the useParams hook instead of props.params
  const params = useParams();
  const slug = params?.slug as string;

  // Add translation and currency hooks
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>("");

  // Fetch product data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch real product data from API
        const response = await fetch(`/api/products/${slug}`);

        if (!response.ok) {
          if (response.status === 404) {
            setLoading(false);
            return notFound();
          }
          throw new Error(`Failed to fetch product: ${response.statusText}`);
        }

        const productData = await response.json();
        setProduct(productData);

        if (productData.images && productData.images.length > 0) {
          setSelectedImage(productData.images[0]);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching product:", error);
        setLoading(false);
      }
    };

    if (slug) {
      fetchData();
    }
  }, [slug]);

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
            {t("backToProducts")}
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
                  ({product.reviewCount || 0} {t("reviews")})
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
                    {discountPercentage}% {t("off")}
                  </Badge>
                </>
              )}
            </div>

            <p className="text-muted-foreground">
              {t(
                product.translationKey || "defaultProductDescription",
                product.description
              )}
            </p>

            <div className="space-y-4">
              <div>
                <span className="font-medium">{t("ageRange")}:</span>{" "}
                {product.ageRange}
              </div>
              <div>
                <span className="font-medium">{t("category")}:</span>{" "}
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
                  <div className="text-sm font-medium">{t("freeShipping")}</div>
                  <div className="text-xs text-muted-foreground">
                    {t("onOrdersOver")} {formatPrice(50)}
                  </div>
                </div>
                <div className="flex flex-col items-center text-center p-4">
                  <RotateCcw className="h-5 w-5 mb-2" />
                  <div className="text-sm font-medium">{t("returnPeriod")}</div>
                  <div className="text-xs text-muted-foreground">
                    {t("moneyBackGuarantee")}
                  </div>
                </div>
                <div className="flex flex-col items-center text-center p-4">
                  <ShieldCheck className="h-5 w-5 mb-2" />
                  <div className="text-sm font-medium">
                    {t("secureCheckout")}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t("protectedBySSL")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-4">{t("productDescription")}</h2>
          <Separator className="mb-6" />
          <div className="prose max-w-none">
            <p>
              {t(
                product.translationKey || "defaultProductDescription",
                product.description
              )}
            </p>
            <p>
              {t("stemToyDesigned")} {product.stemCategory}.{" "}
              {t("providesHandsOn")}
            </p>
            <h3 className="text-xl font-semibold mt-6">
              {t("featuresBenefits")}
            </h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>{t("developsCriticalThinking")}</li>
              <li>{t("encouragesCreativity")}</li>
              <li>{t("buildsConfidence")}</li>
              <li>
                {t("teachesFundamentalConcepts")} {product.stemCategory}{" "}
                {t("inEngagingWay")}
              </li>
              <li>{t("safeMaterials")}</li>
            </ul>
          </div>
        </div>
      </div>
    </ProductVariantProvider>
  );
}
