"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";

export default function TestProductForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Get form data
    const formData = new FormData(e.currentTarget);
    const productData = {
      name: formData.get("name") as string,
      slug:
        (formData.get("slug") as string) ||
        (formData.get("name") as string)
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, ""),
      description: formData.get("description") as string,
      price: parseFloat(formData.get("price") as string),
      images: [
        "https://placehold.co/400x300/4F46E5/FFFFFF.png?text=Test+Product",
      ],
      categoryId: formData.get("categoryId") as string,
      tags: [],
      isActive: true,
    };

    try {
      console.log("Making POST request to /api/admin/products");
      console.log("Product data:", productData);

      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
        credentials: "include",
      });

      console.log("POST response status:", response.status);
      console.log(
        "Response headers:",
        Object.fromEntries([...response.headers.entries()])
      );

      // Try to get the response text first to see raw response
      const responseText = await response.text();
      console.log("Raw response text:", responseText);

      // If it's valid JSON, parse it
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (jsonError) {
        console.error("Error parsing response as JSON:", jsonError);
        data = { text: responseText };
      }

      if (response.ok) {
        setResult({
          status: response.status,
          data,
        });
        toast({
          title: "Product created",
          description: "The product was created successfully",
        });
      } else {
        setError(`Error ${response.status}: ${data.error || "Unknown error"}`);
      }
    } catch (err: any) {
      console.error("Error in product creation:", err);
      setError(err.message || "An error occurred during product creation");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Simple Product Creation Test</CardTitle>
          <CardDescription>
            Create a product with minimal fields to test API connectivity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium mb-1">
                Product Name
              </label>
              <Input
                id="name"
                name="name"
                required
                placeholder="Test Product"
              />
            </div>
            <div>
              <label
                htmlFor="slug"
                className="block text-sm font-medium mb-1">
                Slug (optional)
              </label>
              <Input
                id="slug"
                name="slug"
                placeholder="test-product"
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave empty to generate from name
              </p>
            </div>
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium mb-1">
                Description
              </label>
              <Textarea
                id="description"
                name="description"
                required
                placeholder="Product description..."
              />
            </div>
            <div>
              <label
                htmlFor="price"
                className="block text-sm font-medium mb-1">
                Price
              </label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                required
                placeholder="19.99"
              />
            </div>
            <div>
              <label
                htmlFor="categoryId"
                className="block text-sm font-medium mb-1">
                Category ID
              </label>
              <Input
                id="categoryId"
                name="categoryId"
                required
                placeholder="cat_1"
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="mt-4">
              {isLoading ? "Creating Product..." : "Create Test Product"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Response</CardTitle>
            <CardDescription>Status: {result.status}</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(result.data, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
