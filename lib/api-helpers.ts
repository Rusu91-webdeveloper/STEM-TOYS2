/**
 * Helper functions for API routes
 */

/**
 * Process form data from multipart/form-data requests
 * Handles conversion of strings to appropriate types for product data
 */
export async function handleFormData(
  formData: FormData
): Promise<Record<string, any>> {
  const data: Record<string, any> = {};

  // Extract all form fields
  for (const [key, value] of formData.entries()) {
    // Skip null or undefined values
    if (value === null || value === undefined) continue;

    // Handle file objects separately (for uploadthing or other file uploads)
    if (typeof value === "object" && "arrayBuffer" in value) {
      // This is a file, store it as is
      if (!data.files) data.files = {};
      data.files[key] = value;
      continue;
    }

    // Handle special fields that need parsing
    if (key === "images" && typeof value === "string") {
      try {
        data[key] = JSON.parse(value);
      } catch (e) {
        console.warn("Could not parse images JSON", e);
        data[key] = [];
      }
      continue;
    }

    if (key === "tags" && typeof value === "string") {
      try {
        data[key] = JSON.parse(value);
      } catch (e) {
        console.warn("Could not parse tags JSON", e);
        data[key] = [];
      }
      continue;
    }

    if (key === "attributes" && typeof value === "string") {
      try {
        data[key] = JSON.parse(value);
      } catch (e) {
        console.warn("Could not parse attributes JSON", e);
        data[key] = {};
      }
      continue;
    }

    // Convert string booleans to actual booleans
    if (value === "true" || value === "false") {
      data[key] = value === "true";
      continue;
    }

    // Try to convert number strings to actual numbers
    if (key === "price" || key === "compareAtPrice") {
      const num = parseFloat(value as string);
      if (!isNaN(num)) {
        data[key] = num;
        continue;
      }
    }

    // Default - store value as is
    data[key] = value;
  }

  return data;
}
