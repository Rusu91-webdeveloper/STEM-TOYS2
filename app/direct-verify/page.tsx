"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DirectVerifyPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success?: boolean;
    message?: string;
    error?: string;
  } | null>(null);
  const router = useRouter();

  const handleVerify = async () => {
    if (!email || !email.includes("@")) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/verify-direct?email=${encodeURIComponent(email)}`
      );
      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: data.message || "Account verified successfully!",
        });
        toast({
          title: "Success!",
          description: "Your account has been verified. You can now log in.",
        });
      } else {
        setResult({
          success: false,
          error: data.error || "Failed to verify account",
        });
        toast({
          title: "Error",
          description: data.error || "Failed to verify account",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error verifying account:", error);
      setResult({
        success: false,
        error: "An unexpected error occurred",
      });
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-12 max-w-md">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Direct Account Verification
        </h1>

        <div className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-700">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full"
            />
          </div>

          <Button
            className="w-full"
            onClick={handleVerify}
            disabled={isLoading}>
            {isLoading ? "Verifying..." : "Verify Account"}
          </Button>

          {result && (
            <div
              className={`p-4 rounded-md mt-4 ${result.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
              {result.success ? result.message : result.error}

              {result.success && (
                <div className="mt-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push("/auth/login")}>
                    Go to Login
                  </Button>
                </div>
              )}
            </div>
          )}

          <div className="text-center mt-4">
            <Link
              href="/auth/login"
              className="text-sm text-blue-600 hover:underline">
              Return to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
