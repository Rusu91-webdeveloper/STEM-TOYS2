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
import { db } from "@/lib/db";
import { ProductActionsDropdown } from "./components/ProductActionsDropdown";

// Add this interface at the top of the file with the imports
interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  isActive: boolean;
  parentId?: string | null;
}

interface Product {
  id: string;
  name: string;
  price: number;
  category: {
    name: string;
  };
  stockQuantity?: number;
  isActive: boolean;
  images: string[];
}

// And update the getCategories function return type
async function getCategories(): Promise<Category[]> {
  try {
    // Use db client directly in server component
    const categories = await db.category.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

// Function to fetch products from the database
async function getProducts(): Promise<Product[]> {
  try {
    // Use db client directly in server component
    const products = await db.product.findMany({
      include: {
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return products;
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export default async function ProductsPage() {
  const categories = await getCategories();
  const products = await getProducts();

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
        </CardContent>
      </Card>

      <div className="border rounded-md">
        <div className="w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-left align-middle font-medium">
                  <div className="flex items-center gap-1">
                    Product
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium">
                  <div className="flex items-center gap-1">
                    Category
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium">
                  <div className="flex items-center gap-1">
                    Price
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium">
                  <div className="flex items-center gap-1">
                    Inventory
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium">
                  <div className="flex items-center gap-1">
                    Status
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="h-12 px-4 text-right align-middle font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-8 text-center text-muted-foreground">
                    No products found
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b text-sm hover:bg-muted/50">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative h-10 w-10 overflow-hidden rounded-md">
                          <Image
                            src={
                              product.images[0] || "/placeholder-product.png"
                            }
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
                    <td className="px-4 py-4">
                      {product.category?.name || "N/A"}
                    </td>
                    <td className="px-4 py-4">${product.price.toFixed(2)}</td>
                    <td className="px-4 py-4">{product.stockQuantity || 0}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {product.isActive ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-4 w-4 text-red-500" />
                            <span>Inactive</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <ProductActionsDropdown productId={product.id} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
