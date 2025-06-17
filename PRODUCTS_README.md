# Products & Books Functionality

This document explains how products and books are handled in the TechTots application.

## Issue Fixed

The application was showing products on the website (/products page) even though there were no products in the database. This was happening because:

1. The books API route (`app/api/books/route.ts`) has an auto-seeding function called `ensureBooksExist()` that creates default books if none exist in the database.
2. The products page (`app/products/page.tsx`) combines both products and books into a single list for display.

## Data Structure

The application uses two separate database models for products and books:

1. **Products**: Regular store items like toys, kits, etc.
2. **Books**: Educational books that are displayed alongside products

## How Products Are Displayed

The products page (`app/products/page.tsx`) does the following:

1. Fetches products from the database via the API
2. Fetches books from the database via the API
3. Converts books to a product-like format
4. Combines both lists and displays them together

## Auto-Seeding Functionality

The application has auto-seeding functionality in the books API route that creates default books if none exist in the database. This is why you could see items on the products page even when the database was empty.

## Seeding Scripts

We've created two scripts to help manage the product and book data:

1. **scripts/seed-products.js**: Seeds sample products into the database
2. **scripts/check-products.js**: Checks what products and books exist in the database

## How to Use

### Check Database Contents

```bash
node scripts/check-products.js
```

### Seed Sample Products

```bash
node scripts/seed-products.js
```

## Important Notes

1. The books API route will automatically create default books if none exist in the database. This happens when the API is called.
2. The products API does not have auto-seeding functionality. Products must be added manually or via the seeding script.
3. Both products and books are displayed together on the products page.

## Recommended Approach

For consistency, consider implementing auto-seeding for products as well, or removing the auto-seeding from the books API and relying solely on the seeding scripts for both products and books.
