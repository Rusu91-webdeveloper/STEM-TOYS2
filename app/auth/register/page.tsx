"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { userSchema } from "@/lib/validations";
import { CheckIcon, ArrowRight } from "lucide-react";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { Separator } from "@/components/ui/separator";

// Create a registration schema based on the user schema
const registerSchema = userSchema
  .extend({
    password: userSchema.shape.password.unwrap(),
    confirmPassword: z.string(),
    agreeToTerms: z.boolean().refine((value) => value === true, {
      message: "You must agree to the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [verificationUrl, setVerificationUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreeToTerms: true,
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Call to register API endpoint
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle specific error status codes
        if (response.status === 409) {
          setError(
            result.error || "An account with this email already exists."
          );
        } else if (response.status === 400) {
          setError(
            result.error || "Please check your information and try again."
          );
        } else {
          setError(result.error || "Registration failed. Please try again.");
        }
        setIsLoading(false);
        return;
      }

      // Show success message
      setSuccess(
        result.message ||
          "Registration successful. Please check your email for verification."
      );
      setIsRegistered(true);
      // Save verification URL if provided (development mode)
      if (result.devInfo?.verificationUrl) {
        setVerificationUrl(result.devInfo.verificationUrl);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Registration error:", error);
      setError("An error occurred during registration. Please try again.");
      setIsLoading(false);
    }
  };

  if (isRegistered) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex flex-col items-center justify-center space-y-6 max-w-md mx-auto">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckIcon className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-center">
            Registration Successful!
          </h1>
          <p className="text-center text-muted-foreground">
            We've sent a verification email to your inbox. Please check your
            email and click the verification link to activate your account.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 w-full">
            <p className="text-amber-800 text-sm">
              <strong>Important:</strong> If you don't see the email, please
              check your spam or junk folder.
            </p>
          </div>

          {/* Display verification link in development mode */}
          {verificationUrl && (
            <div className="w-full bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm mb-2">
                <strong>Development Mode:</strong> Use the link below to verify
                your account:
              </p>
              <div className="bg-white p-2 rounded border border-blue-100 overflow-x-auto">
                <code className="text-xs break-all">{verificationUrl}</code>
              </div>
              <div className="mt-3">
                <Button
                  onClick={() => window.open(verificationUrl, "_blank")}
                  variant="outline"
                  size="sm"
                  className="w-full">
                  Open Verification Link
                </Button>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-4 w-full">
            <Button
              onClick={() => router.push("/auth/login?from=register")}
              className="w-full flex items-center justify-center gap-2">
              Go to Login Page <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col items-center justify-center space-y-6 max-w-md mx-auto">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Create an Account</h1>
          <p className="text-muted-foreground">
            Sign up to start shopping and track your orders
          </p>
        </div>

        <div className="w-full p-6 space-y-6 bg-card rounded-lg border shadow-sm">
          {error && (
            <div className="p-4 rounded-md bg-destructive/15 text-destructive border border-destructive/30 flex flex-col space-y-1">
              <p className="font-medium">Registration Failed</p>
              <p className="text-sm">{error}</p>
              {error.includes("email already exists") && (
                <div className="mt-2 text-sm">
                  <Link
                    href="/auth/login"
                    className="text-primary hover:underline font-medium">
                    Go to Login Page
                  </Link>
                </div>
              )}
            </div>
          )}

          {success && (
            <div className="p-4 rounded-md bg-green-100 text-green-800 border border-green-200 flex flex-col space-y-1">
              <p className="font-medium">Success</p>
              <p className="text-sm">{success}</p>
            </div>
          )}

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                autoComplete="name"
                {...register("name")}
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                autoComplete="email"
                {...register("email")}
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                {...register("password")}
                className={errors.password ? "border-destructive" : ""}
              />
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                {...register("confirmPassword")}
                className={errors.confirmPassword ? "border-destructive" : ""}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2 py-2">
              <Controller
                name="agreeToTerms"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="agreeToTerms"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <label
                htmlFor="agreeToTerms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                I agree to the{" "}
                <Link
                  href="/terms"
                  className="text-primary hover:underline">
                  terms and conditions
                </Link>
              </label>
            </div>
            {errors.agreeToTerms && (
              <p className="text-sm text-destructive mt-1">
                {errors.agreeToTerms.message}
              </p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}>
              {isLoading ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-card px-2 text-muted-foreground text-sm">
                or continue with
              </span>
            </div>
          </div>

          <GoogleSignInButton />

          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
