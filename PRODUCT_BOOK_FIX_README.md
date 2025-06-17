# Product and Book Integration Fix

## Problem

When trying to view a book from the products page, the application was showing a 404 error. This was happening because:

1. The products page (`/products`) was correctly showing both products and books by combining them.
2. When clicking on a book, the application was trying to fetch it from `/api/products/[slug]` endpoint.
3. Since books are stored in a separate table and accessed via `/api/books` endpoint, the product endpoint couldn't find them.

## Solution

We implemented a unified approach to handle both products and books in the product detail page:

1. Created a new API endpoint `/api/products/combined/[slug]` that:

   - First checks the products table for the requested slug
   - If not found, checks the books table
   - Returns the item in a consistent product format

2. Added a new `getCombinedProduct()` function in `lib/api/products.ts` that:

   - Fetches from the combined endpoint
   - Handles both products and books in a unified way

3. Updated the `Product` type definition to include an `isBook` flag to differentiate books from regular products.

4. Modified the product detail page to use the new combined API function.

5. Updated the `ProductDetailClient` component to accept an `isBook` prop for specialized rendering.

## Benefits

- Users can now seamlessly browse and view both products and books from the products page.
- The code is more maintainable with a single unified approach to handle both types of items.
- The solution preserves the separation of products and books in the database while providing a unified interface.

## Files Modified

- `app/products/[slug]/page.tsx`: Updated to use the combined API
- `lib/api/products.ts`: Added `getCombinedProduct()` function
- `app/api/products/combined/[slug]/route.ts`: New API endpoint for combined lookup
- `features/products/components/ProductDetailClient.tsx`: Updated to accept isBook prop
- `types/product.ts`: Added isBook property to Product interface

## Testing

- Both books "Born for the Future" and "STEM Play for Neurodiverse Minds" now load correctly when accessed from the products page.
