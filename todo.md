# NextCommerce Project TODO

This document outlines the tasks to be completed for the NextCommerce project.

## Phase 1: Project Setup and Core Infrastructure

- [x] **Task 1**: Select the Next.js project template.
- [x] **Task 2**: Initialize the Next.js project named `nextcommerce` with TypeScript, Tailwind CSS, and Shadcn UI using the appropriate command.
- [x] **Task 3**: Verify the project structure and basic setup.
- [x] **Task 4**: Set up Prisma ORM and configure it for PostgreSQL.
  - [x] Define placeholder environment variables for database connection.
- [x] **Task 5**: Implement basic authentication with NextAuth.js.
  - [x] Define placeholder environment variables for NextAuth.js (e.g., `NEXTAUTH_SECRET`, `NEXTAUTH_URL`).
  - [x] Set up basic user registration and login. (Sign-in and Registration pages with API routes and password hashing implemented)
- [x] **Task 6**: Create the basic layout and navigation components.

## Phase 2: Product Catalog & Browsing

- [x] **Task 7**: Define the Prisma schema for Products and Categories.
- [x] **Task 8**: Create API routes for fetching products and categories.
- [x] **Task 9**: Implement the product listing page with basic filtering and sorting placeholders.
- [x] **Task 10**: Implement the product detail page. (API and UI created)
- [x] **Task 11**: Implement category navigation. (Component created and added to layout)

## Phase 3: Shopping Cart

- [x] **Task 12**: Define the Prisma schema for Cart and CartItems. (Included in main schema update)
- [x] **Task 13**: Implement API routes for cart operations (add, view, update, remove items).
- [x] **Task 14**: Implement client-side cart state management (e.g., using Zustand as specified). (Implemented with React Context)
- [x] **Task 15**: Create UI components for the shopping cart (e.g., cart icon, cart sidebar/page). (Cart page created, cart icon in navbar is basic link)

## Phase 4: Integrations (Placeholders)

- [x] **Task 16**: Integrate Stripe for payments (using placeholders for API keys).
- [x] **Task 17**: Integrate Uploadthing for image uploads (using placeholders for API keys).
- [x] **Task 18**: Integrate Resend for email notifications (using placeholders for API keys).

## Phase 5: Security & Best Practices

- [x] **Task 19**: Implement input validation (e.g., using Zod as specified).
- [x] **Task 20**: Review and implement security best practices for Next.js applications.

## Phase 6: Documentation and Handover

- [ ] **Task 21**: Ensure all placeholder environment variables are clearly documented.
- [ ] **Task 22**: Prepare a brief guide on how to set up and run the project locally.
- [ ] **Task 23**: Package the project files for handover.
