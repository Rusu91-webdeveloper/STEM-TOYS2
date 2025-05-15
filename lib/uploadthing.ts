import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique route key
  productImage: f({ image: { maxFileSize: "4MB", maxFileCount: 10 } })
    // Set permissions and file types for this FileRoute
    .middleware(async () => {
      // This code runs on your server before upload
      // If you throw, the user will not be able to upload

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: "user-id-placeholder" }; // Add user ID in a real implementation
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("Upload complete for userId:", metadata.userId);

      console.log("File uploaded:", file);

      // Return the file URL or any other data you want to send back
      return { fileUrl: file.url };
    }),

  // You can add more file routes here for different use cases
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
