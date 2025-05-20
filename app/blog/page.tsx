"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";

// Mock data for blog posts
const blogPosts = [
  {
    id: "1",
    title: "Top 10 STEM Toys for Early Childhood Development",
    excerpt:
      "Discover the best STEM toys that help preschoolers develop essential early skills while having fun.",
    date: "May 15, 2023",
    category: "Early Learning",
    image: "/images/category_banner_science_01.png",
    author: "Emily Johnson",
  },
  {
    id: "2",
    title: "How Coding Toys Prepare Children for the Future",
    excerpt:
      "Learn how coding toys and games can help develop computational thinking and prepare kids for tomorrow's jobs.",
    date: "April 28, 2023",
    category: "Technology",
    image: "/images/category_banner_technology_01.png",
    author: "Michael Chen",
  },
  {
    id: "3",
    title: "The Science Behind Effective Educational Toys",
    excerpt:
      "Understanding how educational toys are designed to maximize learning outcomes through play-based approaches.",
    date: "March 12, 2023",
    category: "Research",
    image: "/images/category_banner_engineering_01.png",
    author: "Dr. Sarah Williams",
  },
  {
    id: "4",
    title: "Building Skills Through Construction Toys",
    excerpt:
      "How construction and building toys help develop spatial reasoning, planning, and problem-solving abilities.",
    date: "February 20, 2023",
    category: "Engineering",
    image: "/images/category_banner_math_01.png",
    author: "David Rodriguez",
  },
];

export default function BlogPage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[400px] flex items-center">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/category_banner_science_01.png"
            alt="STEM Toys Blog - Educational articles and insights"
            fill
            sizes="100vw"
            style={{ objectFit: "cover" }}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/70 via-purple-900/60 to-pink-900/70" />
        </div>
        <div className="container relative z-10 text-white px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 drop-shadow-md">
            {t("blogTitle")}
          </h1>
          <p className="text-lg md:text-xl mb-6 max-w-2xl leading-relaxed drop-shadow-sm">
            {t("blogDescription")}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white border-none shadow-md transition-all"
              size="sm">
              <Link href="/blog/category/early-learning">Early Learning</Link>
            </Button>
            <Button
              className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white border-none shadow-md transition-all"
              size="sm">
              <Link href="/blog/category/technology">Technology</Link>
            </Button>
            <Button
              className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white border-none shadow-md transition-all"
              size="sm">
              <Link href="/blog/category/research">Research</Link>
            </Button>
            <Button
              className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white border-none shadow-md transition-all"
              size="sm">
              <Link href="/blog/category/engineering">Engineering</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      <section className="py-12 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50">
        <div className="container px-4 sm:px-6 lg:px-8 mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-indigo-900">
            {t("latestArticles")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mx-auto max-w-7xl">
            {blogPosts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-lg overflow-hidden shadow-md border border-indigo-100 hover:shadow-xl hover:border-indigo-200 transition-all transform hover:-translate-y-1 duration-300">
                <div className="relative h-48 w-full">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    style={{ objectFit: "cover" }}
                    className="transition-transform hover:scale-105 duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  <div className="absolute bottom-3 left-3">
                    <span className="inline-block px-2 py-1 text-xs rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 font-medium shadow-sm border border-indigo-200/50">
                      {post.category}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="mb-2 flex justify-between items-center">
                    <span className="text-xs text-indigo-600 font-medium">
                      {post.date}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-indigo-900 line-clamp-2 hover:text-indigo-700 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-sm text-gray-700 mb-4 line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-indigo-600 font-medium">
                      By {post.author}
                    </span>
                    <Button
                      className="bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 hover:from-indigo-100 hover:to-purple-100 border border-indigo-200 shadow-sm transition-all"
                      size="sm"
                      asChild>
                      <Link href={`/blog/${post.id}`}>{t("readMore")}</Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-12 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white">
        <div className="container px-4 sm:px-6 lg:px-8 mx-auto">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 drop-shadow-md">
              {t("stayUpdated")}
            </h2>
            <p className="mb-6 max-w-2xl leading-relaxed drop-shadow-sm">
              {t("newsletterDescription")}
            </p>
            <div className="w-full max-w-md flex gap-2">
              <input
                type="email"
                placeholder={t("emailPlaceholder")}
                className="flex-1 px-4 py-2 rounded-md border border-white/30 bg-white/10 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 shadow-inner transition-all"
              />
              <Button className="bg-white text-indigo-700 hover:bg-white/90 border-none shadow-md transition-all">
                {t("subscribe")}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
