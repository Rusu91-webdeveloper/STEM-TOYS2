"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function TestPage() {
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testGet = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("Making GET request to /api/test");
      const response = await fetch("/api/test");
      console.log("GET response status:", response.status);

      const data = await response.json();
      console.log("GET response data:", data);

      setResult({
        type: "GET",
        status: response.status,
        data,
      });
    } catch (err: any) {
      console.error("Error in GET request:", err);
      setError(err.message || "An error occurred during the GET request");
    } finally {
      setIsLoading(false);
    }
  };

  const testPost = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Get form data
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const message = formData.get("message") as string;

    try {
      console.log("Making POST request to /api/test");
      console.log("POST data:", { name, message });

      const response = await fetch("/api/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, message }),
      });

      console.log("POST response status:", response.status);

      const data = await response.json();
      console.log("POST response data:", data);

      setResult({
        type: "POST",
        status: response.status,
        data,
      });
    } catch (err: any) {
      console.error("Error in POST request:", err);
      setError(err.message || "An error occurred during the POST request");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">API Connection Test</h1>

      <div className="grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Test GET Request</CardTitle>
            <CardDescription>
              Test a simple GET request to check API connectivity.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={testGet}
              disabled={isLoading}>
              {isLoading && result?.type === "GET"
                ? "Loading..."
                : "Send GET Request"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test POST Request</CardTitle>
            <CardDescription>
              Submit this form to test a POST request.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={testPost}
              className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium mb-1">
                  Name
                </label>
                <Input
                  id="name"
                  name="name"
                  required
                  placeholder="Your name"
                />
              </div>
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium mb-1">
                  Message
                </label>
                <Input
                  id="message"
                  name="message"
                  required
                  placeholder="Your message"
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading}>
                {isLoading && result?.type === "POST"
                  ? "Submitting..."
                  : "Submit Form"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {error && (
          <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {result && (
          <Card>
            <CardHeader>
              <CardTitle>Response ({result.type})</CardTitle>
              <CardDescription>Status: {result.status}</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded overflow-auto">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
