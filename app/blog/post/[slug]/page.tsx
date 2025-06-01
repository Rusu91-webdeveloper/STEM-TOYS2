"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft, Calendar, User, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/lib/i18n";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  stemCategory: string;
  tags: string[];
  publishedAt: string;
  readingTime: number | null;
  author: {
    name: string | null;
  };
  category: {
    name: string;
    slug: string;
  };
}

export default function BlogPostPage() {
  const params = useParams<{ slug: string }>();
  const { language, t } = useTranslation();
  const [blogPost, setBlogPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlogPost = async () => {
      if (!params.slug) return;

      try {
        setIsLoading(true);
        const url = new URL(`/api/blog/${params.slug}`, window.location.origin);
        url.searchParams.append("language", language);

        const response = await fetch(url.toString());

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Blog post not found");
          }
          throw new Error("Failed to fetch blog post");
        }

        const data = await response.json();
        setBlogPost(data);
      } catch (err) {
        console.error("Error fetching blog post:", err);
        setError(`${err instanceof Error ? err.message : "An error occurred"}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogPost();
  }, [params.slug, language]);

  // Get default image based on STEM category
  const getDefaultImage = (category?: string) => {
    switch (category) {
      case "SCIENCE":
        return "/images/category_banner_science_01.png";
      case "TECHNOLOGY":
        return "/images/category_banner_technology_01.png";
      case "ENGINEERING":
        return "/images/category_banner_engineering_01.png";
      case "MATHEMATICS":
        return "/images/category_banner_math_01.png";
      default:
        return "/images/category_banner_science_01.png";
    }
  };

  // Function to get color based on STEM category
  const getStemCategoryColor = (category?: string) => {
    switch (category) {
      case "SCIENCE":
        return "bg-blue-100 text-blue-800";
      case "TECHNOLOGY":
        return "bg-green-100 text-green-800";
      case "ENGINEERING":
        return "bg-yellow-100 text-yellow-800";
      case "MATHEMATICS":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="container py-12 flex justify-center items-center min-h-[60vh]">
        <p className="text-lg">{t("loading")} ...</p>
      </div>
    );
  }

  if (error || !blogPost) {
    return (
      <div className="container py-12 flex flex-col justify-center items-center min-h-[60vh]">
        <p className="text-lg text-red-500 mb-4">
          {error || t("blogPostNotFound")}
        </p>
        <Link href="/blog">
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("backToBlog")}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Image */}
      <div className="relative h-[400px] md:h-[500px]">
        <Image
          src={blogPost.coverImage || getDefaultImage(blogPost.stemCategory)}
          alt={blogPost.title}
          fill
          sizes="100vw"
          style={{ objectFit: "cover" }}
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

        {/* Back button - desktop */}
        <div className="absolute top-4 left-4 hidden md:block">
          <Link href="/blog">
            <Button
              variant="outline"
              className="bg-white/80 backdrop-blur-sm hover:bg-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("backToBlog")}
            </Button>
          </Link>
        </div>

        {/* Language indicator - displayed on desktop */}
        <div className="absolute top-4 right-4 hidden md:flex items-center gap-2 bg-white/80 px-3 py-1 rounded-full backdrop-blur-sm">
          {language === "ro" ? "🇷🇴" : "🇬🇧"}
          <span className="text-sm font-medium text-gray-900">
            {language === "ro" ? "Română" : "English"}
          </span>
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 bg-gradient-to-t from-black/80 to-transparent">
          <div className="container mx-auto">
            <div className="flex items-center space-x-2 text-white/80 mb-3">
              <Link
                href={`/blog/category/${blogPost.category.slug}`}
                className="hover:text-white transition-colors">
                {blogPost.category.name}
              </Link>
              <span>•</span>
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {format(new Date(blogPost.publishedAt), "MMMM d, yyyy")}
              </span>
              {blogPost.author?.name && (
                <>
                  <span>•</span>
                  <span className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    {blogPost.author.name}
                  </span>
                </>
              )}

              {/* Mobile language indicator */}
              <span className="md:hidden">•</span>
              <span className="flex items-center md:hidden">
                {language === "ro" ? "🇷🇴" : "🇬🇧"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow-sm">
              {blogPost.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Back button - mobile */}
      <div className="container mx-auto md:hidden py-4">
        <Link href="/blog">
          <Button size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t("backToBlog")}
          </Button>
        </Link>
      </div>

      <main className="container mx-auto max-w-4xl py-10 px-4">
        {/* Article content */}
        <article className="bg-white p-6 rounded-lg shadow-sm">
          <div className="prose prose-indigo max-w-none">
            <p className="text-xl text-gray-600 mb-6 font-medium leading-relaxed">
              {blogPost.excerpt}
            </p>
            <Separator className="my-8" />
            <div className="whitespace-pre-line">{blogPost.content}</div>
          </div>

          {/* Tags */}
          {blogPost.tags && blogPost.tags.length > 0 && (
            <div className="mt-10 pt-6 border-t">
              <h3 className="text-lg font-medium mb-3 flex items-center">
                <Tag className="h-4 w-4 mr-2" />
                {t("tags")}
              </h3>
              <div className="flex flex-wrap gap-2">
                {blogPost.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="bg-gray-100">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </article>

        {/* Back to blog link */}
        <div className="flex justify-center mt-10">
          <Link href="/blog">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("backToBlog")}
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
