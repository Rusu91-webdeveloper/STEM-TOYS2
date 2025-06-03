"use client";

import React, { useState } from "react";
import { UploadButton } from "@uploadthing/react";
import { OurFileRouter } from "@/lib/uploadthing";

export function SimpleImageUploader() {
  const [images, setImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleUploadComplete = (res: { url: string }[]) => {
    setError(null);
    console.log("Upload completed:", res);
    const urls = res.map((file) => file.url);
    setImages((prev) => [...prev, ...urls]);
  };

  const handleUploadError = (error: Error) => {
    console.error("Upload error:", error);
    setError(error.message);
  };

  return (
    <div className="space-y-4">
      <div className="p-4 border rounded-md">
        <h3 className="font-medium mb-2">Simple Image Uploader (Debug)</h3>
        <p className="text-sm text-gray-500 mb-4">
          This is a simplified version for debugging upload issues.
        </p>

        <div className="border border-dashed rounded-md p-6">
          <UploadButton<OurFileRouter, "productImage">
            endpoint="productImage"
            onClientUploadComplete={handleUploadComplete}
            onUploadError={handleUploadError}
            className="ut-button:bg-primary ut-button:ut-readying:bg-primary/80 ut-button:ut-uploading:bg-primary/80"
          />
        </div>

        {error && (
          <div className="mt-4 p-2 bg-red-50 text-red-600 rounded-md text-sm">
            Error: {error}
          </div>
        )}
      </div>

      {images.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium">Uploaded Images:</h4>
          <div className="grid grid-cols-2 gap-2">
            {images.map((image, index) => (
              <div
                key={index}
                className="border rounded-md overflow-hidden">
                <img
                  src={image}
                  alt={`Uploaded image ${index + 1}`}
                  className="w-full h-auto"
                />
                <div className="p-2 text-xs text-gray-500 break-all">
                  {image}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
