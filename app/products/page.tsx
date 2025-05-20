"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "@/lib/i18n";
import Image from "next/image";
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
import { Lightbulb, Atom, Microscope, ShieldQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Metadata is now exported from a separate file since this is a client component
// and metadata needs to be static and server-rendered

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
  attributes: {
    difficulty:
      i % 3 === 0 ? "beginner" : i % 2 === 0 ? "intermediate" : "advanced",
  },
}));

// Category icons for better visual representation
const categoryIcons = {
  science: <Atom className="h-5 w-5" />,
  technology: <Lightbulb className="h-5 w-5" />,
  engineering: <Microscope className="h-5 w-5" />,
  mathematics: <ShieldQuestion className="h-5 w-5" />,
};

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
  const { t } = useTranslation();

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
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

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
          filtered = filtered.filter((product) => {
            if (!product.ageRange) return false;

            const [productMin, productMax] = product.ageRange
              .split("-")
              .map(Number);

            return values.some((range) => {
              const [filterMin, filterMax] = range.split("-").map(Number);

              // Check if product age range overlaps with filter age range
              return (
                (productMin <= filterMax && productMax >= filterMin) ||
                (filterMin <= productMax && filterMax >= productMin)
              );
            });
          });
        } else if (filterId === "difficulty") {
          filtered = filtered.filter((product) => {
            // Check product attributes for difficulty level
            return values.some(
              (value) => product.attributes?.difficulty === value
            );
          });
        } else {
          // Generic attribute filtering (for other filters)
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

  // Get the active category for the header
  const activeCategory =
    selectedCategories.length === 1
      ? mockCategories.options.find((c) => c.id === selectedCategories[0])
      : null;

  return (
    <ProductVariantProvider>
      {/* Hero section with dynamic background based on selected category */}
      <div
        className={`w-full bg-gradient-to-r ${
          activeCategory?.id === "science"
            ? "from-blue-100 to-purple-100"
            : activeCategory?.id === "technology"
              ? "from-green-100 to-teal-100"
              : activeCategory?.id === "engineering"
                ? "from-orange-100 to-yellow-100"
                : activeCategory?.id === "mathematics"
                  ? "from-red-100 to-pink-100"
                  : "from-indigo-100 to-pink-100"
        } py-8 mb-8`}>
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-lg bg-white/30 backdrop-blur-sm p-6 shadow-lg border border-white/50">
            <div className="absolute inset-0 opacity-10 pattern-dots-lg text-primary pointer-events-none"></div>
            <div className="relative z-10">
              <h1 className="text-3xl sm:text-4xl font-bold mb-2 text-gray-900">
                {activeCategory
                  ? `${activeCategory.label} Toys & Kits`
                  : "STEM Educational Toys"}
              </h1>
              <p className="text-lg text-gray-700 max-w-3xl">
                {activeCategory?.id === "science"
                  ? "Discover amazing science toys that make learning fun through experiments and exploration."
                  : activeCategory?.id === "technology"
                    ? "Build, code, and create with our technology toys designed for young innovators."
                    : activeCategory?.id === "engineering"
                      ? "Design, construct, and problem-solve with engineering toys that inspire creativity."
                      : activeCategory?.id === "mathematics"
                        ? "Develop strong math skills with puzzles and games that make numbers fun."
                        : "Explore our collection of educational toys designed to spark curiosity and develop STEM skills."}
              </p>

              {/* Category quick links */}
              <div className="flex flex-wrap gap-2 mt-4">
                {mockCategories.options.map((category) => (
                  <Button
                    key={category.id}
                    variant={
                      selectedCategories.includes(category.id)
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    className="flex items-center gap-2 rounded-full"
                    onClick={() => handleCategoryChange(category.id)}>
                    {categoryIcons[category.id as keyof typeof categoryIcons]}
                    {category.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-16">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar with filters */}
          <div className="w-full md:w-64 shrink-0">
            <div className="bg-white rounded-lg shadow-sm border p-5">
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
          </div>

          {/* Main product grid */}
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground">
                  {t("showingProducts")
                    .replace("{0}", filteredProducts.length.toString())
                    .replace("{1}", mockProducts.length.toString())}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="w-10 p-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round">
                      <rect
                        width="7"
                        height="7"
                        x="3"
                        y="3"
                        rx="1"
                      />
                      <rect
                        width="7"
                        height="7"
                        x="14"
                        y="3"
                        rx="1"
                      />
                      <rect
                        width="7"
                        height="7"
                        x="14"
                        y="14"
                        rx="1"
                      />
                      <rect
                        width="7"
                        height="7"
                        x="3"
                        y="14"
                        rx="1"
                      />
                    </svg>
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="w-10 p-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round">
                      <line
                        x1="3"
                        x2="21"
                        y1="6"
                        y2="6"
                      />
                      <line
                        x1="3"
                        x2="21"
                        y1="12"
                        y2="12"
                      />
                      <line
                        x1="3"
                        x2="21"
                        y1="18"
                        y2="18"
                      />
                    </svg>
                  </Button>
                </div>
              </div>
            </div>

            {/* Educational categories banner for additional context */}
            {!activeCategory && (
              <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                    <Microscope className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-medium text-blue-900">
                      Educational Value
                    </h3>
                    <p className="text-sm text-blue-700">
                      Our toys are designed by educators to develop key STEM
                      skills
                    </p>
                  </div>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg p-4 border border-green-100 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-3 bg-green-100 rounded-full text-green-600">
                    <Lightbulb className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-medium text-green-900">
                      Learning Through Play
                    </h3>
                    <p className="text-sm text-green-700">
                      Kids learn best when they're having fun and exploring
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Products display */}
            <div className={viewMode === "list" ? "space-y-4" : ""}>
              {viewMode === "grid" ? (
                <ProductGrid
                  products={filteredProducts}
                  columns={{ sm: 2, md: 2, lg: 3, xl: 3 }}
                />
              ) : (
                filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex flex-col sm:flex-row gap-4 bg-white rounded-lg overflow-hidden border hover:shadow-md transition-shadow">
                    <div className="sm:w-1/3 relative h-48">
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        style={{ objectFit: "cover" }}
                        className="transition-transform hover:scale-105 duration-300"
                      />
                      {product.compareAtPrice && (
                        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
                          Sale
                        </div>
                      )}
                    </div>
                    <div className="p-4 sm:w-2/3">
                      <div className="flex flex-wrap gap-2 mb-2">
                        <Badge
                          variant="outline"
                          className="bg-primary/10 text-primary border-primary/20">
                          {product.stemCategory}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="bg-gray-100 text-gray-700 border-gray-200">
                          {product.ageRange} years
                        </Badge>
                        <Badge
                          variant="outline"
                          className="bg-gray-100 text-gray-700 border-gray-200">
                          {product.attributes?.difficulty}
                        </Badge>
                      </div>
                      <h3 className="text-lg font-semibold mb-1">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {product.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-bold">
                            ${product.price.toFixed(2)}
                          </span>
                          {product.compareAtPrice && (
                            <span className="text-sm text-gray-500 line-through">
                              ${product.compareAtPrice.toFixed(2)}
                            </span>
                          )}
                        </div>
                        <Button size="sm">View Details</Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-16 bg-white rounded-lg shadow-sm border">
                <div className="mx-auto w-16 h-16 mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-gray-400">
                    <circle
                      cx="11"
                      cy="11"
                      r="8"
                    />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-2">No products found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your filters or search criteria
                </p>
                <Button onClick={handleClearFilters}>Clear All Filters</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProductVariantProvider>
  );
}
