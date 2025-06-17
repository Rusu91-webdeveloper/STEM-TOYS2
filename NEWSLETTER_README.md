# Newsletter Functionality Guide

## Overview

The newsletter functionality allows users to subscribe to receive updates about new blog posts, products, and promotions. The system is integrated with Brevo (formerly Sendinblue) for email delivery.

## Current Issues and Solutions

### Issue: Users not receiving emails after subscribing

When subscribing to the newsletter, users are added to the database but do not receive confirmation emails. The terminal logs show successful database entries but no email delivery.

### Root Causes:

1. **Missing Brevo API Key**: The environment variables required for email delivery are not set.
2. **Incomplete Store Settings**: The store settings record exists but has an invalid contact email.
3. **No Visual Feedback**: Users don't see confirmation that their subscription was processed.

### Solution Steps:

#### 1. Set up environment variables

Add the following to your `.env.local` file:

```
BREVO_API_KEY=your_brevo_api_key_here
EMAIL_FROM=your_sender_email@example.com
EMAIL_FROM_NAME=TechTots
```

#### 2. Configure store settings

Run the setup script to create or update store settings:

```bash
node scripts/setup-brevo.js
```

This ensures that the store settings have a valid contact email and other required fields.

#### 3. Add visual feedback

The newsletter subscription form now shows toast notifications when:

- Subscription is successful
- An error occurs
- The email is already subscribed

#### 4. Test the newsletter functionality

You can test the newsletter functionality using the test script:

```bash
node scripts/test-newsletter-email.js
```

## Dynamic Blog Content

The newsletter welcome email now includes the latest blog posts from the database instead of static placeholders. This ensures that subscribers always see fresh content.

### Features:

- Fetches the 2 most recent published blog posts
- Displays blog title, cover image, and links to the full articles
- Shows a "coming soon" message if no blogs are available
- Automatically updates when new blog posts are published

### Testing with Sample Data:

If you need to test with sample blog posts, you can run:

```bash
node scripts/create-test-blog.js
```

This script creates two sample blog posts if none exist in the database.

## Implementation Details

### API Routes

- `POST /api/newsletter`: Subscribe to the newsletter
- `DELETE /api/newsletter?email=example@email.com`: Unsubscribe from the newsletter
- `GET /api/test-newsletter?action=all&email=test@example.com`: Test email functionality

### Email Templates

Email templates are defined in `lib/brevoTemplates.ts` and include:

- Welcome email for new subscribers
- Re-subscription confirmation
- Blog post notifications

### Database Schema

The newsletter functionality uses the `Newsletter` model in the Prisma schema:

```prisma
model Newsletter {
  id         String   @id @default(cuid())
  email      String   @unique
  firstName  String?
  lastName   String?
  isActive   Boolean  @default(true)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  categories String[] @default([])

  @@index([email])
  @@index([isActive])
}
```

## Best Practices

1. Always check that Brevo API keys are properly set in `.env.local`
2. Ensure store settings are configured with valid contact information
3. Use the test API endpoint to verify email delivery before deploying
4. Add toast notifications to provide visual feedback to users when subscribing

## Troubleshooting

If newsletter emails are still not being sent:

1. Check that the Brevo API key is valid and has sufficient credits
2. Verify that store settings exist with a valid contact email
3. Look for errors in the terminal logs
4. Ensure the sender email domain has proper SPF/DKIM records
