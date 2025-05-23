import React from "react";
import { Metadata } from "next";
import { AccountNav } from "@/features/account/components/AccountNav";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "My Account | NextCommerce",
  description: "Manage your account and view your orders",
};

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // In a real app, we would check if the user is authenticated
  // and redirect to the login page if they are not
  const session = await auth();

  if (!session) {
    redirect("/auth/signin?callbackUrl=/account");
  }

  return (
    <div className="container py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">My Account</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1">
          <AccountNav />
        </div>
        <div className="md:col-span-3">{children}</div>
      </div>
    </div>
  );
}
