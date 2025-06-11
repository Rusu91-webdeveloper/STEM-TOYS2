import type { Product } from "@/types/product";

/**
 * Get a product by slug
 */
export async function getProduct(slug: string): Promise<Product | null> {
  try {
    // Encode the slug to handle special characters
    const encodedSlug = encodeURIComponent(slug);

    // In server components, we need to ensure absolute URLs
    let url: string;

    if (typeof window !== "undefined") {
      // Browser environment
      url = `${window.location.origin}/api/products/${encodedSlug}`;
    } else {
      // Server environment - use environment variable or default to localhost
      const apiBase =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

      // Make sure we have a complete URL with protocol
      const baseUrl = apiBase.startsWith("http")
        ? apiBase
        : `http://${apiBase}`;

      // Remove trailing slash if present
      const cleanBaseUrl = baseUrl.endsWith("/")
        ? baseUrl.slice(0, -1)
        : baseUrl;

      url = `${cleanBaseUrl}/api/products/${encodedSlug}`;
    }

    console.log(`Fetching product with URL: ${url}`);

    const response = await fetch(url, {
      next: {
        // Use tags for more precise invalidation
        tags: [`product-${slug}`, "products"],
        revalidate: 3600, // Revalidate every hour
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch product: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

/**
 * Get all products
 */
export async function getProducts(
  options: {
    category?: string;
    sort?: string;
    limit?: number;
  } = {}
): Promise<Product[]> {
  const { category, sort, limit } = options;

  try {
    // Build query string
    const params = new URLSearchParams();
    if (category) params.append("category", category);
    if (sort) params.append("sort", sort);
    if (limit) params.append("limit", limit.toString());

    const queryString = params.toString() ? `?${params.toString()}` : "";

    // In server components, we need to ensure absolute URLs
    let url: string;

    if (typeof window !== "undefined") {
      // Browser environment
      url = `${window.location.origin}/api/products${queryString}`;
    } else {
      // Server environment - use environment variable or default to localhost
      const apiBase =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

      // Make sure we have a complete URL with protocol
      const baseUrl = apiBase.startsWith("http")
        ? apiBase
        : `http://${apiBase}`;

      // Remove trailing slash if present
      const cleanBaseUrl = baseUrl.endsWith("/")
        ? baseUrl.slice(0, -1)
        : baseUrl;

      url = `${cleanBaseUrl}/api/products${queryString}`;
    }

    console.log(`Fetching products with URL: ${url}`);

    const response = await fetch(url, {
      next: {
        // Use tags for more precise invalidation
        tags: ["products", category ? `category-${category}` : ""],
        revalidate: 3600, // Revalidate every hour
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `API error (${response.status}): ${response.statusText}`,
        errorText
      );
      throw new Error(
        `Failed to fetch products: ${response.statusText}. Details: ${errorText}`
      );
    }

    const data = await response.json();
    console.log("API response structure:", Object.keys(data));

    // API returns { count, products }, but we need to return just the products array
    if (data.products && Array.isArray(data.products)) {
      console.log(`Retrieved ${data.products.length} products from API`);
      return data.products;
    } else if (Array.isArray(data)) {
      console.log(`Retrieved ${data.length} products from API (array format)`);
      return data;
    } else {
      console.error("Unexpected API response format:", data);
      return [];
    }
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}
