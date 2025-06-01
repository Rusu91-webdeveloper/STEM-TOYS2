"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Save, Upload, X } from "lucide-react";
import Link from "next/link";

interface BlogEditPageProps {
  params: {
    id: string;
  };
}

// Mock data for demonstration
const mockBlogs = [
  {
    id: "1",
    title: "Top 10 STEM Toys for Early Childhood Development",
    slug: "top-10-stem-toys-early-childhood",
    excerpt:
      "Discover the best STEM toys that help preschoolers develop essential early skills while having fun.",
    content:
      "This is a detailed blog post content about STEM toys for early childhood development...",
    coverImage: "/images/category_banner_science_01.png",
    categoryId: "early-learning",
    stemCategory: "SCIENCE",
    tags: "toys, preschool, development, science",
    isPublished: true,
    publishedAt: new Date("2023-05-15"),
    author: "Emily Johnson",
  },
  {
    id: "2",
    title: "How Coding Toys Prepare Children for the Future",
    slug: "coding-toys-prepare-children-future",
    excerpt:
      "Learn how coding toys and games can help develop computational thinking and prepare kids for tomorrow's jobs.",
    content: "This is a detailed blog post content about coding toys...",
    coverImage: "/images/category_banner_technology_01.png",
    categoryId: "stem-activities",
    stemCategory: "TECHNOLOGY",
    tags: "coding, technology, future skills",
    isPublished: true,
    publishedAt: new Date("2023-04-28"),
    author: "Michael Chen",
  },
];

export default function EditBlogPage({ params }: BlogEditPageProps) {
  const router = useRouter();
  const { id } = params;

  const [blogData, setBlogData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    coverImage: "",
    categoryId: "",
    stemCategory: "GENERAL",
    tags: "",
    isPublished: false,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch blog data
  useEffect(() => {
    const fetchBlogData = async () => {
      try {
        // In a real app, this would be an API call
        // For demo, we're using mock data
        const blog = mockBlogs.find((blog) => blog.id === id);

        if (blog) {
          setBlogData({
            title: blog.title,
            slug: blog.slug,
            excerpt: blog.excerpt,
            content: blog.content,
            coverImage: blog.coverImage,
            categoryId: blog.categoryId,
            stemCategory: blog.stemCategory,
            tags: blog.tags,
            isPublished: blog.isPublished,
          });
        } else {
          // Blog not found
          console.error("Blog not found");
          router.push("/admin/blog");
        }
      } catch (error) {
        console.error("Error fetching blog data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogData();
  }, [id, router]);

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setBlogData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle checkbox change
  const handleCheckboxChange = (checked: boolean) => {
    setBlogData((prev) => ({
      ...prev,
      isPublished: checked,
    }));
  };

  // Handle select change
  const handleSelectChange = (name: string, value: string) => {
    setBlogData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // This would be an API call in a real application
      console.log("Updating blog data:", blogData);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Success - redirect to blog management page
      router.push("/admin/blog");
    } catch (error) {
      console.error("Error updating blog post:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Loading blog data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex items-center mb-8">
        <Button
          variant="ghost"
          className="mr-4"
          asChild>
          <Link href="/admin/blog">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Edit Blog Post</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Blog Content</CardTitle>
                <CardDescription>
                  Edit your blog post content here.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    name="title"
                    value={blogData.title}
                    onChange={handleChange}
                    placeholder="Enter blog title"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    name="slug"
                    value={blogData.slug}
                    onChange={handleChange}
                    placeholder="url-friendly-slug"
                    required
                  />
                  <p className="text-sm text-muted-foreground">
                    This will be used in the URL: blog/post/{blogData.slug}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    name="excerpt"
                    value={blogData.excerpt}
                    onChange={handleChange}
                    placeholder="Brief summary of the blog post"
                    rows={3}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    name="content"
                    value={blogData.content}
                    onChange={handleChange}
                    placeholder="Write your blog post content here..."
                    rows={15}
                    required
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Publishing Options</CardTitle>
                <CardDescription>
                  Configure publishing settings for your blog post.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isPublished"
                    checked={blogData.isPublished}
                    onCheckedChange={handleCheckboxChange}
                  />
                  <Label htmlFor="isPublished">
                    {blogData.isPublished ? "Published" : "Draft"}
                  </Label>
                </div>

                <div className="space-y-2 pt-2">
                  <Label htmlFor="stemCategory">STEM Category</Label>
                  <Select
                    value={blogData.stemCategory}
                    onValueChange={(value) =>
                      handleSelectChange("stemCategory", value)
                    }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select STEM category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SCIENCE">Science (S)</SelectItem>
                      <SelectItem value="TECHNOLOGY">Technology (T)</SelectItem>
                      <SelectItem value="ENGINEERING">
                        Engineering (E)
                      </SelectItem>
                      <SelectItem value="MATHEMATICS">
                        Mathematics (M)
                      </SelectItem>
                      <SelectItem value="GENERAL">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoryId">Content Category</Label>
                  <Select
                    value={blogData.categoryId}
                    onValueChange={(value) =>
                      handleSelectChange("categoryId", value)
                    }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select content category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="early-learning">
                        Early Learning
                      </SelectItem>
                      <SelectItem value="educational-toys">
                        Educational Toys
                      </SelectItem>
                      <SelectItem value="stem-activities">
                        STEM Activities
                      </SelectItem>
                      <SelectItem value="parenting">Parenting Tips</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    name="tags"
                    value={blogData.tags}
                    onChange={handleChange}
                    placeholder="tag1, tag2, tag3"
                  />
                  <p className="text-sm text-muted-foreground">
                    Separate tags with commas
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cover Image</CardTitle>
                <CardDescription>
                  Update the cover image for your blog post.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {blogData.coverImage ? (
                  <div className="space-y-4">
                    <div className="border rounded-lg overflow-hidden">
                      <img
                        src={blogData.coverImage}
                        alt="Blog cover"
                        className="w-full h-auto"
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm">
                        Change Image
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <div className="flex flex-col items-center space-y-2">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Drag and drop your image here or click to browse
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm">
                        Upload Image
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardFooter className="flex justify-between pt-6">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => router.push("/admin/blog")}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
