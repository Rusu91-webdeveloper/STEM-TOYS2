import React from "react";
import { ProfileForm } from "@/features/account/components/ProfileForm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getTranslations } from "@/lib/i18n/server";

export async function generateMetadata() {
  const t = await getTranslations("ro");
  return {
    title: `${t("account")} | NextCommerce`,
  };
}

export default async function ProfilePage() {
  const session = await auth();
  const t = await getTranslations("ro"); // Default to Romanian

  let userData = {
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    image: session?.user?.image || "",
  };

  try {
    if (session?.user?.id) {
      const user = await db.user.findUnique({
        where: { id: session.user.id },
        select: {
          name: true,
          email: true,
        },
      });
      if (user) {
        userData = {
          name: user.name || "",
          email: user.email || "",
          image: session?.user?.image || "", // Keep image from session since it's not in DB
        };
      }
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    // Continue with session data if database fetch fails
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{t("profile")}</h2>
        <p className="text-muted-foreground">{t("managePersonalInfo")}</p>
      </div>
      <ProfileForm initialData={userData} />
    </div>
  );
}
