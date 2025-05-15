import React from "react";
import { ProfileForm } from "@/features/account/components/ProfileForm";
import { auth } from "@/lib/auth";

export const metadata = {
  title: "Profile | My Account",
  description: "View and edit your profile information",
};

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    // This should never happen since layout handles auth check
    return null;
  }

  // In a real app, we would fetch the user data from the database
  // For now, we'll use the session user data
  const userData = {
    name: session.user.name || "",
    email: session.user.email || "",
    image: session.user.image || "",
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Profile</h2>
        <p className="text-sm text-muted-foreground">
          Manage your personal information
        </p>
      </div>
      <ProfileForm initialData={userData} />
    </div>
  );
}
