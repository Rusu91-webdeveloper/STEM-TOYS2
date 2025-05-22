"use client";

import React, { useState } from "react";
import { Grid2X2, List } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/product";
import { ProductCard } from "./ProductCard";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "@/lib/i18n";

interface ProductGridProps {
  products: Product[];
  className?: string;
  defaultLayout?: "grid" | "list";
  defaultSort?: string;
  showLayoutToggle?: boolean;
  showSortOptions?: boolean;
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

export function ProductGrid({
  products,
  className,
  defaultLayout = "grid",
  defaultSort = "featured",
  showLayoutToggle = true,
  showSortOptions = true,
  columns = {
    sm: 2,
    md: 3,
    lg: 3,
    xl: 4,
  },
}: ProductGridProps) {
  const [layout, setLayout] = useState<"grid" | "list">(defaultLayout);
  const [sortOption, setSortOption] = useState<string>(defaultSort);
  const { t } = useTranslation();

  const sortProducts = (products: Product[], option: string) => {
    const sortedProducts = [...products];

    switch (option) {
      case "price-low":
        return sortedProducts.sort((a, b) => a.price - b.price);
      case "price-high":
        return sortedProducts.sort((a, b) => b.price - a.price);
      case "newest":
        return sortedProducts.sort(
          (a, b) =>
            new Date(b.createdAt || "").getTime() -
            new Date(a.createdAt || "").getTime()
        );
      case "rating":
        return sortedProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case "featured":
      default:
        return sortedProducts;
    }
  };

  const sortedProducts = sortProducts(products, sortOption);

  // Generate grid template columns classes based on breakpoints
  const gridColsClass = cn(
    `grid-cols-1`,
    columns.sm && `sm:grid-cols-${columns.sm}`,
    columns.md && `md:grid-cols-${columns.md}`,
    columns.lg && `lg:grid-cols-${columns.lg}`,
    columns.xl && `xl:grid-cols-${columns.xl}`
  );

  return (
    <div className={cn("space-y-6", className)}>
      {(showLayoutToggle || showSortOptions) && (
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
          {showSortOptions && (
            <div className="w-full sm:w-48">
              <Select
                value={sortOption}
                onValueChange={setSortOption}>
                <SelectTrigger>
                  <SelectValue placeholder={t("sortBy")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">{t("featured")}</SelectItem>
                  <SelectItem value="price-low">
                    {t("priceLowToHigh")}
                  </SelectItem>
                  <SelectItem value="price-high">
                    {t("priceHighToLow")}
                  </SelectItem>
                  <SelectItem value="newest">{t("newest")}</SelectItem>
                  <SelectItem value="rating">{t("topRated")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {showLayoutToggle && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground mr-2">
                {t("view")}:
              </span>
              <Button
                variant={layout === "grid" ? "default" : "outline"}
                size="sm"
                className="px-2"
                onClick={() => setLayout("grid")}
                aria-label={t("gridView")}>
                <Grid2X2 className="h-4 w-4" />
              </Button>
              <Button
                variant={layout === "list" ? "default" : "outline"}
                size="sm"
                className="px-2"
                onClick={() => setLayout("list")}
                aria-label={t("listView")}>
                <List className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      {sortedProducts.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {t("noProductsFound")}
        </div>
      ) : layout === "grid" ? (
        <div className={cn("grid gap-6", gridColsClass)}>
          {sortedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              layout="grid"
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col space-y-6">
          {sortedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              layout="list"
            />
          ))}
        </div>
      )}
    </div>
  );
}
