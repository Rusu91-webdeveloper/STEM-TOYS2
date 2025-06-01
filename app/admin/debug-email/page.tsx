"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, AlertCircle } from "lucide-react";

export default function DebugEmailPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(
        `/api/test-resend?email=${encodeURIComponent(email)}`
      );
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Email Configuration Debugger</h1>

      <Card className="p-6 mb-6">
        <form
          onSubmit={handleSubmit}
          className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Email Address for Test
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading}>
            {loading ? "Sending..." : "Run Email Diagnostics"}
          </Button>
        </form>
      </Card>

      {result && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Diagnostic Results</h2>

          <Alert
            variant={result.success ? "success" : "destructive"}
            className="mb-4">
            {result.success ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertTitle>
              {result.success ? "Test Completed" : "Test Failed"}
            </AlertTitle>
            <AlertDescription>
              {result.success
                ? "The test was completed. Check your email inbox and server logs."
                : result.error || "Unknown error"}
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Environment Configuration</h3>
              <ul className="mt-2 space-y-1 text-sm">
                <li>
                  RESEND_API_KEY:{" "}
                  {result.resendConfigured
                    ? "✅ Configured"
                    : "❌ Not properly configured"}
                </li>
                <li>
                  NEXT_PUBLIC_SITE_URL:{" "}
                  {result.siteUrlConfigured
                    ? "✅ Configured"
                    : "❌ Not properly configured"}
                </li>
              </ul>
            </div>

            {result.result && (
              <div>
                <h3 className="font-medium">Resend Response</h3>
                <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                  {JSON.stringify(result.result, null, 2)}
                </pre>
              </div>
            )}

            {result.stack && (
              <div>
                <h3 className="font-medium">Error Stack</h3>
                <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                  {result.stack}
                </pre>
              </div>
            )}
          </div>
        </Card>
      )}

      <div className="mt-8 text-sm text-gray-500">
        <h2 className="font-medium text-base mb-2">Troubleshooting Guide</h2>
        <ol className="list-decimal pl-5 space-y-2">
          <li>
            <strong>Check your .env.local file</strong> - Make sure you have the
            following variables properly set:
            <ul className="list-disc pl-5 mt-1">
              <li>RESEND_API_KEY - Your Resend API key (starts with "re_")</li>
              <li>
                NEXT_PUBLIC_SITE_URL - Used for generating verification and
                reset links
              </li>
            </ul>
          </li>
          <li>
            <strong>Resend Account</strong> - Make sure your Resend account is
            properly set up and verified.
          </li>
          <li>
            <strong>Check server logs</strong> - Look at your console for
            detailed error messages.
          </li>
          <li>
            <strong>Use onboarding@resend.dev</strong> - For testing, this
            sender email is pre-approved with Resend.
          </li>
        </ol>
      </div>
    </div>
  );
}
