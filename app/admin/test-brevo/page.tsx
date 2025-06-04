"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Define form schema
const formSchema = z.object({
  emailType: z.enum(
    [
      "welcome",
      "verification",
      "passwordReset",
      "orderConfirmation",
      "returnProcessing",
    ],
    {
      required_error: "Please select an email type",
    }
  ),
  recipient: z.string().email("Invalid email address"),
});

type FormValues = z.infer<typeof formSchema>;

export default function TestBrevoPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success?: boolean;
    message?: string;
    error?: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      emailType: "welcome",
      recipient: "",
    },
  });

  async function onSubmit(data: FormValues) {
    try {
      setLoading(true);
      setResult(null);

      const response = await fetch("/api/test-brevo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to send test email");
      }

      setResult({ success: true, message: result.message });
    } catch (error) {
      setResult({ success: false, error: (error as Error).message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Test Brevo Email Integration</h1>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Send Test Email</h2>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="emailType"
              className="block text-sm font-medium">
              Email Type
            </label>
            <select
              id="emailType"
              {...register("emailType")}
              className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500">
              <option value="welcome">Welcome Email</option>
              <option value="verification">Email Verification</option>
              <option value="passwordReset">Password Reset</option>
              <option value="orderConfirmation">Order Confirmation</option>
              <option value="returnProcessing">Return Processing</option>
            </select>
            {errors.emailType && (
              <p className="text-red-500 text-sm">{errors.emailType.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="recipient"
              className="block text-sm font-medium">
              Recipient Email
            </label>
            <input
              id="recipient"
              type="email"
              placeholder="test@example.com"
              {...register("recipient")}
              className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
            />
            {errors.recipient && (
              <p className="text-red-500 text-sm">{errors.recipient.message}</p>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
              {loading ? "Sending..." : "Send Test Email"}
            </button>
          </div>
        </form>
      </div>

      {result && (
        <div
          className={`p-4 rounded-md ${result.success ? "bg-green-50" : "bg-red-50"}`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {result.success ? (
                <svg
                  className="h-5 w-5 text-green-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="h-5 w-5 text-red-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <p
                className={`text-sm font-medium ${result.success ? "text-green-800" : "text-red-800"}`}>
                {result.success ? result.message : result.error}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4">
          About Brevo Email Integration
        </h2>

        <div className="prose">
          <p>
            This page lets you test the Brevo (formerly Sendinblue) email
            integration. You can send different types of transactional emails to
            verify they are correctly configured and designed.
          </p>

          <h3>Email Types</h3>
          <ul>
            <li>
              <strong>Welcome Email</strong>: Sent when a new user creates an
              account
            </li>
            <li>
              <strong>Email Verification</strong>: Contains a verification link
              for new accounts
            </li>
            <li>
              <strong>Password Reset</strong>: Includes a link to reset password
            </li>
            <li>
              <strong>Order Confirmation</strong>: Sent after a successful
              purchase with order details
            </li>
            <li>
              <strong>Return Processing</strong>: Status updates for returned
              orders
            </li>
          </ul>

          <h3>Configuration</h3>
          <p>
            Make sure your Brevo API key or SMTP credentials are correctly set
            in your <code>.env.local</code> file. See{" "}
            <code>BREVO_INTEGRATION.md</code> for detailed setup instructions.
          </p>
        </div>
      </div>
    </div>
  );
}
