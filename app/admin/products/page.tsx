import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  MoreHorizontal,
  ArrowUpDown,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Add this interface at the top of the file with the imports
interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
}

// Mock products data for development
const products = [
  {
    id: "P001",
    name: "Robotic Building Kit",
    price: 59.99,
    category: "Technology",
    inventory: 32,
    status: "In Stock",
    featured: true,
    image: "https://placehold.co/400x300/4F46E5/FFFFFF.png?text=Robot+Kit",
  },
  {
    id: "P002",
    name: "Chemistry Lab Set",
    price: 49.99,
    category: "Science",
    inventory: 24,
    status: "In Stock",
    featured: true,
    image: "https://placehold.co/400x300/10B981/FFFFFF.png?text=Chemistry+Set",
  },
  {
    id: "P003",
    name: "Magnetic Building Tiles",
    price: 39.99,
    category: "Engineering",
    inventory: 18,
    status: "Low Stock",
    featured: true,
    image: "https://placehold.co/400x300/F59E0B/FFFFFF.png?text=Magnetic+Tiles",
  },
  {
    id: "P004",
    name: "Math Puzzle Game",
    price: 29.99,
    category: "Math",
    inventory: 27,
    status: "In Stock",
    featured: true,
    image: "https://placehold.co/400x300/3B82F6/FFFFFF.png?text=Math+Puzzle",
  },
  {
    id: "P005",
    name: "Coding Robot for Kids",
    price: 79.99,
    category: "Technology",
    inventory: 15,
    status: "Low Stock",
    featured: false,
    image: "https://placehold.co/400x300/EC4899/FFFFFF.png?text=Coding+Robot",
  },
  {
    id: "P006",
    name: "Solar System Model Kit",
    price: 45.99,
    category: "Science",
    inventory: 22,
    status: "In Stock",
    featured: false,
    image: "https://placehold.co/400x300/6366F1/FFFFFF.png?text=Solar+System",
  },
  {
    id: "P007",
    name: "Electronic Circuit Kit",
    price: 55.99,
    category: "Technology",
    inventory: 0,
    status: "Out of Stock",
    featured: false,
    image: "https://placehold.co/400x300/EF4444/FFFFFF.png?text=Circuit+Kit",
  },
  {
    id: "P008",
    name: "Microscope Kit",
    price: 65.99,
    category: "Science",
    inventory: 8,
    status: "Low Stock",
    featured: false,
    image: "https://placehold.co/400x300/06B6D4/FFFFFF.png?text=Microscope",
  },
];

// And update the getCategories function return type
async function getCategories(): Promise<Category[]> {
  try {
    // In server component, we can directly use db client
    // For demonstration, using mock data to avoid direct db import in server component
    // In production, you would use:
    // import { db } from '@/lib/db';
    // const categories = await db.category.findMany();
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/categories`,
      {
        cache: "no-store",
      }
    );

    if (!res.ok) {
      console.error("Failed to fetch categories");
      return [];
    }

    return await res.json();
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export default async function ProductsPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Products</h1>
        <Button
          className="flex items-center gap-2"
          asChild>
          <Link href="/admin/products/create">
            <Plus className="h-4 w-4" />
            <span>Add Product</span>
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex w-full max-w-sm items-center space-x-2">
              <Input
                type="search"
                placeholder="Search products..."
                className="w-full"
              />
              <Button
                variant="outline"
                size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem
                      key={category.id}
                      value={category.slug}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="in-stock">In Stock</SelectItem>
                  <SelectItem value="low-stock">Low Stock</SelectItem>
                  <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b text-xs font-medium text-muted-foreground">
                  <th className="px-4 py-3 text-left">
                    <div className="flex items-center gap-1">
                      <span>Product</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left">Category</th>
                  <th className="px-4 py-3 text-left">
                    <div className="flex items-center gap-1">
                      <span>Price</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <div className="flex items-center gap-1">
                      <span>Inventory</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Featured</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b text-sm hover:bg-muted/50">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 overflow-hidden rounded-md">
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <Link
                            href={`/admin/products/${product.id}`}
                            className="font-medium text-primary hover:underline">
                            {product.name}
                          </Link>
                          <p className="text-xs text-muted-foreground">
                            ID: {product.id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">{product.category}</td>
                    <td className="px-4 py-4">${product.price.toFixed(2)}</td>
                    <td className="px-4 py-4">{product.inventory}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          product.status === "In Stock"
                            ? "bg-green-100 text-green-800"
                            : product.status === "Low Stock"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}>
                        {product.status === "In Stock" && (
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                        )}
                        {product.status === "Low Stock" && (
                          <AlertCircle className="mr-1 h-3 w-3" />
                        )}
                        {product.status === "Out of Stock" && (
                          <AlertCircle className="mr-1 h-3 w-3" />
                        )}
                        {product.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {product.featured ? (
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                          Featured
                        </span>
                      ) : (
                        <span>-</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild>
                          <Link href={`/admin/products/${product.id}/edit`}>
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">More</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/products/${product.id}`}>
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/products/${product.id}`}>
                                View on Site
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>Duplicate</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
