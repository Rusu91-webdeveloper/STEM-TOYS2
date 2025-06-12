import React from "react";
import { Metadata } from "next";
import { AccountNav } from "@/features/account/components/AccountNav";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getTranslations } from "@/lib/i18n/server";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { verifyUserExists } from "@/lib/db-helpers";
import { logger } from "@/lib/logger";

export const metadata: Metadata = {
  title: "My Account | NextCommerce",
  description: "Manage your account and view your orders",
};

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const t = await getTranslations("ro"); // Default to Romanian

  // Check if the user is authenticated
  if (!session || !session.user) {
    // No session, redirect to login
    logger.info("Redirecting to login from account page - no session");
    // Include the callback URL to ensure the user is redirected back to the account page after login
    redirect("/auth/login?callbackUrl=/account");
  }

  // Extract user ID
  const userId = session.user.id;

  // Check if this is a fresh Google auth session
  const tokenData = (session as any).token || {};
  const isRecentGoogleAuth =
    tokenData.googleAuthTimestamp &&
    Date.now() - tokenData.googleAuthTimestamp < 120000; // 2 minute grace period

  if (isRecentGoogleAuth) {
    logger.info(
      "Fresh Google auth session detected in account layout, using extended verification",
      {
        userId,
      }
    );

    // For fresh Google auth, use extended verification with multiple retries and longer delays
    let userExists = false;

    // Multiple rounds of verification with increasing delays
    for (let attempt = 0; attempt < 5; attempt++) {
      userExists = await verifyUserExists(userId, {
        maxRetries: 3,
        delayMs: 500 * (attempt + 1), // Increasing delay with each attempt
      });

      if (userExists) {
        logger.info(`User verified on attempt ${attempt + 1}`, { userId });
        break;
      }

      // Wait before next verification round
      await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
    }

    if (!userExists) {
      logger.warn(
        "User not found after extended verification for fresh auth session",
        { userId }
      );
      redirect("/auth/login?error=UserDeleted");
    }
  } else {
    // Standard verification for established sessions
    const userExists = await verifyUserExists(userId);
    if (!userExists) {
      logger.warn("User not found in standard verification", { userId });
      redirect("/auth/login?error=UserDeleted");
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1">
        <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
          <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 overflow-y-auto border-r md:sticky md:block">
            <div className="py-6 pr-6 lg:py-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">
                    {t("account")}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {t("myAccount")}
                  </p>
                </div>
                <div className="md:hidden">
                  <LanguageSwitcher />
                </div>
              </div>
              <AccountNav />
            </div>
          </aside>
          <main className="min-h-screen w-full">{children}</main>
        </div>
      </div>
    </div>
  );
}
