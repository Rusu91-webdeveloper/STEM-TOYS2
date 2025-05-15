# NextCommerce

NextCommerce is a modern e-commerce platform built with Next.js, designed to provide a seamless shopping experience with fast page loads, SEO optimization, and a responsive design. The application serves as a complete solution for online retailers, with features for product browsing, user authentication, shopping cart management, checkout processes, and order tracking.

## Features

- 🛍️ **Complete E-commerce Platform**: Product catalog, search, filtering, cart, checkout
- 💳 **Secure Payments**: Integrated with Stripe for secure payment processing
- 📱 **Responsive Design**: Works smoothly on mobile, tablet, and desktop
- 🚀 **High Performance**: Built with Next.js for optimal loading speeds
- 🔒 **Authentication**: Secure user accounts and profiles
- 📧 **Email Notifications**: Order confirmations and updates via Resend
- 🖼️ **Image Uploads**: Product image management with Uploadthing
- 🔍 **SEO Optimized**: Search engine friendly structure and metadata
- 🌐 **Internationalization**: Support for multiple languages (i18n)

## Tech Stack

### Frontend

- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS
- Shadcn UI
- Context API for state management

### Backend

- Next.js API Routes
- Prisma ORM
- PostgreSQL
- NextAuth.js for authentication

### Third-party Services

- Stripe for payment processing
- Uploadthing for image uploads
- Resend for email notifications

## Getting Started

### Prerequisites

- Node.js 18.0 or later
- npm or yarn
- PostgreSQL database

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/nextcommerce.git
   cd nextcommerce
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:

   - Copy `.env.example` to `.env.local`
   - Fill in the required environment variables (see [Environment Variables](ENVIRONMENT_VARIABLES.md))

4. Set up the database:

   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. Start the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
nextcommerce/
├── app/                 # Next.js App Router pages and layouts
│   ├── api/             # API routes
│   ├── (routes)/        # Application routes
├── components/          # Shared UI components
├── features/            # Feature-specific code
│   ├── auth/            # Authentication
│   ├── cart/            # Shopping cart
│   ├── checkout/        # Checkout process
│   ├── products/        # Product catalog
│   └── ...
├── lib/                 # Utility functions and shared code
├── prisma/              # Database schema and migrations
├── public/              # Static assets
└── types/               # TypeScript type definitions
```

## Third-Party Integrations

### Stripe

NextCommerce uses Stripe for payment processing. The integration includes:

- Payment intent API for secure payments
- Payment element for card input
- Webhook handling for payment events

### Uploadthing

For image uploads, we use Uploadthing:

- Product image uploads
- Image storage and retrieval
- File type and size validation

### Resend

Email notifications are handled by Resend:

- Order confirmation emails
- Shipping notifications
- Password reset emails

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Next.js](https://nextjs.org/) - The React Framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Shadcn UI](https://ui.shadcn.com/) - UI component library
- [Prisma](https://www.prisma.io/) - Database ORM
- [Stripe](https://stripe.com/) - Payment processing
- [Uploadthing](https://uploadthing.com/) - File uploads
- [Resend](https://resend.com/) - Email API
