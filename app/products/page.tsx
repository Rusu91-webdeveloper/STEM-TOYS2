"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  ProductCard,
  ProductGrid,
  ProductFilters,
  type FilterGroup,
  type PriceRange,
  type FilterOption,
  ProductVariantProvider,
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
  images: [`https://picsum.photos/seed/stem-toy-${i + 1}/600/400`],
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
}));

// Mock categories
const mockCategories: FilterGroup = {
  id: "stemCategory",
  name: "STEM Category",
  options: [
    {
      id: "science",
      label: "Science",
      count: mockProducts.filter((p) => p.stemCategory === "science").length,
    },
    {
      id: "technology",
      label: "Technology",
      count: mockProducts.filter((p) => p.stemCategory === "technology").length,
    },
    {
      id: "engineering",
      label: "Engineering",
      count: mockProducts.filter((p) => p.stemCategory === "engineering")
        .length,
    },
    {
      id: "mathematics",
      label: "Mathematics",
      count: mockProducts.filter((p) => p.stemCategory === "mathematics")
        .length,
    },
  ],
};

// Mock filters
const mockFilters: FilterGroup[] = [
  {
    id: "ageRange",
    name: "Age Range",
    options: [
      { id: "6-10", label: "6-10 years", count: 5 },
      { id: "8-12", label: "8-12 years", count: 4 },
      { id: "10-14", label: "10-14 years", count: 3 },
    ],
  },
  {
    id: "difficulty",
    name: "Difficulty Level",
    options: [
      { id: "beginner", label: "Beginner", count: 4 },
      { id: "intermediate", label: "Intermediate", count: 5 },
      { id: "advanced", label: "Advanced", count: 3 },
    ],
  },
];

export default function ProductsPage() {
  const searchParams = useSearchParams();

  // State for filters
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<
    Record<string, string[]>
  >({});
  const [priceRangeFilter, setPriceRangeFilter] = useState<PriceRange>({
    min: 20,
    max: 100,
  });
  const [filteredProducts, setFilteredProducts] =
    useState<Product[]>(mockProducts);

  // Initialize price range based on products
  const prices = mockProducts.map((p) => p.price);
  const minPrice = Math.floor(Math.min(...prices));
  const maxPrice = Math.ceil(Math.max(...prices));

  // Effect to apply filters
  useEffect(() => {
    // Read filters from URL parameters
    const categoryParam = searchParams.get("category");
    if (categoryParam && !selectedCategories.includes(categoryParam)) {
      setSelectedCategories((prev) => [...prev, categoryParam]);
    }

    // Apply all filters
    let filtered = [...mockProducts];

    // Filter by category
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((product) =>
        selectedCategories.includes(product.stemCategory || "")
      );
    }

    // Filter by attributes
    Object.entries(selectedFilters).forEach(([filterId, values]) => {
      if (values.length > 0) {
        if (filterId === "ageRange") {
          filtered = filtered.filter((product) =>
            values.some((range) => {
              const [min, max] = range.split("-").map(Number);
              const [productMin, productMax] = product.ageRange
                ?.split("-")
                .map(Number) || [0, 0];
              return (
                (productMin <= min && productMax >= min) ||
                (productMin >= min && productMin <= max)
              );
            })
          );
        } else {
          // Generic attribute filtering (for mock purposes)
          filtered = filtered.filter((product) =>
            values.some((v) => product[filterId as keyof Product] === v)
          );
        }
      }
    });

    // Filter by price range
    filtered = filtered.filter(
      (product) =>
        product.price >= priceRangeFilter.min &&
        product.price <= priceRangeFilter.max
    );

    setFilteredProducts(filtered);
  }, [selectedCategories, selectedFilters, priceRangeFilter, searchParams]);

  // Handler for category filter changes
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  // Handler for other filter changes
  const handleFilterChange = (filterId: string, optionId: string) => {
    setSelectedFilters((prev) => {
      const currentValues = prev[filterId] || [];
      if (currentValues.includes(optionId)) {
        const newValues = currentValues.filter((id) => id !== optionId);
        return {
          ...prev,
          [filterId]: newValues,
        };
      } else {
        return {
          ...prev,
          [filterId]: [...currentValues, optionId],
        };
      }
    });
  };

  // Handler for price range changes
  const handlePriceChange = (range: PriceRange) => {
    setPriceRangeFilter(range);
  };

  // Handler to clear all filters
  const handleClearFilters = () => {
    setSelectedCategories([]);
    setSelectedFilters({});
    setPriceRangeFilter({ min: minPrice, max: maxPrice });
  };

  return (
    <ProductVariantProvider>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar with filters */}
          <div className="w-full md:w-64 shrink-0">
            <ProductFilters
              categories={mockCategories}
              filters={mockFilters}
              priceRange={{
                min: minPrice,
                max: maxPrice,
                current: priceRangeFilter,
              }}
              selectedCategories={selectedCategories}
              selectedFilters={selectedFilters}
              onCategoryChange={handleCategoryChange}
              onFilterChange={handleFilterChange}
              onPriceChange={handlePriceChange}
              onClearFilters={handleClearFilters}
              className="sticky top-24"
            />
          </div>

          {/* Main product grid */}
          <div className="flex-1">
            <div className="mb-4">
              <p className="text-muted-foreground">
                Showing {filteredProducts.length} of {mockProducts.length}{" "}
                products
              </p>
            </div>

            <ProductGrid
              products={filteredProducts}
              columns={{ sm: 2, md: 2, lg: 3, xl: 3 }}
            />

            {filteredProducts.length === 0 && (
              <div className="text-center py-16">
                <h3 className="text-lg font-medium mb-2">No products found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your filters or search criteria
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProductVariantProvider>
  );
}
