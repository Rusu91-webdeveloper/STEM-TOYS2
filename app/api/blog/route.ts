import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { PrismaClient } from "@/app/generated/prisma";

const prisma = new PrismaClient();

// GET all blog posts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const stemCategory = searchParams.get("stemCategory");
    const published = searchParams.get("published");

    const filters: any = {};
    const session = await auth();
    const isAdmin = session?.user?.role === "ADMIN";

    if (category) {
      filters.categoryId = category;
    }

    if (stemCategory) {
      filters.stemCategory = stemCategory;
    }

    if (published) {
      if (published === "all") {
        // Only admins can see all blogs
        if (!isAdmin) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        // Don't filter by published status - return all blogs
      } else {
        filters.isPublished = published === "true";
      }
    } else {
      // By default, only return published blogs for public consumption
      filters.isPublished = true;
    }

    const blogs = await prisma.blog.findMany({
      where: filters,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        publishedAt: "desc",
      },
    });

    return NextResponse.json(blogs);
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return NextResponse.json(
      { error: "Failed to fetch blogs" },
      { status: 500 }
    );
  }
}

// POST a new blog post
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be logged in to create a blog post" },
        { status: 401 }
      );
    }

    // Check if user is an admin
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only administrators can create blog posts" },
        { status: 403 }
      );
    }

    const data = await request.json();

    // Process tags from comma-separated string to array
    let tags: string[] = [];
    if (typeof data.tags === "string") {
      tags = data.tags
        .split(",")
        .map((tag: string) => tag.trim())
        .filter(Boolean);
    } else if (Array.isArray(data.tags)) {
      tags = data.tags;
    }

    // Set published date if the blog is published
    const publishedAt = data.isPublished ? new Date() : null;

    // Check if the user exists in the database
    let authorId = session.user.id;
    const userExists = await prisma.user.findUnique({
      where: { id: authorId },
      select: { id: true },
    });

    // If user doesn't exist, use the admin user from the database
    if (!userExists) {
      const adminUser = await prisma.user.findFirst({
        where: { role: "ADMIN" },
        select: { id: true },
      });

      if (adminUser) {
        authorId = adminUser.id;
      } else {
        return NextResponse.json(
          { error: "Failed to create blog post: No valid author found" },
          { status: 500 }
        );
      }
    }

    const blog = await prisma.blog.create({
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        coverImage: data.coverImage || null,
        categoryId: data.categoryId,
        authorId: authorId,
        stemCategory: data.stemCategory || "GENERAL",
        tags,
        isPublished: data.isPublished || false,
        publishedAt,
        readingTime: Math.ceil(data.content.split(" ").length / 200), // Rough estimate: 200 words per minute
      },
    });

    return NextResponse.json(blog, { status: 201 });
  } catch (error: any) {
    console.error("Error creating blog post:", error);

    // Handle unique constraint violations (e.g., duplicate slug)
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "A blog with this slug already exists" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create blog post" },
      { status: 500 }
    );
  }
}
