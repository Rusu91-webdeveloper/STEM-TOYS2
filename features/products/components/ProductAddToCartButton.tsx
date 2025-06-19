"use client";

import React, { useState } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { useShoppingCart } from "@/features/cart/hooks/useShoppingCart";
import type { CartItem } from "@/features/cart/context/CartContext";
import { useProductVariant } from "../context/ProductVariantContext";
import { ProductVariantSelector } from "./ProductVariantSelector";
import { BookLanguageSelector } from "./BookLanguageSelector";
import type { Variant } from "@/components/products/VariantSelector";
import { useTranslation } from "@/lib/i18n";

interface ProductAddToCartButtonProps {
  product: {
    id: string;
    name: string;
    price: number;
    image?: string;
    variants?: Variant[];
    slug?: string; // Add slug for language fetching
  };
  className?: string;
  showQuantity?: boolean;
  isBook?: boolean;
}

export function ProductAddToCartButton({
  product,
  className = "",
  showQuantity = false,
  isBook = false,
}: ProductAddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<
    string | undefined
  >();
  const { addItem } = useShoppingCart();
  const { selectedVariants, getSelectedVariant } = useProductVariant();
  const { t } = useTranslation();

  const hasVariants = product.variants && product.variants.length > 0;
  const selectedVariantId = hasVariants
    ? selectedVariants[product.id]
    : undefined;
  const selectedVariant = hasVariants
    ? getSelectedVariant(product.id, product.variants || [])
    : undefined;

  const isDisabled =
    isAdded ||
    (hasVariants && product.variants!.length > 1 && !selectedVariantId) ||
    (isBook && !selectedLanguage); // Disable if book and no language selected

  const handleAddToCart = () => {
    const item: Omit<CartItem, "id"> = {
      productId: product.id,
      variantId: selectedVariantId,
      name:
        product.name + (selectedVariant ? ` - ${selectedVariant.name}` : ""),
      price: selectedVariant?.price ?? product.price,
      quantity,
      image: product.image,
      isBook,
      selectedLanguage: isBook ? selectedLanguage : undefined,
    };

    addItem(item, quantity);

    // Show success state briefly
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  const handleLanguageSelect = (language: string) => {
    setSelectedLanguage(language);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Show language selector for books */}
      {isBook && product.slug && (
        <BookLanguageSelector
          productSlug={product.slug}
          selectedLanguage={selectedLanguage}
          onLanguageSelect={handleLanguageSelect}
        />
      )}

      {/* Show variant selector if product has multiple variants */}
      {hasVariants && product.variants!.length > 1 && (
        <ProductVariantSelector
          productId={product.id}
          variants={product.variants!}
        />
      )}

      <div className={`flex ${showQuantity ? "items-center space-x-4" : ""}`}>
        {/* Quantity selector */}
        {showQuantity && (
          <div className="flex items-center border rounded-md">
            <button
              onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
              className="p-2 hover:bg-muted"
              aria-label="Decrease quantity"
              disabled={quantity <= 1}>
              -
            </button>
            <span className="px-4 py-2">{quantity}</span>
            <button
              onClick={() => setQuantity((prev) => prev + 1)}
              className="p-2 hover:bg-muted"
              aria-label="Increase quantity">
              +
            </button>
          </div>
        )}

        {/* Add to cart button */}
        <button
          onClick={handleAddToCart}
          disabled={isDisabled}
          className={`flex items-center justify-center gap-2 rounded-md px-5 py-2.5 font-medium transition-colors ${
            isAdded
              ? "bg-green-600 text-white hover:bg-green-700"
              : isDisabled
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
          } ${showQuantity ? "" : "w-full"}`}>
          {isAdded ? (
            <>
              <Check className="h-5 w-5" />
              {t("addedToCart", "Added to Cart")}
            </>
          ) : (
            <>
              <ShoppingCart className="h-5 w-5" />
              {hasVariants && !selectedVariantId
                ? t("selectOptions", "Select Options")
                : isBook && !selectedLanguage
                  ? t("selectLanguage", "Select Language")
                  : t("addToCart", "Add to Cart")}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
