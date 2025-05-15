import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Mock data for featured products
const featuredProducts = [
  {
    id: "1",
    name: "Robotic Building Kit",
    description:
      "Build and program your own robot with this beginner-friendly kit.",
    price: 59.99,
    category: "technology",
    image: "https://placehold.co/600x400/4F46E5/FFFFFF.png?text=Robot+Kit",
    slug: "robotic-building-kit",
  },
  {
    id: "2",
    name: "Chemistry Lab Set",
    description:
      "Explore the fascinating world of chemistry with safe and fun experiments.",
    price: 49.99,
    category: "science",
    image: "https://placehold.co/600x400/10B981/FFFFFF.png?text=Chemistry+Set",
    slug: "chemistry-lab-set",
  },
  {
    id: "3",
    name: "Magnetic Building Tiles",
    description:
      "Create amazing 3D structures with these colorful magnetic tiles.",
    price: 39.99,
    category: "engineering",
    image: "https://placehold.co/600x400/F59E0B/FFFFFF.png?text=Magnetic+Tiles",
    slug: "magnetic-building-tiles",
  },
  {
    id: "4",
    name: "Math Puzzle Game",
    description: "Develop math skills through fun and challenging puzzles.",
    price: 29.99,
    category: "math",
    image: "https://placehold.co/600x400/3B82F6/FFFFFF.png?text=Math+Puzzle",
    slug: "math-puzzle-game",
  },
];

// Mock data for STEM categories
const categories = [
  {
    name: "Science",
    description: "Discover the wonders of the natural world",
    slug: "science",
    image: "/images/category_banner_science_01.png",
  },
  {
    name: "Technology",
    description: "Explore coding, robotics, and digital innovation",
    slug: "technology",
    image: "/images/category_banner_technology_01.png",
  },
  {
    name: "Engineering",
    description: "Build, design, and solve problems",
    slug: "engineering",
    image: "/images/category_banner_engineering_01.png",
  },
  {
    name: "Math",
    description: "Make numbers fun and engaging",
    slug: "math",
    image: "/images/category_banner_math_01.png",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section - Already updated for better visibility */}
      <section className="relative h-[70vh] min-h-[600px] max-h-[800px] flex items-center">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/homepage_hero_banner_01.png"
            alt="Hero image of children playing with STEM toys"
            fill
            sizes="100vw"
            style={{ objectFit: "cover" }}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-black/30" />
        </div>
        <div className="container relative z-10 text-white mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 drop-shadow-md">
              Inspire Curious Minds
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-2xl drop-shadow-md">
              Discover our curated collection of STEM toys that make learning
              fun and engaging for children of all ages.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                asChild
                size="lg"
                className="text-base md:text-lg px-8 py-6 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105 bg-gradient-to-r from-blue-600 to-yellow-500 hover:from-blue-700 hover:to-yellow-400 text-white border-0">
                <Link href="/products">Shop All Products</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="text-base md:text-lg px-8 py-6 bg-orange-500 text-white border-orange-500 hover:bg-orange-600 hover:border-orange-600 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                <Link href="/categories">Explore Categories</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* STEM Categories - Updated for better centering */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">
            Explore STEM Categories
          </h2>
          <p className="text-center text-muted-foreground mb-10 max-w-3xl mx-auto">
            Discover our range of educational toys categorized by STEM
            disciplines to help your child develop essential skills while having
            fun.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {categories.map((category) => (
              <Link
                href={`/categories/${category.slug}`}
                key={category.slug}>
                <div className="bg-background rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:shadow-xl hover:translate-y-[-5px] h-full flex flex-col">
                  <div className="relative h-48 w-full">
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                  <div className="p-5 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold mb-2">{category.name}</h3>
                    <p className="text-muted-foreground mb-4">
                      {category.description}
                    </p>
                    <div className="mt-auto">
                      <span className="text-primary text-sm font-medium inline-flex items-center">
                        Explore {category.name}{" "}
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-4 h-4 ml-1">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                          />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products - Updated for better centering */}
      <section className="py-16">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">
            Featured Products
          </h2>
          <p className="text-center text-muted-foreground mb-10 max-w-3xl mx-auto">
            Handpicked products that have proven to be favorites among parents
            and educators for their exceptional educational value.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {featuredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-background rounded-lg overflow-hidden shadow-md border border-gray-200 transition-all duration-300 hover:shadow-xl h-full flex flex-col">
                <div className="relative h-52 w-full">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <div className="p-5 flex flex-col flex-grow">
                  <div className="inline-block px-2 py-1 text-xs rounded-full bg-muted text-muted-foreground mb-2">
                    {product.category.charAt(0).toUpperCase() +
                      product.category.slice(1)}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                  <p className="text-muted-foreground text-sm mb-4 flex-grow">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-lg font-bold">
                      ${product.price.toFixed(2)}
                    </span>
                    <Button
                      asChild
                      size="sm"
                      className="transition-all hover:scale-105">
                      <Link href={`/products/${product.slug}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Button
              asChild
              size="lg"
              className="text-base px-8 py-6 rounded-lg shadow-md hover:shadow-lg transition-all hover:scale-105">
              <Link href="/products">View All Products</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Value Proposition - Updated for better centering */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
          <h2 className="text-3xl font-bold mb-12 text-center">
            Why Choose TechTots?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <div className="text-center bg-primary-foreground/10 rounded-lg p-8 transition-transform hover:scale-105">
              <div className="flex justify-center mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-14 h-14">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3">Educational Value</h3>
              <p className="text-primary-foreground/90">
                Our toys are designed to teach STEM concepts in a fun and
                engaging way.
              </p>
            </div>

            <div className="text-center bg-primary-foreground/10 rounded-lg p-8 transition-transform hover:scale-105">
              <div className="flex justify-center mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-14 h-14">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3">Quality & Safety</h3>
              <p className="text-primary-foreground/90">
                All our products meet or exceed safety standards and are built
                to last.
              </p>
            </div>

            <div className="text-center bg-primary-foreground/10 rounded-lg p-8 transition-transform hover:scale-105">
              <div className="flex justify-center mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-14 h-14">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .06-.312m-2.24 2.39a4.493 4.493 0 0 0-1.757 4.306 4.493 4.493 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3">Expert Selection</h3>
              <p className="text-primary-foreground/90">
                Each toy is carefully selected by our team of educators and STEM
                experts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter - Updated for better centering */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-5xl">
          <div className="bg-muted rounded-2xl p-8 md:p-12 shadow-lg">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Subscribe to our newsletter for new product announcements,
                special offers, and STEM activity ideas for your children.
              </p>
            </div>
            <form className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
              <input
                type="email"
                placeholder="Your email address"
                className="flex h-12 w-full rounded-md border border-input bg-background px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <Button
                type="submit"
                className="h-12 px-6 text-base transition-all hover:scale-105">
                Subscribe
              </Button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
