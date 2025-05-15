import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const categories = [
  {
    name: "Science",
    description:
      "Discover the wonders of the natural world through hands-on experiments and exploration. Our science toys promote curiosity, observation skills, and a deeper understanding of how things work.",
    slug: "science",
    image: "/images/category_banner_science_01.png",
    productCount: 24,
  },
  {
    name: "Technology",
    description:
      "Explore coding, robotics, and digital innovation with our technology-focused toys. These products help children develop computational thinking and prepare for a digital future.",
    slug: "technology",
    image: "/images/category_banner_technology_01.png",
    productCount: 18,
  },
  {
    name: "Engineering",
    description:
      "Build, design, and solve problems with our engineering toys and kits. These products encourage critical thinking, spatial reasoning, and the engineering design process.",
    slug: "engineering",
    image: "/images/category_banner_engineering_01.png",
    productCount: 21,
  },
  {
    name: "Math",
    description:
      "Make numbers fun and engaging with our mathematics toys and games. These products build foundational math skills through play and help children develop logical thinking.",
    slug: "math",
    image: "/images/category_banner_math_01.png",
    productCount: 16,
  },
];

export default function CategoriesPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">STEM Categories</h1>
      <p className="text-muted-foreground text-center max-w-3xl mx-auto mb-12">
        Explore our carefully curated STEM categories. Each category is designed
        to develop specific skills while making learning fun and engaging for
        children of all ages.
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
                {category.productCount} Products
              </div>
              <h2 className="text-3xl font-bold">{category.name}</h2>
              <p className="text-muted-foreground">{category.description}</p>
              <div className="pt-4">
                <Button asChild>
                  <Link
                    href={`/products?category=${category.slug.toLowerCase()}`}>
                    Explore {category.name} Toys
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
