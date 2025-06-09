import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// Schema for creating a blog post
const createBlogSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  excerpt: z.string().min(1, "Excerpt is required"),
  content: z.string().min(1, "Content is required"),
  coverImage: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  stemCategory: z.enum([
    "SCIENCE",
    "TECHNOLOGY",
    "ENGINEERING",
    "MATHEMATICS",
    "GENERAL",
  ]),
  tags: z.array(z.string()),
  isPublished: z.boolean().default(false),
});

// GET /api/admin/blogs - Get all blogs with optional filtering
export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated and is an admin
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const stemCategory = searchParams.get("stemCategory");
    const categoryId = searchParams.get("categoryId");
    const isPublished = searchParams.has("isPublished")
      ? searchParams.get("isPublished") === "true"
      : undefined;

    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Build query
    const where: any = {};
    if (stemCategory) {
      where.stemCategory = stemCategory;
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }
    if (isPublished !== undefined) {
      where.isPublished = isPublished;
    }

    // Execute query
    const [blogs, total] = await Promise.all([
      db.blog.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              name: true,
            },
          },
          category: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.blog.count({ where }),
    ]);

    return NextResponse.json({
      blogs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return NextResponse.json(
      { error: "Failed to fetch blogs" },
      { status: 500 }
    );
  }
}

// POST /api/admin/blogs - Create a new blog post
export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated and is an admin
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = createBlogSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { errors: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Create blog post
    const blog = await db.blog.create({
      data: {
        ...data,
        authorId: session.user.id,
        publishedAt: data.isPublished ? new Date() : null,
      },
    });

    return NextResponse.json(blog, { status: 201 });
  } catch (error) {
    console.error("Error creating blog:", error);
    return NextResponse.json(
      { error: "Failed to create blog post" },
      { status: 500 }
    );
  }
}
