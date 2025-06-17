# Next.js Sync Dynamic API Fixes

This document explains the fixes implemented to resolve the "sync dynamic APIs" errors in the TechTots STEM store.

## Issue Description

The application was experiencing several errors related to accessing dynamic route parameters and search parameters synchronously in Next.js:

```
Error: Route "/api/products/combined/[slug]" used `params.slug`. `params` should be awaited before using its properties.
```

These errors occur because in Next.js 13+, dynamic route parameters and search parameters are now Promise-like objects that need to be awaited before accessing their properties.

## Files Fixed

1. **Checkout Confirmation Page**

   - File: `app/checkout/confirmation/page.tsx`
   - Issue: Accessing `searchParams.orderId` without awaiting
   - Fix: Added `await` to `searchParams` and stored in a variable

2. **Order Details Page**

   - File: `app/account/orders/[orderId]/page.tsx`
   - Issues:
     - Accessing `params.orderId` in `generateMetadata` without awaiting
     - Accessing `params.orderId` in the page component without awaiting
   - Fix: Added `await` to `params.orderId` in both locations

3. **Combined Products API Route**
   - File: `app/api/products/combined/[slug]/route.ts`
   - Issue: Accessing `params.slug` without awaiting
   - Fix: Added `await` to `params.slug` in all locations

## How to Fix Similar Issues

When working with Next.js 13+ and encountering "sync dynamic APIs" errors:

1. Always use `await` when accessing properties of:

   - `params` (route parameters)
   - `searchParams` (query parameters)

2. Pattern to follow:

   ```typescript
   // For route parameters
   const slug = await params.slug;

   // For search parameters
   const query = await searchParams.query;
   ```

3. Alternative pattern:
   ```typescript
   // Destructure after awaiting
   const { slug } = await params;
   const { query } = await searchParams;
   ```

## Why This Happens

Next.js 13+ made these objects Promise-like to support streaming and server components. This change ensures that route parameters and search parameters can be accessed asynchronously, allowing the framework to optimize rendering and data fetching.

## Testing the Fix

The fixes have been applied and the application should now run without the "sync dynamic APIs" errors. You can verify this by:

1. Visiting the checkout confirmation page with an order ID
2. Viewing order details in the account section
3. Browsing product and book details

If any similar errors appear in other parts of the application, apply the same pattern of awaiting the parameters before accessing their properties.
