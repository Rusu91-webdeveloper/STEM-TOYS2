# Categories and Products Setup Guide

This document explains how to set up and manage categories and products in the TechTots STEM store.

## Issue Fixed

The store was initially set up with only one category ("Cărți Educaționale" / "Educational Books") when it should have multiple STEM-related categories. We've added the missing categories and seeded products for each category.

## Categories Structure

The store now has the following categories:

1. **Science**

   - Description: Discover the wonders of science with hands-on experiments and educational kits
   - Slug: science

2. **Technology**

   - Description: Explore coding, robotics, and digital innovation with our technology toys
   - Slug: technology

3. **Engineering**

   - Description: Build, design, and problem-solve with our engineering construction sets
   - Slug: engineering

4. **Mathematics**

   - Description: Games and puzzles that make learning math concepts fun and engaging
   - Slug: mathematics

5. **Cărți Educaționale** (Educational Books)
   - Description: Cărți educaționale pentru copii și adulți
   - Slug: educational-books

## Products

Each category now has at least one product:

- **Science**: Chemistry Lab Kit
- **Technology**: Coding Robot for Beginners
- **Engineering**: Bridge Builder Engineering Kit
- **Mathematics**: Mathematical Puzzle Cube Set
- **Educational Books**: Educational Book Set

## Scripts Created

We've created several scripts to help manage categories and products:

1. **Check Categories**

   ```bash
   node scripts/check-categories.js
   ```

   This script displays all categories in the database.

2. **Seed Categories**

   ```bash
   node scripts/seed-categories.js
   ```

   This script adds the missing STEM categories (Science, Technology, Engineering, Mathematics).

3. **Check Products**

   ```bash
   node scripts/check-products.js
   ```

   This script displays all products and their associated categories.

4. **Seed Products**
   ```bash
   node scripts/seed-products.js
   ```
   This script adds sample products for each category.

## How to Add New Categories

To add a new category:

1. Edit `scripts/seed-categories.js` and add your new category to the `categories` array
2. Run `node scripts/seed-categories.js` to create the category
3. Verify with `node scripts/check-categories.js`

## How to Add New Products

To add new products:

1. Edit `scripts/seed-products.js` and add your new product to the `products` array
2. Make sure to set the `categoryId` using the `categoryMap.get("slug")` method
3. Run `node scripts/seed-products.js` to create the product
4. Verify with `node scripts/check-products.js`

## Troubleshooting

If you encounter issues with categories or products:

1. Check that the database is properly connected
2. Verify that categories exist before adding products
3. Check for duplicate slugs (must be unique)
4. Ensure all required fields are provided for categories and products

## Database Schema

Categories and products follow this schema:

```prisma
model Category {
  id          String    @id @default(cuid())
  name        String
  slug        String    @unique
  description String?
  image       String?
  products    Product[]
  metadata    Json?
}

model Product {
  id             String   @id @default(cuid())
  name           String
  slug           String   @unique
  description    String?
  price          Float
  compareAtPrice Float?
  images         String[]
  category       Category? @relation(fields: [categoryId], references: [id])
  categoryId     String?
  tags           String[]
  attributes     Json?
  metadata       Json?
  stockQuantity  Int      @default(0)
  weight         Float?
  dimensions     Json?
  sku            String?
  barcode        String?
  isActive       Boolean  @default(true)
  isFeatured     Boolean  @default(false)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}
```
