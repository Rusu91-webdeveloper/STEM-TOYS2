"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";
import { TranslationKey } from "@/lib/i18n/translations";

// Category data with translation keys
const categoryDescKeys: Record<string, TranslationKey> = {
  science: "scienceCategoryDesc",
  technology: "technologyCategoryDesc",
  engineering: "engineeringCategoryDesc",
  math: "mathCategoryDesc",
};

const categories = [
  {
    name: "Science",
    description: "scienceCategoryDesc",
    slug: "science",
    image: "/images/category_banner_science_01.png",
    productCount: 24,
  },
  {
    name: "Technology",
    description: "technologyCategoryDesc",
    slug: "technology",
    image: "/images/category_banner_technology_01.png",
    productCount: 18,
  },
  {
    name: "Engineering",
    description: "engineeringCategoryDesc",
    slug: "engineering",
    image: "/images/category_banner_engineering_01.png",
    productCount: 21,
  },
  {
    name: "Math",
    description: "mathCategoryDesc",
    slug: "math",
    image: "/images/category_banner_math_01.png",
    productCount: 16,
  },
];

export default function CategoriesPage() {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">
        {t("stemCategories")}
      </h1>
      <p className="text-muted-foreground text-center max-w-3xl mx-auto mb-12">
        {t("stemCategoriesDesc")}
      </p>

      <div className="space-y-16">
        {categories.map((category, index) => (
          <div
            key={category.slug}
            className={`flex flex-col ${index % 2 !== 0 ? "md:flex-row-reverse" : "md:flex-row"} gap-8 items-center`}>
            <div className="w-full md:w-1/2">
              <div className="relative h-64 md:h-96 w-full overflow-hidden rounded-lg">
                <Image
                  src={category.image}
                  alt={`${category.name} category of STEM toys`}
                  fill
                  style={{ objectFit: "cover" }}
                  className="transition-transform hover:scale-105 duration-500"
                />
              </div>
            </div>

            <div className="w-full md:w-1/2 space-y-4">
              <div className="inline-block px-3 py-1 text-sm rounded-full bg-primary/10 text-primary">
                {t("categoryProducts").replace(
                  "{0}",
                  category.productCount.toString()
                )}
              </div>
              <h2 className="text-3xl font-bold">{category.name}</h2>
              <p className="text-muted-foreground">
                {t(category.description as TranslationKey)}
              </p>
              <div className="pt-4">
                <Button asChild>
                  <Link
                    href={`/products?category=${category.slug.toLowerCase()}`}>
                    {t("explorerCategoryToys").replace("{0}", category.name)}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
