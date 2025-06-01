"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, AlertCircle } from "lucide-react";

export default function TestEmailPage() {
  const [email, setEmail] = useState("");
  const [emailType, setEmailType] = useState("welcome");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success?: boolean;
    message?: string;
    error?: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(
        `/api/test-email?email=${encodeURIComponent(email)}&type=${emailType}`
      );
      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: data.message,
        });
      } else {
        setResult({
          success: false,
          error: data.error || "Failed to send email",
        });
      }
    } catch (error) {
      setResult({
        success: false,
        error: "An error occurred while sending the test email",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Test Email Configuration</h1>
      <Card className="p-6">
        <form
          onSubmit={handleSubmit}
          className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter recipient email"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Email Type</Label>
            <RadioGroup
              value={emailType}
              onValueChange={setEmailType}
              className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="welcome"
                  id="welcome"
                />
                <Label htmlFor="welcome">Welcome Email</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="verification"
                  id="verification"
                />
                <Label htmlFor="verification">Account Verification</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem
                  value="reset"
                  id="reset"
                />
                <Label htmlFor="reset">Password Reset</Label>
              </div>
            </RadioGroup>
          </div>

          <Button
            type="submit"
            disabled={loading}>
            {loading ? "Sending..." : "Send Test Email"}
          </Button>

          {result && (
            <Alert className={result.success ? "bg-green-50" : "bg-red-50"}>
              {result.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
              <AlertDescription>
                {result.success ? result.message : result.error}
              </AlertDescription>
            </Alert>
          )}
        </form>
      </Card>
      <div className="mt-8 text-sm text-gray-500">
        <p>
          <strong>Note:</strong> This page is only for testing your email
          configuration. It will only work in development mode.
        </p>
        <p className="mt-2">
          Ensure you have the following environment variables set in your
          .env.local file:
        </p>
        <ul className="list-disc pl-6 mt-2">
          <li>RESEND_API_KEY - Your Resend API key</li>
          <li>EMAIL_FROM - The sender email address</li>
          <li>NEXT_PUBLIC_SITE_URL - Your site URL (for links in emails)</li>
        </ul>
      </div>
    </div>
  );
}
