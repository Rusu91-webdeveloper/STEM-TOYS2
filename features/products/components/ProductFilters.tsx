"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { X, SlidersHorizontal } from "lucide-react";

export interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

export interface FilterGroup {
  id: string;
  name: string;
  options: FilterOption[];
}

export interface PriceRange {
  min: number;
  max: number;
}

export interface ProductFiltersProps {
  categories?: FilterGroup;
  filters: FilterGroup[];
  priceRange?: {
    min: number;
    max: number;
    current: PriceRange;
  };
  selectedCategories?: string[];
  selectedFilters?: Record<string, string[]>;
  onCategoryChange?: (categoryId: string) => void;
  onFilterChange?: (filterId: string, optionId: string) => void;
  onPriceChange?: (range: PriceRange) => void;
  onClearFilters?: () => void;
  className?: string;
}

export function ProductFilters({
  categories,
  filters,
  priceRange,
  selectedCategories = [],
  selectedFilters = {},
  onCategoryChange,
  onFilterChange,
  onPriceChange,
  onClearFilters,
  className,
}: ProductFiltersProps) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [localPriceRange, setLocalPriceRange] = useState<PriceRange>(
    priceRange?.current || {
      min: priceRange?.min || 0,
      max: priceRange?.max || 100,
    }
  );

  // Count total active filters
  const activeFilterCount =
    selectedCategories.length +
    Object.values(selectedFilters).reduce(
      (count, options) => count + options.length,
      0
    ) +
    (priceRange?.current.min !== priceRange?.min ||
    priceRange?.current.max !== priceRange?.max
      ? 1
      : 0);

  // Handle price slider change
  const handlePriceChange = (value: number[]) => {
    const newRange = { min: value[0], max: value[1] };
    setLocalPriceRange(newRange);
  };

  // Apply price range filter when done changing
  const handlePriceChangeComplete = () => {
    if (onPriceChange) {
      onPriceChange(localPriceRange);
    }
  };

  // Format price for display
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const filterContent = (
    <div className="space-y-6">
      {/* Clear filters button (if there are active filters) */}
      {activeFilterCount > 0 && (
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">
            Active Filters: {activeFilterCount}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-8 text-xs">
            Clear All
          </Button>
        </div>
      )}

      {/* Categories filter */}
      {categories && categories.options.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium">{categories.name}</h3>
          <div className="space-y-2">
            {categories.options.map((category) => (
              <div
                key={category.id}
                className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category.id}`}
                  checked={selectedCategories.includes(category.id)}
                  onCheckedChange={() => onCategoryChange?.(category.id)}
                />
                <Label
                  htmlFor={`category-${category.id}`}
                  className="flex-grow text-sm">
                  {category.label}
                </Label>
                {category.count !== undefined && (
                  <span className="text-xs text-muted-foreground">
                    ({category.count})
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Price range filter */}
      {priceRange && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Price Range</h3>
          <div className="space-y-6 px-2">
            <Slider
              defaultValue={[localPriceRange.min, localPriceRange.max]}
              min={priceRange.min}
              max={priceRange.max}
              step={1}
              value={[localPriceRange.min, localPriceRange.max]}
              onValueChange={handlePriceChange}
              onValueCommit={handlePriceChangeComplete}
              className="mt-6"
            />
            <div className="flex items-center justify-between">
              <div className="text-sm">{formatPrice(localPriceRange.min)}</div>
              <div className="text-sm">{formatPrice(localPriceRange.max)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Attribute filters */}
      {filters.length > 0 && (
        <Accordion
          type="multiple"
          className="space-y-2 w-full"
          defaultValue={filters.map((f) => f.id)}>
          {filters.map((filter) => (
            <AccordionItem
              key={filter.id}
              value={filter.id}>
              <AccordionTrigger className="text-sm font-medium py-3">
                {filter.name}
              </AccordionTrigger>
              <AccordionContent className="pt-2 pb-4">
                <div className="space-y-2">
                  {filter.options.map((option) => (
                    <div
                      key={option.id}
                      className="flex items-center space-x-2">
                      <Checkbox
                        id={`${filter.id}-${option.id}`}
                        checked={
                          selectedFilters[filter.id]?.includes(option.id) ||
                          false
                        }
                        onCheckedChange={() =>
                          onFilterChange?.(filter.id, option.id)
                        }
                      />
                      <Label
                        htmlFor={`${filter.id}-${option.id}`}
                        className="flex-grow text-sm">
                        {option.label}
                      </Label>
                      {option.count !== undefined && (
                        <span className="text-xs text-muted-foreground">
                          ({option.count})
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );

  // Selected filter badges for mobile view
  const renderSelectedFilters = () => {
    if (activeFilterCount === 0) return null;

    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {selectedCategories.map((categoryId) => {
          const category = categories?.options.find((c) => c.id === categoryId);
          if (!category) return null;

          return (
            <Badge
              key={`cat-${categoryId}`}
              variant="outline"
              className="flex items-center gap-1">
              {category.label}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onCategoryChange?.(categoryId)}
              />
            </Badge>
          );
        })}

        {Object.entries(selectedFilters).map(([filterId, optionIds]) =>
          optionIds.map((optionId) => {
            const filterGroup = filters.find((f) => f.id === filterId);
            const option = filterGroup?.options.find((o) => o.id === optionId);
            if (!filterGroup || !option) return null;

            return (
              <Badge
                key={`${filterId}-${optionId}`}
                variant="outline"
                className="flex items-center gap-1">
                {option.label}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => onFilterChange?.(filterId, optionId)}
                />
              </Badge>
            );
          })
        )}

        {(priceRange?.current.min !== priceRange?.min ||
          priceRange?.current.max !== priceRange?.max) && (
          <Badge
            variant="outline"
            className="flex items-center gap-1">
            {formatPrice(priceRange!.current.min)} -{" "}
            {formatPrice(priceRange!.current.max)}
            <X
              className="h-3 w-3 cursor-pointer"
              onClick={() =>
                onPriceChange?.({ min: priceRange!.min, max: priceRange!.max })
              }
            />
          </Badge>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Desktop filters */}
      <div className={cn("hidden md:block", className)}>{filterContent}</div>

      {/* Mobile filters */}
      <div className="md:hidden">
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}>
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <Badge
                variant="secondary"
                className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </Button>

          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-xs">
              Clear All
            </Button>
          )}
        </div>

        {renderSelectedFilters()}

        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 bg-background/95 pt-16 pb-20 px-4 sm:px-6 lg:px-8 overflow-y-auto">
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Filters</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMobileFiltersOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {filterContent}

              <div className="mt-8 flex gap-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setMobileFiltersOpen(false)}>
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => setMobileFiltersOpen(false)}>
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
