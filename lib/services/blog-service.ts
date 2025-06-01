import { db } from "@/lib/db";
import { StemCategory } from "@/app/generated/prisma/index";

export interface CreateBlogInput {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  categoryId: string;
  authorId: string;
  stemCategory: StemCategory;
  tags: string[];
  isPublished: boolean;
  publishedAt?: Date;
}

export interface UpdateBlogInput
  extends Partial<Omit<CreateBlogInput, "authorId">> {
  id: string;
}

export const blogService = {
  /**
   * Create a new blog post
   */
  async createBlog(data: CreateBlogInput) {
    return db.blog.create({
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: data.content,
        coverImage: data.coverImage,
        categoryId: data.categoryId,
        authorId: data.authorId,
        stemCategory: data.stemCategory,
        tags: data.tags,
        isPublished: data.isPublished,
        publishedAt: data.isPublished ? data.publishedAt || new Date() : null,
      },
    });
  },

  /**
   * Update an existing blog post
   */
  async updateBlog(data: UpdateBlogInput) {
    const { id, ...updateData } = data;

    // If publishing for the first time, set publishedAt to now
    if (updateData.isPublished) {
      const blog = await db.blog.findUnique({ where: { id } });
      if (!blog?.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }

    return db.blog.update({
      where: { id },
      data: updateData,
    });
  },

  /**
   * Delete a blog post
   */
  async deleteBlog(id: string) {
    return db.blog.delete({
      where: { id },
    });
  },

  /**
   * Get a blog post by ID
   */
  async getBlogById(id: string) {
    return db.blog.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        category: true,
      },
    });
  },

  /**
   * Get a blog post by slug
   */
  async getBlogBySlug(slug: string) {
    return db.blog.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        category: true,
      },
    });
  },

  /**
   * Get all blog posts with optional filtering
   */
  async getAllBlogs({
    stemCategory,
    categoryId,
    authorId,
    isPublished = true,
    take = 10,
    skip = 0,
  }: {
    stemCategory?: StemCategory;
    categoryId?: string;
    authorId?: string;
    isPublished?: boolean;
    take?: number;
    skip?: number;
  } = {}) {
    const where: any = {};

    if (stemCategory) {
      where.stemCategory = stemCategory;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (authorId) {
      where.authorId = authorId;
    }

    if (isPublished !== undefined) {
      where.isPublished = isPublished;
    }

    const [blogs, count] = await Promise.all([
      db.blog.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          category: true,
        },
        orderBy: { publishedAt: "desc" },
        take,
        skip,
      }),
      db.blog.count({ where }),
    ]);

    return { blogs, count };
  },
};
