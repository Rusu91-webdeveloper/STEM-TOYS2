"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n";
import Image from "next/image";
import Link from "next/link";
import {
  ProductCard,
  ProductGrid,
  ProductFilters,
  ProductVariantProvider,
  type FilterGroup,
  type PriceRange,
  type FilterOption,
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

interface CategoryIconInfo {
  icon: LucideIcon;
  bgColor: string;
  textColor: string;
  letter: string;
}

// Category icons and styling for better visual representation
const categoryInfo: Record<string, CategoryIconInfo> = {
  science: {
    icon: Atom,
    bgColor: "bg-blue-500",
    textColor: "text-blue-500",
    letter: "S",
  },
  technology: {
    icon: Lightbulb,
    bgColor: "bg-green-500",
    textColor: "text-green-500",
    letter: "T",
  },
  engineering: {
    icon: Microscope,
    bgColor: "bg-orange-500",
    textColor: "text-orange-500",
    letter: "E",
  },
  mathematics: {
    icon: ShieldQuestion,
    bgColor: "bg-purple-500",
    textColor: "text-purple-500",
    letter: "M",
  },
  "educational-books": {
    icon: Brain,
    bgColor: "bg-red-500",
    textColor: "text-red-500",
    letter: "B",
  },
};

// Benefits of STEM toys with icons
const stemBenefits = [
  {
    icon: Brain,
    titleKey: "cognitiveDevelopment",
    descKey: "cognitiveDevelopmentDesc",
  },
  {
    icon: Sparkles,
    titleKey: "creativityInnovation",
    descKey: "creativityInnovationDesc",
  },
  {
    icon: Rocket,
    titleKey: "futureReady",
    descKey: "futureReadyDesc",
  },
  {
    icon: Star,
    titleKey: "funLearning",
    descKey: "funLearningDesc",
  },
];

// Interface for the category object returned by the API
interface CategoryData {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

// Actual product type as returned by the API
interface ProductData extends Omit<Product, "category"> {
  category?: CategoryData;
  stemCategory?: string;
}

interface ClientProductsPageProps {
  initialProducts: ProductData[];
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function ClientProductsPage({
  initialProducts,
  searchParams,
}: ClientProductsPageProps) {
  const router = useRouter();
  const urlSearchParams = useSearchParams();
  const { t } = useTranslation();

  // State Management (using initial server-side data)
  const [products] = useState<ProductData[]>(initialProducts);
  const [isLoading, setIsLoading] = useState(false);

  // State for filters
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
    const categoryParam = urlSearchParams.get("category");
    return categoryParam ? [categoryParam] : [];
  });

  const [selectedFilters, setSelectedFilters] = useState<
    Record<string, string[]>
  >({});
  const [priceRangeFilter, setPriceRangeFilter] = useState<PriceRange>(() => {
    // Calculate initial price range from products
    if (initialProducts.length > 0) {
      const prices = initialProducts.map((p) => p.price);
      const minPrice = Math.floor(Math.min(...prices));
      const maxPrice = Math.ceil(Math.max(...prices));
      return { min: minPrice, max: maxPrice };
    }
    return { min: 0, max: 200 };
  });

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Create category filter from initial data
  const categoryFilter = useMemo(() => {
    const categories = [
      ...new Set(
        products
          .filter((p) => p.category?.name)
          .map((p) => p.category!.name.toLowerCase())
      ),
    ] as string[];

    return {
      id: "category",
      name: t("stemCategory", "STEM Category"),
      options: categories.map((category) => ({
        id: category.toLowerCase(),
        label: t(
          `${category.toLowerCase()}Category`,
          category.charAt(0).toUpperCase() + category.slice(1)
        ),
        count: products.filter(
          (p) => p.category?.name.toLowerCase() === category.toLowerCase()
        ).length,
      })),
    };
  }, [products, t]);

  // Mock filters (won't make another server request for demo purposes)
  const mockFilters: FilterGroup[] = [
    {
      id: "ageRange",
      name: t("ageRange", "Age Range"),
      options: [
        { id: "6-10", label: t("years6To10", "6-10 years"), count: 5 },
        { id: "8-12", label: t("years8To12", "8-12 years"), count: 4 },
        { id: "10-14", label: t("years10To14", "10-14 years"), count: 3 },
      ],
    },
    {
      id: "difficulty",
      name: t("difficultyLevel", "Difficulty Level"),
      options: [
        { id: "beginner", label: t("beginner", "Beginner"), count: 4 },
        {
          id: "intermediate",
          label: t("intermediate", "Intermediate"),
          count: 5,
        },
        { id: "advanced", label: t("advanced", "Advanced"), count: 3 },
      ],
    },
  ];

  // Calculate filtered products based on all filters applied
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Filter by category - using category.name or slug
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((product) => {
        // Get category info from the product
        const categoryName = product.category?.name.toLowerCase() || "";
        const categorySlug = product.category?.slug.toLowerCase() || "";

        return selectedCategories.some((cat) => {
          const lowerCat = cat.toLowerCase();
          return categoryName === lowerCat || categorySlug === lowerCat;
        });
      });
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
        } else if (filterId === "productType") {
          filtered = filtered.filter((product) => {
            // Check product attributes for type
            return values.some((value) =>
              product.attributes?.type
                ?.toLowerCase()
                .includes(value.toLowerCase())
            );
          });
        }
      }
    });

    // Filter by price range
    filtered = filtered.filter(
      (product) =>
        product.price >= priceRangeFilter.min &&
        product.price <= priceRangeFilter.max
    );

    return filtered;
  }, [products, selectedCategories, selectedFilters, priceRangeFilter]);

  // Update the URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    if (selectedCategories.length === 1) {
      params.set("category", selectedCategories[0]);
    }

    const currentUrl = window.location.pathname;
    const newUrl =
      selectedCategories.length > 0
        ? `${currentUrl}?${params.toString()}`
        : currentUrl;

    window.history.replaceState(null, "", newUrl);
  }, [selectedCategories]);

  // Handler for category filter changes
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategories((prev) => {
      // Check if this category is already selected (case insensitive comparison)
      const isAlreadySelected = prev.some(
        (cat) => cat.toLowerCase() === categoryId.toLowerCase()
      );

      if (isAlreadySelected) {
        // Remove this category
        return prev.filter(
          (id) => id.toLowerCase() !== categoryId.toLowerCase()
        );
      } else {
        // Add this category, replacing any existing ones
        // This ensures only one category is selected at a time
        return [categoryId];
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
    setPriceRangeFilter({
      min: Math.floor(Math.min(...products.map((p) => p.price))),
      max: Math.ceil(Math.max(...products.map((p) => p.price))),
    });
  };

  // Get the active category for the header
  const activeCategory =
    selectedCategories.length === 1
      ? categoryFilter.options.find((c) => {
          // Normalize comparison to handle different slug/id formats
          return (
            c.id.toLowerCase() === selectedCategories[0].toLowerCase() ||
            (c.id === "books" &&
              selectedCategories[0] === "educational-books") ||
            (c.id === "educational-books" && selectedCategories[0] === "books")
          );
        })
      : null;

  // Get appropriate category info
  const activeCategoryInfo = activeCategory
    ? categoryInfo[activeCategory.id] || categoryInfo.science
    : categoryInfo.science;

  // Get category image based on active category
  const categoryImagePath = activeCategory
    ? `/images/category_banner_${activeCategory.id}_01.png`
    : "/images/homepage_hero_banner_01.png";

  const IconComponent = activeCategoryInfo.icon;

  // Helper function to get category title based on active category
  const getCategoryTitle = () => {
    if (!activeCategory)
      return t("discoverStemToys", "Descoperă Jucării STEM Educaționale");

    switch (activeCategory.id) {
      case "science":
        return t("scienceToysTitle");
      case "technology":
        return t("technologyToysTitle");
      case "engineering":
        return t("engineeringToysTitle");
      case "mathematics":
        return t("mathematicsToysTitle");
      case "educational-books":
        return t("educationalBooks");
      default:
        return t("discoverStemToys", "Descoperă Jucării STEM Educaționale");
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
      case "educational-books":
        return t(
          "educationalBooksDesc",
          "Discover our collection of educational books designed to inspire young minds"
        );
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
      case "educational-books":
        return t("booksLearning", "Books That Inspire Young Minds");
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
      case "educational-books":
        return t(
          "booksLearningDesc",
          "Our educational books are carefully crafted to foster a love of learning and inspire curiosity in children."
        );
      default:
        return "";
    }
  };

  return (
    <ProductVariantProvider>
      {/* Hero section with dynamic background based on selected category */}
      <div className="relative">
        {/* Hero Image */}
        <div className="relative h-[20vh] sm:h-[25vh] min-h-[180px] max-h-[300px] w-full">
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
            <div className="container mx-auto px-4 sm:px-6 text-white">
              <div className="max-w-3xl">
                <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                  <div
                    className={`${activeCategoryInfo.bgColor} p-1.5 sm:p-2 rounded-full`}>
                    <IconComponent className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <span className="text-xs sm:text-sm md:text-lg font-bold bg-primary/80 text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-md">
                    {activeCategory ? activeCategory.label : t("allCategories")}
                  </span>
                </div>

                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2 drop-shadow-lg">
                  {getCategoryTitle()}
                </h1>
                <p className="text-xs sm:text-sm max-w-2xl text-white/90 drop-shadow-md hidden sm:block">
                  {getCategoryDescription()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bubble decorations - made smaller and less distracting */}
        <div className="absolute -bottom-4 left-0 w-8 sm:w-16 h-8 sm:h-16 rounded-full bg-blue-500/20 blur-xl"></div>
        <div className="absolute -bottom-6 left-1/4 w-10 sm:w-20 h-10 sm:h-20 rounded-full bg-green-500/20 blur-xl"></div>
        <div className="absolute -bottom-8 right-1/3 w-12 sm:w-24 h-12 sm:h-24 rounded-full bg-yellow-500/20 blur-xl"></div>
        <div className="absolute -bottom-5 right-0 w-8 sm:w-16 h-8 sm:h-16 rounded-full bg-purple-500/20 blur-xl"></div>
      </div>

      {/* Enhanced STEM Category Filters - Prominent positioning */}
      <div className="sticky top-14 sm:top-16 z-20 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-4">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
            <div className="flex flex-wrap gap-1.5 sm:gap-3 justify-center">
              {Object.entries(categoryInfo).map(([key, category]) => {
                const CategoryIcon = category.icon;
                const categoryColor =
                  key === "science"
                    ? "border-blue-500 text-blue-700 hover:bg-blue-50"
                    : key === "technology"
                      ? "border-green-500 text-green-700 hover:bg-green-50"
                      : key === "engineering"
                        ? "border-orange-500 text-orange-700 hover:bg-orange-50"
                        : "border-purple-500 text-purple-700 hover:bg-purple-50";

                const activeColor =
                  key === "science"
                    ? "bg-blue-500 text-white"
                    : key === "technology"
                      ? "bg-green-500 text-white"
                      : key === "engineering"
                        ? "bg-orange-500 text-white"
                        : "bg-purple-500 text-white";

                // Convert both to lowercase for comparison
                const isSelected = selectedCategories.some(
                  (cat) => cat.toLowerCase() === key.toLowerCase()
                );

                return (
                  <Button
                    key={key}
                    variant="outline"
                    size="sm"
                    className={`h-8 sm:h-12 px-2 sm:px-5 rounded-full text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2 border-2 transition-all hover:scale-105 ${
                      isSelected ? activeColor : categoryColor
                    }`}
                    onClick={() => handleCategoryChange(key)}>
                    <CategoryIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="hidden xs:inline">
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </span>
                    <span className="xs:hidden">{category.letter}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* STEM Benefits Section - Made more compact and only show when no category is selected */}
      {!activeCategory && (
        <div className="bg-white py-6 sm:py-8">
          <div className="container mx-auto px-4">
            <h2 className="text-lg sm:text-xl font-bold text-center mb-4 sm:mb-6">
              {t("whyStemEssential")}
            </h2>
            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {stemBenefits.map((benefit, index) => {
                const BenefitIcon = benefit.icon;
                return (
                  <div
                    key={index}
                    className="bg-gray-50 rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex flex-col items-center text-center">
                    <div className="p-1.5 sm:p-2 rounded-full bg-primary/10 text-primary mb-1.5 sm:mb-2">
                      <BenefitIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <h3 className="font-bold text-xs sm:text-sm mb-1">
                      {t(benefit.titleKey)}
                    </h3>
                    <p className="text-gray-600 text-xs">
                      {t(benefit.descKey)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 relative z-10">
        {/* Main product area with showing products count */}
        <div className="mb-3 sm:mb-4 px-1 sm:px-2">
          <p className="text-xs sm:text-sm text-muted-foreground">
            {t("showingProducts")
              .replace("{0}", filteredProducts.length.toString())
              .replace("{1}", products.length.toString())}
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
          {/* Sidebar with filters */}
          <div className="w-full md:w-64 shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4 sticky top-20 sm:top-24">
              <h3 className="text-sm sm:text-base font-bold mb-2 sm:mb-3 flex items-center gap-1.5 sm:gap-2">
                <div className="p-1 sm:p-1.5 rounded-full bg-primary/10">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
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
                categories={categoryFilter}
                filters={mockFilters}
                priceRange={{
                  min: priceRangeFilter.min,
                  max: priceRangeFilter.max,
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
                className={`mb-3 sm:mb-4 p-2 sm:p-3 rounded-xl bg-gradient-to-r 
                ${
                  activeCategory.id === "science"
                    ? "from-blue-50 to-blue-100 border-blue-200"
                    : activeCategory.id === "technology"
                      ? "from-green-50 to-green-100 border-green-200"
                      : activeCategory.id === "engineering"
                        ? "from-orange-50 to-orange-100 border-orange-200"
                        : "from-purple-50 to-purple-100 border-purple-200"
                } border shadow-sm`}>
                <div className="flex flex-col xs:flex-row items-start xs:items-center gap-2 sm:gap-3">
                  <div
                    className={`p-2 sm:p-3 rounded-full ${
                      activeCategory && categoryInfo[activeCategory.id]
                        ? categoryInfo[activeCategory.id].bgColor
                        : categoryInfo.science.bgColor
                    } flex-shrink-0`}>
                    <IconComponent className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm sm:text-base font-semibold mb-0.5 sm:mb-1">
                      {getLearningTitle()}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                      {getLearningDescription()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Products display */}
            <div
              className={viewMode === "list" ? "space-y-3 sm:space-y-4" : ""}>
              {viewMode === "grid" ? (
                <div className="bg-gray-50/50 rounded-xl p-2 sm:p-4">
                  <ProductGrid
                    products={filteredProducts as unknown as Product[]}
                    columns={{ sm: 1, md: 2, lg: 3, xl: 3 }}
                  />
                </div>
              ) : (
                <div className="bg-gray-50/50 rounded-xl p-2 sm:p-4 space-y-2 sm:space-y-3">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex flex-col xs:flex-row gap-3 sm:gap-4 bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow relative group">
                      {/* Fun shape decoration - smaller size */}
                      <div className="absolute -left-2 -top-2 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-primary/10 transition-transform group-hover:scale-110 -z-0 hidden sm:block"></div>
                      <div className="absolute -right-2 -bottom-2 w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-yellow-200/30 transition-transform group-hover:scale-110 -z-0 hidden sm:block"></div>

                      <div className="xs:w-1/3 relative h-32 xs:h-36 sm:h-40 z-10">
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          style={{ objectFit: "cover" }}
                          className="transition-transform hover:scale-105 duration-300"
                        />
                        {product.compareAtPrice && (
                          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md">
                            Sale
                          </div>
                        )}
                      </div>
                      <div className="p-3 sm:p-4 xs:w-2/3 z-10">
                        <div className="flex flex-wrap gap-1 sm:gap-2 mb-1.5 sm:mb-2">
                          <Badge
                            variant="outline"
                            className={`text-xs px-1.5 py-0 sm:px-2 sm:py-0.5
                            ${
                              product.category?.name.toLowerCase() === "science"
                                ? "bg-blue-100 text-blue-700 border-blue-200"
                                : product.category?.name.toLowerCase() ===
                                    "technology"
                                  ? "bg-green-100 text-green-700 border-green-200"
                                  : product.category?.name.toLowerCase() ===
                                      "engineering"
                                    ? "bg-orange-100 text-orange-700 border-orange-200"
                                    : "bg-purple-100 text-purple-700 border-purple-200"
                            }
                          `}>
                            {product.category?.name}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="bg-gray-100 text-gray-700 border-gray-200 text-xs px-1.5 py-0 sm:px-2 sm:py-0.5">
                            {product.ageRange} years
                          </Badge>
                          <Badge
                            variant="outline"
                            className="bg-gray-100 text-gray-700 border-gray-200 text-xs px-1.5 py-0 sm:px-2 sm:py-0.5">
                            {product.attributes?.difficulty}
                          </Badge>
                        </div>
                        <h3 className="text-sm sm:text-base font-semibold mb-0.5 sm:mb-1">
                          {product.name}
                        </h3>
                        <p className="text-xs text-gray-600 mb-2 sm:mb-3 line-clamp-2">
                          {product.description}
                        </p>
                        <div className="flex justify-between items-center">
                          <div className="flex items-baseline gap-1 sm:gap-2">
                            <span className="text-sm sm:text-base font-bold">
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
                              className="rounded-full px-2 sm:px-3 text-xs py-0.5 sm:py-1 h-6 sm:h-7 transition-transform hover:scale-105">
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
              <div className="text-center py-8 sm:py-12 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 mb-2 sm:mb-3 bg-gray-100 rounded-full flex items-center justify-center">
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
                    className="text-gray-400">
                    <circle
                      cx="11"
                      cy="11"
                      r="8"
                    />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                </div>
                <h3 className="text-sm sm:text-base font-medium mb-1 sm:mb-2">
                  {t("noProductsFound")}
                </h3>
                <p className="text-xs text-muted-foreground mb-3 sm:mb-4">
                  {t("tryAdjustingFilters")}
                </p>
                <Button
                  onClick={handleClearFilters}
                  className="rounded-full px-3 sm:px-4 text-xs sm:text-sm py-1 h-7 sm:h-8">
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
