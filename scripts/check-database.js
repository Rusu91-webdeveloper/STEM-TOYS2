const { PrismaClient } = require("../app/generated/prisma");
const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log("===== DATABASE CONTENTS =====");

    // Check users
    console.log("\n----- USERS -----");
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        emailVerified: true,
      },
    });
    console.log(`Users in database: ${users.length}`);
    if (users.length > 0) {
      users.forEach((u) =>
        console.log(
          `- ${u.name} (${u.email}): Role=${u.role}, Active=${u.isActive}`
        )
      );
    }

    // Check products
    console.log("\n----- PRODUCTS -----");
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });
    console.log(`Products in database: ${products.length}`);
    if (products.length > 0) {
      products.forEach((p) => console.log(`- ${p.name} (${p.id})`));
    }

    // Check books
    console.log("\n----- BOOKS -----");
    const books = await prisma.book.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });
    console.log(`Books in database: ${books.length}`);
    if (books.length > 0) {
      books.forEach((b) => console.log(`- ${b.name} (${b.id})`));
    }

    // Check categories
    console.log("\n----- CATEGORIES -----");
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });
    console.log(`Categories in database: ${categories.length}`);
    if (categories.length > 0) {
      categories.forEach((c) => console.log(`- ${c.name} (${c.id})`));
    }

    // Check other tables
    console.log("\n----- OTHER TABLES -----");
    const orders = await prisma.order.count();
    console.log(`Orders in database: ${orders}`);

    const blogs = await prisma.blog.count();
    console.log(`Blogs in database: ${blogs}`);

    const newsletters = await prisma.newsletter.count();
    console.log(`Newsletter subscribers: ${newsletters}`);

    const storeSettings = await prisma.storeSettings.count();
    console.log(`Store settings records: ${storeSettings}`);
  } catch (error) {
    console.error("Error checking database:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
