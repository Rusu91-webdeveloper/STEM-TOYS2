import React from "react";
import { ProfileForm } from "@/features/account/components/ProfileForm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

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

  // Fetch the latest user data from the database
  let userData = {
    name: session.user.name || "",
    email: session.user.email || "",
    image: session.user.image || "",
  };

  try {
    // Attempt to get the user from the database
    const user = await db.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        name: true,
        email: true,
      },
    });

    // Update userData if we found a user
    if (user) {
      userData = {
        ...userData,
        name: user.name || userData.name,
        email: user.email,
      };
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    // Continue with session data if database fetch fails
  }

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
