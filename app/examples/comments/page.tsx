import { query } from "@/lib/neon";
import { revalidatePath } from "next/cache";
import { CommentForm } from "./components/CommentForm";

// Server action to add a comment
async function addComment(formData: FormData) {
  "use server";

  const comment = formData.get("comment") as string;

  if (!comment || comment.trim() === "") {
    return { error: "Comment cannot be empty" };
  }

  try {
    // Import the execute function inside the server action
    // to ensure it's only used in a server context
    const { execute } = await import("@/lib/neon");

    // Insert the comment into the database
    await execute`
      INSERT INTO comments (comment)
      VALUES (${comment})
    `;

    // Revalidate the page to show the new comment
    revalidatePath("/examples/comments");
    return { success: true };
  } catch (error) {
    console.error("Error adding comment:", error);
    return { error: "Failed to add comment" };
  }
}

export default async function CommentsPage() {
  // Fetch comments from the database
  let comments = [];
  try {
    comments = await query`
      SELECT * FROM comments
      ORDER BY created_at DESC
    `;
  } catch (error) {
    console.error("Error fetching comments:", error);
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Comments Example</h1>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Add a Comment</h2>
        <CommentForm addComment={addComment} />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Comments</h2>
        {comments.length > 0 ? (
          <ul className="space-y-4">
            {comments.map((comment: any) => (
              <li
                key={comment.id}
                className="p-4 bg-gray-100 rounded-lg shadow">
                <p>{comment.comment}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {new Date(comment.created_at).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No comments yet. Be the first to comment!</p>
        )}
      </div>
    </div>
  );
}
