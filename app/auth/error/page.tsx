"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const errorParam = searchParams.get("error");

    if (errorParam) {
      switch (errorParam) {
        case "Signin":
          setError("Try signing in with a different account.");
          break;
        case "OAuthSignin":
        case "OAuthCallback":
        case "OAuthCreateAccount":
        case "EmailCreateAccount":
        case "Callback":
          setError("There was a problem with the OAuth authentication.");
          break;
        case "OAuthAccountNotLinked":
          setError(
            "To confirm your identity, sign in with the same account you used originally."
          );
          break;
        case "EmailSignin":
          setError("The email could not be sent.");
          break;
        case "CredentialsSignin":
          setError("Invalid email or password.");
          break;
        case "SessionRequired":
          setError("Please sign in to access this page.");
          break;
        default:
          setError("An unknown error occurred.");
          break;
      }
    }
  }, [searchParams]);

  return (
    <div className="flex flex-col items-center justify-center max-w-md mx-auto space-y-6">
      <div className="w-full p-6 space-y-6 bg-card rounded-lg border shadow-sm">
        <div className="flex items-center gap-3 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <h1 className="text-xl font-bold">Authentication Error</h1>
        </div>

        {error ? (
          <div className="p-4 rounded-md bg-destructive/10 text-destructive">
            {error}
          </div>
        ) : (
          <div className="p-4 rounded-md bg-muted">
            An error occurred during authentication.
          </div>
        )}

        <div className="space-y-4">
          <Button
            asChild
            className="w-full">
            <Link href="/auth/login">Back to Sign In</Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="w-full">
            <Link href="/">Go to Homepage</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

// Fallback component to show while the main content is loading
function AuthErrorFallback() {
  return (
    <div className="flex flex-col items-center justify-center max-w-md mx-auto space-y-6">
      <div className="w-full p-6 space-y-6 bg-card rounded-lg border shadow-sm">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5" />
          <h1 className="text-xl font-bold">Authentication Error</h1>
        </div>
        <div className="p-4 rounded-md bg-muted">Loading error details...</div>
      </div>
    </div>
  );
}

export default function AuthError() {
  return (
    <div className="container py-10">
      <Suspense fallback={<AuthErrorFallback />}>
        <AuthErrorContent />
      </Suspense>
    </div>
  );
}
