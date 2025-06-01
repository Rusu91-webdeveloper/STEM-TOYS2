"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const errorType = searchParams.get("error") || "unknown";

  const errorMessages = {
    missing_token: "Verification token is missing.",
    invalid_token: "The verification token is invalid or has expired.",
    server_error: "A server error occurred during verification.",
    unknown: "An unknown error occurred.",
  };

  const errorMessage =
    errorMessages[errorType as keyof typeof errorMessages] ||
    errorMessages.unknown;

  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Verification Failed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground mb-4">
            {errorMessage}
          </p>
          <p className="text-center text-sm">
            If you're having trouble verifying your account, please contact our
            support team or try registering again.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button
            asChild
            className="w-full">
            <Link href="/auth/login">Go to Login</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="w-full">
            <Link href="/auth/register">Register Again</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
