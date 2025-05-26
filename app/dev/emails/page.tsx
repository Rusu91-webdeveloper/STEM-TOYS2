"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function DevEmailsPage() {
  const [email, setEmail] = useState("");
  const [emailType, setEmailType] = useState("welcome");
  const [isSending, setIsSending] = useState(false);
  const [sentEmails, setSentEmails] = useState<
    {
      type: string;
      to: string;
      timestamp: Date;
      previewUrl: string | null;
    }[]
  >([]);

  const handleSendTest = async () => {
    if (!email) return;

    setIsSending(true);
    try {
      // Send the test email based on type
      let endpoint = "";
      let payload = {};

      if (emailType === "welcome") {
        endpoint = "/api/dev/send-test-email";
        payload = {
          email,
          type: "welcome",
          name: "Test User",
        };
      } else if (emailType === "verification") {
        endpoint = "/api/dev/send-test-email";
        payload = {
          email,
          type: "verification",
          name: "Test User",
        };
      } else if (emailType === "password-reset") {
        endpoint = "/api/auth/forgot-password";
        payload = { email };
      } else if (emailType === "order-confirmation") {
        endpoint = "/api/dev/send-test-email";
        payload = {
          email,
          type: "order-confirmation",
          name: "Test User",
          orderNumber: "ORD-" + Math.floor(Math.random() * 1000000),
          total: "$" + (Math.random() * 100).toFixed(2),
        };
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        // Add to sent emails list
        setSentEmails((prev) => [
          {
            type: emailType,
            to: email,
            timestamp: new Date(),
            previewUrl: null, // We don't have this from the server
          },
          ...prev,
        ]);
      } else {
        console.error("Failed to send test email:", await response.text());
        alert("Failed to send test email. Check console for details.");
      }
    } catch (error) {
      console.error("Error sending test email:", error);
      alert("Error sending test email. Check console for details.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Email Testing Tool</h1>
      <p className="text-muted-foreground mb-8">
        This tool is only available in development mode. It allows you to test
        various email templates without having to trigger the actual flows.
      </p>

      <div className="bg-card rounded-lg border p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Send Test Email</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emailType">Email Type</Label>
              <Select
                value={emailType}
                onValueChange={setEmailType}>
                <SelectTrigger id="emailType">
                  <SelectValue placeholder="Select email type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="welcome">Welcome Email</SelectItem>
                  <SelectItem value="verification">
                    Email Verification
                  </SelectItem>
                  <SelectItem value="password-reset">Password Reset</SelectItem>
                  <SelectItem value="order-confirmation">
                    Order Confirmation
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button
            onClick={handleSendTest}
            disabled={isSending || !email}>
            {isSending ? "Sending..." : "Send Test Email"}
          </Button>
          <p className="text-sm text-muted-foreground mt-2">
            Check your server console for the email log and preview link.
          </p>
        </div>
      </div>

      <div className="bg-card rounded-lg border p-6">
        <h2 className="text-xl font-semibold mb-4">Sent Test Emails</h2>
        {sentEmails.length === 0 ? (
          <p className="text-muted-foreground">
            No test emails have been sent yet.
          </p>
        ) : (
          <div className="space-y-4">
            {sentEmails.map((email, index) => (
              <div
                key={index}
                className="p-4 border rounded-md flex justify-between items-center">
                <div>
                  <div className="font-medium">{email.to}</div>
                  <div className="text-sm text-muted-foreground">
                    {email.type} - {email.timestamp.toLocaleString()}
                  </div>
                </div>
                <div>
                  <Button
                    variant="secondary"
                    size="sm">
                    Check Console for Preview Link
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
