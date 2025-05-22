import React from "react";
import { auth } from "@/lib/auth";
import { AccountSettings } from "@/features/account/components/AccountSettings";

export const metadata = {
  title: "Settings | My Account",
  description: "Manage your account settings and preferences",
};

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user) {
    // This should never happen since layout handles auth check
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">
          Account Settings
        </h2>
        <p className="text-sm text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>
      <AccountSettings />
    </div>
  );
}
