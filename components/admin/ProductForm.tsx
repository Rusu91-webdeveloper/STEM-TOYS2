"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { Loader2, Plus, X, Upload, Image } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { slugify } from "@/lib/utils";

// Define form schema
const formSchema = z.object({
  name: z.string().min(3, {
    message: "Product name must be at least 3 characters.",
  }),
  slug: z
    .string()
    .min(3, {
      message: "Slug must be at least 3 characters.",
    })
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message:
        "Slug must contain only lowercase letters, numbers, and hyphens.",
    }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  price: z.coerce.number().positive({
    message: "Price must be a positive number.",
  }),
  compareAtPrice: z.coerce.number().positive().optional(),
  images: z.array(z.string()).min(1, {
    message: "At least one image is required.",
  }),
  categoryId: z.string().min(1, {
    message: "Category is required.",
  }),
  tags: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  // SEO fields
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.array(z.string()).default([]),
  // STEM specific fields
  ageRange: z.string().optional(),
  stemCategory: z.string().optional(),
  difficultyLevel: z.string().optional(),
  learningObjectives: z.array(z.string()).default([]),
});

type FormValues = z.infer<typeof formSchema>;

// Mock categories - in production, these would be fetched from the database
const mockCategories = [
  { id: "cat_1", name: "Science" },
  { id: "cat_2", name: "Technology" },
  { id: "cat_3", name: "Engineering" },
  { id: "cat_4", name: "Mathematics" },
];

interface ProductFormProps {
  initialData?: any;
  isEditing?: boolean;
}

export default function ProductForm({
  initialData,
  isEditing = false,
}: ProductFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [newLearningObjective, setNewLearningObjective] = useState("");
  const [categories, setCategories] = useState(mockCategories);

  // Form hook
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: "",
      slug: "",
      description: "",
      price: 0,
      compareAtPrice: undefined,
      images: [],
      categoryId: "",
      tags: [],
      isActive: true,
      metaTitle: "",
      metaDescription: "",
      metaKeywords: [],
      ageRange: "",
      stemCategory: "",
      difficultyLevel: "",
      learningObjectives: [],
    },
  });

  // Auto-generate slug from name
  useEffect(() => {
    const name = form.watch("name");
    if (name && !isEditing) {
      form.setValue("slug", slugify(name));
    }

    // Auto-generate meta title from name if empty
    if (name && !form.watch("metaTitle")) {
      form.setValue("metaTitle", name);
    }
  }, [form.watch("name"), form, isEditing]);

  // Auto-generate meta description from description if empty
  useEffect(() => {
    const description = form.watch("description");
    if (description && !form.watch("metaDescription")) {
      // Limit to 160 characters for SEO best practices
      form.setValue("metaDescription", description.substring(0, 160));
    }
  }, [form.watch("description"), form]);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        } else {
          console.error("Failed to fetch categories");
          // Fallback to mock data if API fails
          setCategories(mockCategories);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        // Fallback to mock data if API fails
        setCategories(mockCategories);
      }
    };

    fetchCategories();
  }, []);

  const addTag = () => {
    if (newTag.trim() !== "") {
      const currentTags = form.getValues("tags") || [];
      if (!currentTags.includes(newTag.trim())) {
        form.setValue("tags", [...currentTags, newTag.trim()]);
      }
      setNewTag("");
    }
  };

  const removeTag = (tag: string) => {
    const currentTags = form.getValues("tags");
    form.setValue(
      "tags",
      currentTags.filter((t) => t !== tag)
    );
  };

  const addLearningObjective = () => {
    if (newLearningObjective.trim() !== "") {
      const currentObjectives = form.getValues("learningObjectives") || [];
      if (!currentObjectives.includes(newLearningObjective.trim())) {
        form.setValue("learningObjectives", [
          ...currentObjectives,
          newLearningObjective.trim(),
        ]);
      }
      setNewLearningObjective("");
    }
  };

  const removeLearningObjective = (objective: string) => {
    const currentObjectives = form.getValues("learningObjectives");
    form.setValue(
      "learningObjectives",
      currentObjectives.filter((o) => o !== objective)
    );
  };

  // Mock function for image upload - would be replaced with a real upload service
  const handleImageUpload = () => {
    // In a real app, this would upload to a service like Uploadthing
    const mockImageUrl = `https://placehold.co/800x600/4F46E5/FFFFFF.png?text=Product+Image+${Date.now()}`;
    const currentImages = form.getValues("images") || [];
    form.setValue("images", [...currentImages, mockImageUrl]);
  };

  const removeImage = (imageUrl: string) => {
    const currentImages = form.getValues("images");
    form.setValue(
      "images",
      currentImages.filter((img) => img !== imageUrl)
    );
  };

  // Form submission
  const onSubmit = async (data: FormValues) => {
    try {
      setIsLoading(true);

      // API endpoint and method based on whether we're editing or creating
      const endpoint = isEditing
        ? "/api/admin/products"
        : "/api/admin/products";

      const method = isEditing ? "PUT" : "POST";

      // If editing, make sure to include the product ID
      const submitData = isEditing ? { ...data, id: initialData.id } : data;

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Something went wrong");
      }

      toast({
        title: isEditing ? "Product updated" : "Product created",
        description: `${data.name} has been ${isEditing ? "updated" : "created"} successfully.`,
      });

      // Redirect back to products list
      router.push("/admin/products");
      router.refresh();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-6">
          <Tabs
            defaultValue="general"
            className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="images">Images</TabsTrigger>
              <TabsTrigger value="attributes">Attributes</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
            </TabsList>

            {/* General Tab */}
            <TabsContent
              value="general"
              className="space-y-4 py-4">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Enter the main details of your product.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Product name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Slug</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="product-slug"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Used in the URL. Auto-generated from name.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Detailed product description"
                            className="min-h-32"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="compareAtPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Compare At Price</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                              value={field.value || ""}
                              onChange={(e) => {
                                const value = e.target.value
                                  ? parseFloat(e.target.value)
                                  : undefined;
                                field.onChange(value);
                              }}
                            />
                          </FormControl>
                          <FormDescription>
                            Original price for showing discounts.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem
                                key={category.id}
                                value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Active Product
                          </FormLabel>
                          <FormDescription>
                            Enable to make this product visible on your store.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div>
                    <FormLabel>Tags</FormLabel>
                    <div className="flex items-center space-x-2 mt-1.5">
                      <Input
                        placeholder="Add a tag"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addTag();
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={addTag}
                        variant="outline"
                        size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {form.watch("tags").map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary">
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2">
                            <X className="h-3 w-3" />
                            <span className="sr-only">Remove</span>
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Images Tab */}
            <TabsContent
              value="images"
              className="space-y-4 py-4">
              <Card>
                <CardHeader>
                  <CardTitle>Product Images</CardTitle>
                  <CardDescription>
                    Upload images for your product. The first image will be the
                    main image.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Button
                      type="button"
                      onClick={handleImageUpload}
                      className="w-full h-32 border-dashed border-2"
                      variant="outline">
                      <div className="flex flex-col items-center justify-center">
                        <Upload className="h-8 w-8 mb-2" />
                        <span>Upload Image</span>
                      </div>
                    </Button>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                      {form.watch("images").map((image, index) => (
                        <div
                          key={image}
                          className="relative aspect-square rounded-md overflow-hidden border">
                          <img
                            src={image}
                            alt={`Product image ${index + 1}`}
                            className="object-cover w-full h-full"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(image)}
                            className="absolute top-1 right-1 rounded-full bg-destructive p-1 text-white">
                            <X className="h-4 w-4" />
                            <span className="sr-only">Remove</span>
                          </button>
                          {index === 0 && (
                            <div className="absolute bottom-0 left-0 right-0 bg-primary text-primary-foreground text-xs py-1 text-center">
                              Main Image
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {form.formState.errors.images && (
                      <p className="text-destructive text-sm">
                        {form.formState.errors.images.message}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Attributes Tab */}
            <TabsContent
              value="attributes"
              className="space-y-4 py-4">
              <Card>
                <CardHeader>
                  <CardTitle>STEM-Specific Attributes</CardTitle>
                  <CardDescription>
                    Add educational information about your product.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="ageRange"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age Range</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select age range" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="3-5">3-5 years</SelectItem>
                            <SelectItem value="6-8">6-8 years</SelectItem>
                            <SelectItem value="9-12">9-12 years</SelectItem>
                            <SelectItem value="13-16">13-16 years</SelectItem>
                            <SelectItem value="17+">17+ years</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Recommended age range for this product.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="stemCategory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>STEM Category</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select STEM category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="science">Science</SelectItem>
                            <SelectItem value="technology">
                              Technology
                            </SelectItem>
                            <SelectItem value="engineering">
                              Engineering
                            </SelectItem>
                            <SelectItem value="mathematics">
                              Mathematics
                            </SelectItem>
                            <SelectItem value="multiple">
                              Multiple Areas
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Primary STEM discipline this product focuses on.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="difficultyLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Difficulty Level</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select difficulty level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">
                              Intermediate
                            </SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                            <SelectItem value="multiple">
                              Multiple Levels
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          How challenging is this product to use?
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div>
                    <FormLabel>Learning Objectives</FormLabel>
                    <div className="flex items-center space-x-2 mt-1.5">
                      <Input
                        placeholder="Add a learning objective"
                        value={newLearningObjective}
                        onChange={(e) =>
                          setNewLearningObjective(e.target.value)
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addLearningObjective();
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={addLearningObjective}
                        variant="outline"
                        size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <FormDescription>
                      What will children learn by using this product?
                    </FormDescription>
                    <div className="flex flex-col gap-2 mt-3">
                      {form.watch("learningObjectives").map((objective) => (
                        <div
                          key={objective}
                          className="flex items-center justify-between rounded-md border px-3 py-2">
                          <span>{objective}</span>
                          <button
                            type="button"
                            onClick={() => removeLearningObjective(objective)}
                            className="text-destructive">
                            <X className="h-4 w-4" />
                            <span className="sr-only">Remove</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* SEO Tab */}
            <TabsContent
              value="seo"
              className="space-y-4 py-4">
              <Card>
                <CardHeader>
                  <CardTitle>Search Engine Optimization</CardTitle>
                  <CardDescription>
                    Optimize your product for search engines to increase
                    visibility.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="metaTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meta Title</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="SEO title"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Appears in browser tabs and search results. Defaults
                          to product name.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="metaDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meta Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Brief description for search engines"
                            className="min-h-20"
                            maxLength={160}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          A short summary that appears in search results. Limit
                          to 160 characters. Defaults to first part of product
                          description.
                        </FormDescription>
                        <div className="text-xs text-muted-foreground mt-1">
                          {field.value?.length || 0}/160 characters
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div>
                    <FormLabel>Meta Keywords</FormLabel>
                    <div className="flex items-center space-x-2 mt-1.5">
                      <Input
                        placeholder="Add a keyword"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            if (newTag.trim() !== "") {
                              const currentKeywords =
                                form.getValues("metaKeywords") || [];
                              if (!currentKeywords.includes(newTag.trim())) {
                                form.setValue("metaKeywords", [
                                  ...currentKeywords,
                                  newTag.trim(),
                                ]);
                              }
                              setNewTag("");
                            }
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={() => {
                          if (newTag.trim() !== "") {
                            const currentKeywords =
                              form.getValues("metaKeywords") || [];
                            if (!currentKeywords.includes(newTag.trim())) {
                              form.setValue("metaKeywords", [
                                ...currentKeywords,
                                newTag.trim(),
                              ]);
                            }
                            setNewTag("");
                          }
                        }}
                        variant="outline"
                        size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <FormDescription>
                      Keywords related to this product. These will help with
                      SEO.
                    </FormDescription>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {form.watch("metaKeywords").map((keyword) => (
                        <Badge
                          key={keyword}
                          variant="secondary">
                          {keyword}
                          <button
                            type="button"
                            onClick={() => {
                              const currentKeywords =
                                form.getValues("metaKeywords");
                              form.setValue(
                                "metaKeywords",
                                currentKeywords.filter((k) => k !== keyword)
                              );
                            }}
                            className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2">
                            <X className="h-3 w-3" />
                            <span className="sr-only">Remove</span>
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="border rounded-md p-4 bg-muted/50">
                    <h3 className="font-medium mb-2">SEO Preview</h3>
                    <div className="space-y-1.5">
                      <div className="text-blue-600 text-lg font-medium">
                        {form.watch("metaTitle") ||
                          form.watch("name") ||
                          "Product Title"}
                      </div>
                      <div className="text-green-700 text-sm">
                        yourwebsite.com/products/
                        {form.watch("slug") || "product-slug"}
                      </div>
                      <div className="text-sm text-gray-700">
                        {form.watch("metaDescription") ||
                          form.watch("description")?.substring(0, 160) ||
                          "Your product description will appear here. Make sure to provide a compelling description to attract customers."}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/products")}
              disabled={isLoading}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Update Product" : "Create Product"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
