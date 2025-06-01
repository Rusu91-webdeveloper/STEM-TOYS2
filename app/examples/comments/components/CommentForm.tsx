"use client";

import { useState } from "react";

type CommentFormProps = {
  addComment: (
    formData: FormData
  ) => Promise<{ success?: boolean; error?: string }>;
};

export function CommentForm({ addComment }: CommentFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await addComment(formData);

      if (result.error) {
        setError(result.error);
      } else {
        // Reset the form on success
        const form = document.getElementById("comment-form") as HTMLFormElement;
        form.reset();
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      id="comment-form"
      action={handleSubmit}
      className="space-y-4">
      <div>
        <label
          htmlFor="comment"
          className="block text-sm font-medium mb-1">
          Your Comment
        </label>
        <textarea
          id="comment"
          name="comment"
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Write a comment..."
          required
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed">
        {isSubmitting ? "Submitting..." : "Submit Comment"}
      </button>
    </form>
  );
}
