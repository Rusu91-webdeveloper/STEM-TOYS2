import React from "react";
import { ProfileForm } from "@/features/account/components/ProfileForm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getTranslations } from "@/lib/i18n/server";

export async function generateMetadata() {
  const t = await getTranslations("ro"); // Default to Romanian

  return {
    title: `${t("profile")} | ${t("account")}`,
    description: t("profileDescription"),
  };
}

export default async function ProfilePage() {
  const session = await auth();
  const t = await getTranslations("ro"); // Default to Romanian

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
        <h2 className="text-xl font-semibold tracking-tight">{t("profile")}</h2>
        <p className="text-sm text-muted-foreground">
          {t("managePersonalInfo")}
        </p>
      </div>
      <ProfileForm initialData={userData} />
    </div>
  );
}
