import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import SidebarNav, { adminNavItems } from "./components/sidebar-nav";

// In a real app, you would use NextAuth for proper authentication
// This is a simple implementation for demonstration
const isAdminUser = () => {
  // Mock authentication check - in production, use a proper auth solution
  return true;
};

export const metadata: Metadata = {
  title: "Admin Dashboard | TechTots",
  description: "Admin dashboard for managing TechTots e-commerce platform",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if user is admin, redirect to login if not
  if (!isAdminUser()) {
    redirect("/auth/login?callbackUrl=/admin");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white border-b border-gray-200 fixed top-0 w-full z-10">
        <div className="px-4 py-3 flex items-center justify-between">
          <Link
            href="/admin"
            className="flex items-center">
            <div className="relative h-10 w-20 mr-2">
              <Image
                className="object-contain"
                src="/TechTots_LOGO.png"
                alt="TechTots Logo"
                fill
              />
            </div>
            <span className="text-xl font-bold text-primary">Admin</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Admin User</span>
            <Link
              href="/"
              className="text-sm text-gray-600 hover:text-primary flex items-center gap-1">
              <LogOut className="h-4 w-4" />
              <span>Exit to Site</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Admin Content */}
      <div className="flex pt-16">
        {/* Sidebar */}
        <aside className="w-64 fixed h-full bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4">
            <SidebarNav items={adminNavItems} />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 ml-64 p-6">{children}</main>
      </div>
    </div>
  );
}
