import { SimpleImageUploader } from "@/components/ui/SimpleImageUploader";

export default function UploadThingDebugPage() {
  return (
    <div className="container py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">UploadThing Debug Page</h1>
        <p className="text-muted-foreground mt-2">
          This page helps test the UploadThing integration
        </p>
      </div>

      <div className="grid gap-6">
        <div className="rounded-lg border p-4">
          <h2 className="text-xl font-semibold mb-4">
            1. Check Environment Variables
          </h2>
          <p>
            Make sure you have the following environment variables set in your{" "}
            <code className="bg-muted px-1 py-0.5 rounded">.env</code> file:
          </p>
          <pre className="bg-muted p-4 rounded-md mt-2 text-sm overflow-auto">
            {`UPLOADTHING_SECRET=your_actual_secret_key
UPLOADTHING_APP_ID=your_actual_app_id`}
          </pre>
          <p className="mt-4">
            You can run{" "}
            <code className="bg-muted px-1 py-0.5 rounded">
              node scripts/check-uploadthing.js
            </code>{" "}
            to verify your configuration.
          </p>
        </div>

        <div className="rounded-lg border p-4">
          <h2 className="text-xl font-semibold mb-4">2. Test Image Upload</h2>
          <SimpleImageUploader />
        </div>

        <div className="rounded-lg border p-4">
          <h2 className="text-xl font-semibold mb-4">
            3. Common Issues &amp; Solutions
          </h2>
          <ul className="list-disc list-inside space-y-2">
            <li>
              <strong>Missing API Keys</strong>: Ensure you've created an
              account at uploadthing.com and added your API keys to your .env
              file
            </li>
            <li>
              <strong>Server Error</strong>: Check your server logs for any
              errors related to UploadThing configuration
            </li>
            <li>
              <strong>CORS Issues</strong>: Ensure your development URL is
              allowed in the UploadThing dashboard
            </li>
            <li>
              <strong>After Adding Keys</strong>: Make sure to restart your
              development server
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
