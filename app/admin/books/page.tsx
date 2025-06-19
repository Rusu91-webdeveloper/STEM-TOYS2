import { db } from "@/lib/db";
import { BooksList } from "./BooksList";

export default async function AdminBooksPage() {
  // Get all books with their digital files count
  const books = await db.book.findMany({
    include: {
      digitalFiles: {
        where: {
          isActive: true,
        },
      },
      languages: true,
      _count: {
        select: {
          digitalFiles: true,
          orderItems: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cărți Digitale</h1>
        <p className="text-muted-foreground">
          Gestionează cărțile digitale și fișierele lor EPUB/KBP
        </p>
      </div>

      <BooksList books={books} />
    </div>
  );
}
