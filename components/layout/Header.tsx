"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CartButton } from "@/features/cart";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Products", href: "/products" },
  { name: "Categories", href: "/categories" },
  { name: "Blog", href: "/blog" },
  { name: "About", href: "/about" },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // For demonstration, we'll assume user is logged in
  // In a real app, this would check auth state
  const isLoggedIn = true;
  // For demonstration purposes only - in a real app would check user role
  const isAdmin = true;

  return (
    <header className="bg-background sticky top-0 z-40 w-full border-b">
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3 lg:px-8"
        aria-label="Global">
        <div className="flex lg:flex-1">
          <Link
            href="/"
            className="-m-1.5 p-1.5">
            <span className="sr-only">TechTots</span>
            <div className="relative h-16 w-32">
              <Image
                className="object-contain"
                src="/TechTots_LOGO.png"
                alt="TechTots Logo"
                priority
                fill
              />
            </div>
          </Link>
        </div>
        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
            onClick={() => setMobileMenuOpen(true)}>
            <span className="sr-only">Open main menu</span>
            <Menu
              className="h-6 w-6"
              aria-hidden="true"
            />
          </button>
        </div>
        <div className="hidden lg:flex lg:gap-x-6">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "text-sm font-semibold leading-6 text-gray-900 hover:text-gray-900/80",
                pathname === item.href ? "text-primary" : ""
              )}>
              {item.name}
            </Link>
          ))}
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          {isLoggedIn ? (
            <div className="flex items-center gap-4">
              <CartButton />
              <Link
                href="/account"
                className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <User className="h-5 w-5" />
                <span>Account</span>
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <Settings className="h-5 w-5" />
                  <span>Admin</span>
                </Link>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                href="/auth/login"
                className="text-sm font-semibold leading-6 text-gray-900">
                Log in <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          )}
        </div>
      </nav>
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden">
          <div className="fixed inset-0 z-50" />
          <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
            <div className="flex items-center justify-between">
              <Link
                href="/"
                className="-m-1.5 p-1.5">
                <span className="sr-only">TechTots</span>
                <div className="relative h-12 w-24">
                  <Image
                    className="object-contain"
                    src="/TechTots_LOGO.png"
                    alt="TechTots Logo"
                    fill
                  />
                </div>
              </Link>
              <button
                type="button"
                className="-m-2.5 rounded-md p-2.5 text-gray-700"
                onClick={() => setMobileMenuOpen(false)}>
                <span className="sr-only">Close menu</span>
                <X
                  className="h-6 w-6"
                  aria-hidden="true"
                />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-gray-500/10">
                <div className="space-y-2 py-6">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50",
                        pathname === item.href ? "text-primary" : ""
                      )}>
                      {item.name}
                    </Link>
                  ))}
                </div>
                <div className="py-6">
                  {isLoggedIn ? (
                    <>
                      <Link
                        href="/account"
                        className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50">
                        Account
                      </Link>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-primary hover:bg-gray-50">
                          Admin Dashboard
                        </Link>
                      )}
                    </>
                  ) : (
                    <Link
                      href="/auth/login"
                      className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50">
                      Log in
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
