import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/lib/auth";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    // Check if user is authenticated and is an admin
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Only administrators can seed blog data." },
        { status: 401 }
      );
    }

    // Get the first admin user to use as author
    const adminUser = await prisma.user.findFirst({
      where: { role: "ADMIN" },
    });

    if (!adminUser) {
      return NextResponse.json(
        { error: "No admin user found to associate with blog posts" },
        { status: 400 }
      );
    }

    // Create a default category if none exists
    let category = await prisma.category.findFirst();

    if (!category) {
      category = await prisma.category.create({
        data: {
          name: "STEM Education",
          slug: "stem-education",
          description: "Articles about STEM education and learning",
          isActive: true,
        },
      });
    }

    // Sample blogs
    const sampleBlogs = [
      {
        title: "Top 10 STEM Toys for Early Childhood Development",
        slug: "top-10-stem-toys-early-childhood",
        excerpt:
          "Discover the best STEM toys that help preschoolers develop essential early skills while having fun.",
        content:
          "This is a detailed blog post content about STEM toys for early childhood development. Here we would discuss various toys, their benefits, and how they contribute to different aspects of development including cognitive, motor, and social skills.",
        coverImage: "/images/category_banner_science_01.png",
        categoryId: category.id,
        authorId: adminUser.id,
        stemCategory: "SCIENCE" as const,
        tags: ["toys", "preschool", "development", "science"],
        isPublished: true,
        publishedAt: new Date(),
      },
      {
        title: "How Coding Toys Prepare Children for the Future",
        slug: "coding-toys-prepare-children-future",
        excerpt:
          "Learn how coding toys and games can help develop computational thinking and prepare kids for tomorrow's jobs.",
        content:
          "This blog post explores how coding toys and games not only teach children programming concepts but also help them develop logical thinking, problem-solving abilities, and other skills that will be valuable in the future job market.",
        coverImage: "/images/category_banner_technology_01.png",
        categoryId: category.id,
        authorId: adminUser.id,
        stemCategory: "TECHNOLOGY" as const,
        tags: ["coding", "technology", "future skills"],
        isPublished: true,
        publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      },
      {
        title: "Math Games That Make Learning Fun",
        slug: "math-games-make-learning-fun",
        excerpt:
          "Turn math anxiety into math enthusiasm with these engaging games and activities.",
        content:
          "Mathematics doesn't have to be intimidating. This article showcases various games and interactive activities that make learning math concepts enjoyable for children of different age groups.",
        coverImage: "/images/category_banner_math_01.png",
        categoryId: category.id,
        authorId: adminUser.id,
        stemCategory: "MATHEMATICS" as const,
        tags: ["math", "games", "learning"],
        isPublished: true,
        publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
      },
      {
        title: "Building Bridges: Engineering Projects for Kids",
        slug: "building-bridges-engineering-projects",
        excerpt:
          "Simple engineering projects that teach fundamental concepts while engaging children's creativity.",
        content:
          "Engineering isn't just for adults. This post outlines several age-appropriate engineering projects that children can do at home or in school, explaining the scientific principles behind each activity.",
        coverImage: "/images/category_banner_engineering_01.png",
        categoryId: category.id,
        authorId: adminUser.id,
        stemCategory: "ENGINEERING" as const,
        tags: ["engineering", "projects", "hands-on"],
        isPublished: true,
        publishedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), // 21 days ago
      },
      {
        title: "The Future of STEM Education",
        slug: "future-stem-education",
        excerpt:
          "Exploring emerging trends and technologies that will shape how children learn STEM subjects in the coming years.",
        content:
          "This article examines how virtual reality, artificial intelligence, and other emerging technologies are changing the landscape of education, particularly in science, technology, engineering, and mathematics.",
        coverImage: "/images/category_banner_technology_01.png",
        categoryId: category.id,
        authorId: adminUser.id,
        stemCategory: "GENERAL" as const,
        tags: ["education", "future", "technology"],
        isPublished: false, // Draft post
        publishedAt: null,
      },
    ];

    // Create blogs in the database, one by one
    const createdBlogs = [];

    for (const blogData of sampleBlogs) {
      // Check if blog with this slug already exists
      const existingBlog = await prisma.blog.findUnique({
        where: { slug: blogData.slug },
      });

      if (existingBlog) {
        createdBlogs.push(existingBlog);
        continue; // Skip if exists
      }

      // Convert tags array to string for storage
      const processedBlogData = {
        ...blogData,
        tags: blogData.tags,
        readingTime: Math.ceil(blogData.content.split(" ").length / 200), // Rough estimate: 200 words per minute
      };

      // Create blog post
      const blog = await prisma.blog.create({
        data: processedBlogData,
      });

      createdBlogs.push(blog);
    }

    return NextResponse.json(
      {
        message: "Blog posts seeded successfully",
        count: createdBlogs.length,
        blogs: createdBlogs.map((blog) => ({
          id: blog.id,
          title: blog.title,
          slug: blog.slug,
          isPublished: blog.isPublished,
        })),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error seeding blog posts:", error);
    return NextResponse.json(
      { error: "Failed to seed blog posts" },
      { status: 500 }
    );
  }
}
