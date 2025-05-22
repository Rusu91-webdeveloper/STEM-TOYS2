"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "@/lib/i18n";
import Image from "next/image";
import Link from "next/link";
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
import {
  Lightbulb,
  Atom,
  Microscope,
  ShieldQuestion,
  Star,
  Sparkles,
  Rocket,
  Brain,
  LucideIcon,
} from "lucide-react";
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

interface CategoryIconInfo {
  icon: LucideIcon;
  bgColor: string;
  textColor: string;
}

// Category icons and styling for better visual representation
const categoryInfo: Record<string, CategoryIconInfo> = {
  science: {
    icon: Atom,
    bgColor: "bg-blue-500",
    textColor: "text-blue-500",
  },
  technology: {
    icon: Lightbulb,
    bgColor: "bg-green-500",
    textColor: "text-green-500",
  },
  engineering: {
    icon: Microscope,
    bgColor: "bg-orange-500",
    textColor: "text-orange-500",
  },
  mathematics: {
    icon: ShieldQuestion,
    bgColor: "bg-purple-500",
    textColor: "text-purple-500",
  },
};

// Benefits of STEM toys with icons
const stemBenefits = [
  {
    icon: Brain,
    title: "Cognitive Development",
    description: "Enhances problem-solving and critical thinking skills",
  },
  {
    icon: Sparkles,
    title: "Creativity & Innovation",
    description: "Encourages creative thinking and new ideas",
  },
  {
    icon: Rocket,
    title: "Future Ready",
    description: "Prepares children for careers in science and technology",
  },
  {
    icon: Star,
    title: "Fun Learning",
    description: "Makes education engaging and enjoyable",
  },
];

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

  // Get appropriate category info
  const activeCategoryInfo = activeCategory
    ? categoryInfo[activeCategory.id]
    : categoryInfo.science;

  // Get category image based on active category
  const categoryImagePath = activeCategory
    ? `/images/category_banner_${activeCategory.id}_01.png`
    : "/images/homepage_hero_banner_01.png";

  const IconComponent = activeCategoryInfo.icon;

  // Helper function to get translation key based on active category
  const getCategoryTitle = () => {
    if (!activeCategory) return t("discoverStemToys");

    switch (activeCategory.id) {
      case "science":
        return t("scienceToysTitle");
      case "technology":
        return t("technologyToysTitle");
      case "engineering":
        return t("engineeringToysTitle");
      case "mathematics":
        return t("mathematicsToysTitle");
      default:
        return t("discoverStemToys");
    }
  };

  // Helper function to get description based on active category
  const getCategoryDescription = () => {
    if (!activeCategory) return t("stemToysDescription");

    switch (activeCategory.id) {
      case "science":
        return t("scienceToysDescription");
      case "technology":
        return t("technologyToysDescription");
      case "engineering":
        return t("engineeringToysDescription");
      case "mathematics":
        return t("mathematicsToysDescription");
      default:
        return t("stemToysDescription");
    }
  };

  // Helper function to get learning section title based on active category
  const getLearningTitle = () => {
    if (!activeCategory) return "";

    switch (activeCategory.id) {
      case "science":
        return t("scienceLearning");
      case "technology":
        return t("technologyLearning");
      case "engineering":
        return t("engineeringLearning");
      case "mathematics":
        return t("mathematicsLearning");
      default:
        return "";
    }
  };

  // Helper function to get learning section description based on active category
  const getLearningDescription = () => {
    if (!activeCategory) return "";

    switch (activeCategory.id) {
      case "science":
        return t("scienceLearningDesc");
      case "technology":
        return t("technologyLearningDesc");
      case "engineering":
        return t("engineeringLearningDesc");
      case "mathematics":
        return t("mathematicsLearningDesc");
      default:
        return "";
    }
  };

  return (
    <ProductVariantProvider>
      {/* Hero section with dynamic background based on selected category */}
      <div className="relative">
        {/* Hero Image */}
        <div className="relative h-[25vh] min-h-[200px] max-h-[300px] w-full">
          <Image
            src={categoryImagePath}
            alt={
              activeCategory ? `${activeCategory.label} category` : "STEM Toys"
            }
            fill
            sizes="100vw"
            style={{ objectFit: "cover" }}
            priority
            className="brightness-75"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/70" />

          {/* Hero Content Overlay */}
          <div className="absolute inset-0 flex items-center">
            <div className="container mx-auto px-4 text-white">
              <div className="max-w-3xl">
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className={`${activeCategoryInfo.bgColor} p-2 rounded-full`}>
                    <IconComponent className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-lg font-bold bg-primary/80 text-white px-3 py-1 rounded-md">
                    {activeCategory ? activeCategory.label : t("allCategories")}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 drop-shadow-lg">
                  {getCategoryTitle()}
                </h1>
                <p className="text-sm sm:text-base max-w-2xl text-white/90 drop-shadow-md hidden sm:block">
                  {getCategoryDescription()}
                </p>

                {/* Category quick links */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {mockCategories.options.map((category) => {
                    const CategoryIcon =
                      categoryInfo[category.id as keyof typeof categoryInfo]
                        .icon;
                    return (
                      <Button
                        key={category.id}
                        variant={
                          selectedCategories.includes(category.id)
                            ? "secondary"
                            : "outline"
                        }
                        size="sm"
                        className={`flex items-center gap-1 rounded-full text-xs py-1 px-3 ${
                          selectedCategories.includes(category.id)
                            ? "bg-white text-primary border-white"
                            : "bg-black/40 text-white hover:bg-white/90 hover:text-primary backdrop-blur-sm border-white/30"
                        }`}
                        onClick={() => handleCategoryChange(category.id)}>
                        <CategoryIcon className="h-3 w-3 mr-1" />
                        {category.label}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bubble decorations - made smaller and less distracting */}
        <div className="absolute -bottom-4 left-0 w-16 h-16 rounded-full bg-blue-500/20 blur-xl"></div>
        <div className="absolute -bottom-6 left-1/4 w-20 h-20 rounded-full bg-green-500/20 blur-xl"></div>
        <div className="absolute -bottom-8 right-1/3 w-24 h-24 rounded-full bg-yellow-500/20 blur-xl"></div>
        <div className="absolute -bottom-5 right-0 w-16 h-16 rounded-full bg-purple-500/20 blur-xl"></div>
      </div>

      {/* STEM Benefits Section - Made more compact and only show when no category is selected */}
      {!activeCategory && (
        <div className="bg-white py-8">
          <div className="container mx-auto px-4">
            <h2 className="text-xl font-bold text-center mb-6">
              {t("whyStemEssential")}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stemBenefits.map((benefit, index) => {
                const BenefitIcon = benefit.icon;
                return (
                  <div
                    key={index}
                    className="bg-gray-50 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex flex-col items-center text-center">
                    <div className="p-2 rounded-full bg-primary/10 text-primary mb-2">
                      <BenefitIcon className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-sm mb-1">
                      {t(benefit.title.toLowerCase().replace(" & ", "") as any)}
                    </h3>
                    <p className="text-gray-600 text-xs">
                      {t(
                        `${benefit.title.toLowerCase().replace(" & ", "")}Desc` as any
                      )}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-6 relative z-10">
        {/* Filter and sorting bar - Added as a compact row */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-full bg-primary/10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
              </svg>
            </div>
            <span className="text-sm font-medium">{t("filterBy")}</span>

            {/* Quick filter chips - most frequently used filters */}
            <div className="hidden md:flex gap-2">
              {mockCategories.options.map((category) => {
                const CategoryIcon =
                  categoryInfo[category.id as keyof typeof categoryInfo].icon;
                return (
                  <Button
                    key={category.id}
                    variant={
                      selectedCategories.includes(category.id)
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    className="h-7 text-xs rounded-full"
                    onClick={() => handleCategoryChange(category.id)}>
                    <CategoryIcon className="h-3 w-3 mr-1" />
                    {category.label}
                  </Button>
                );
              })}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-xs text-muted-foreground">
              {t("showingProducts")
                .replace("{0}", filteredProducts.length.toString())
                .replace("{1}", mockProducts.length.toString())}
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="w-8 h-7 p-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
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
                className="w-8 h-7 p-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
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

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar with filters */}
          <div className="w-full md:w-64 shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sticky top-24">
              <h3 className="text-base font-bold mb-3 flex items-center gap-2">
                <div className="p-1.5 rounded-full bg-primary/10">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-primary">
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                  </svg>
                </div>
                {t("filterOptions")}
              </h3>
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
              />
            </div>
          </div>

          {/* Main product grid */}
          <div className="flex-1">
            {/* Educational categories banner for additional context - only show when filtering */}
            {activeCategory && filteredProducts.length > 0 && (
              <div
                className={`mb-4 p-3 rounded-xl bg-gradient-to-r 
                ${
                  activeCategory.id === "science"
                    ? "from-blue-50 to-blue-100 border-blue-200"
                    : activeCategory.id === "technology"
                      ? "from-green-50 to-green-100 border-green-200"
                      : activeCategory.id === "engineering"
                        ? "from-orange-50 to-orange-100 border-orange-200"
                        : "from-purple-50 to-purple-100 border-purple-200"
                } border shadow-sm`}>
                <div className="flex items-center gap-3">
                  <div
                    className={`p-3 rounded-full ${categoryInfo[activeCategory.id as keyof typeof categoryInfo].bgColor}`}>
                    {React.createElement(
                      categoryInfo[
                        activeCategory.id as keyof typeof categoryInfo
                      ].icon,
                      {
                        className: "h-5 w-5 text-white",
                      }
                    )}
                  </div>
                  <div>
                    <h3
                      className={`font-bold text-base ${categoryInfo[activeCategory.id as keyof typeof categoryInfo].textColor}`}>
                      {getLearningTitle()}
                    </h3>
                    <p className="text-gray-700 text-sm">
                      {getLearningDescription()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Products display */}
            <div className={viewMode === "list" ? "space-y-4" : ""}>
              {viewMode === "grid" ? (
                <div className="bg-gray-50/50 rounded-xl p-4">
                  <ProductGrid
                    products={filteredProducts}
                    columns={{ sm: 1, md: 2, lg: 3, xl: 3 }}
                  />
                </div>
              ) : (
                <div className="bg-gray-50/50 rounded-xl p-4 space-y-3">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex flex-col sm:flex-row gap-4 bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow relative group">
                      {/* Fun shape decoration - smaller size */}
                      <div className="absolute -left-2 -top-2 w-8 h-8 rounded-full bg-primary/10 transition-transform group-hover:scale-110 -z-0 hidden sm:block"></div>
                      <div className="absolute -right-2 -bottom-2 w-6 h-6 rounded-full bg-yellow-200/30 transition-transform group-hover:scale-110 -z-0 hidden sm:block"></div>

                      <div className="sm:w-1/3 relative h-40 z-10">
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
                      <div className="p-4 sm:w-2/3 z-10">
                        <div className="flex flex-wrap gap-2 mb-2">
                          <Badge
                            variant="outline"
                            className={`
                            ${
                              product.stemCategory === "science"
                                ? "bg-blue-100 text-blue-700 border-blue-200"
                                : product.stemCategory === "technology"
                                  ? "bg-green-100 text-green-700 border-green-200"
                                  : product.stemCategory === "engineering"
                                    ? "bg-orange-100 text-orange-700 border-orange-200"
                                    : "bg-purple-100 text-purple-700 border-purple-200"
                            }
                          `}>
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
                        <h3 className="text-base font-semibold mb-1">
                          {product.name}
                        </h3>
                        <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                          {product.description}
                        </p>
                        <div className="flex justify-between items-center">
                          <div className="flex items-baseline gap-2">
                            <span className="text-base font-bold">
                              ${product.price.toFixed(2)}
                            </span>
                            {product.compareAtPrice && (
                              <span className="text-xs text-gray-500 line-through">
                                ${product.compareAtPrice.toFixed(2)}
                              </span>
                            )}
                          </div>
                          <Link href={`/products/${product.slug}`}>
                            <Button
                              size="sm"
                              className="rounded-full px-3 text-xs py-1 h-7 transition-transform hover:scale-105">
                              {t("viewDetails")}
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="mx-auto w-12 h-12 mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
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
                <h3 className="text-base font-medium mb-2">
                  {t("noProductsFound")}
                </h3>
                <p className="text-xs text-muted-foreground mb-4">
                  {t("tryAdjustingFilters")}
                </p>
                <Button
                  onClick={handleClearFilters}
                  className="rounded-full px-4 text-sm py-1 h-8">
                  {t("clearAllFilters")}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProductVariantProvider>
  );
}
