"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, User, Settings, ShoppingCart, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CartButton } from "@/features/cart";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { CurrencySwitcher } from "@/components/ui/currency-switcher";
import { useTranslation } from "@/lib/i18n";
import { TranslationKey } from "@/lib/i18n/translations";
import { useSession, signOut } from "next-auth/react";

const navigation: { name: TranslationKey; href: string }[] = [
  { name: "home", href: "/" },
  { name: "products", href: "/products" },
  { name: "categories", href: "/categories" },
  { name: "blog", href: "/blog" },
  { name: "about", href: "/about" },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { t } = useTranslation();
  const { data: session, status } = useSession();

  // Check if user is logged in
  const isLoggedIn = status === "authenticated";
  // Check if user is admin
  const isAdmin = isLoggedIn && session?.user?.role === "ADMIN";

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <header className="bg-white sticky top-0 z-40 w-full border-b shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link
              href="/"
              className="flex items-center">
              <div className="relative h-16 w-40">
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

          {/* Navigation - Left Side (Categories) */}
          <div className="hidden md:flex md:items-center md:space-x-2 flex-1 max-w-xl mx-12">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "relative group px-4 py-2 mx-1 text-sm font-medium transition-all duration-200 rounded-md cursor-pointer",
                  pathname === item.href
                    ? "text-indigo-700 bg-indigo-50 shadow-sm"
                    : "text-gray-700 hover:text-indigo-600 hover:bg-indigo-50/50"
                )}>
                <span className="relative">
                  {t(item.name)}
                  <span
                    className={cn(
                      "absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-600 transition-all duration-200 group-hover:w-full",
                      pathname === item.href ? "w-full" : ""
                    )}></span>
                </span>
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 cursor-pointer"
              onClick={() => setMobileMenuOpen(true)}>
              <span className="sr-only">Open main menu</span>
              <Menu
                className="h-6 w-6"
                aria-hidden="true"
              />
            </button>
          </div>

          {/* Right side utilities */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <div className="flex items-center space-x-3">
              {/* Currency Switcher */}
              <div className="utility-item">
                <CurrencySwitcher />
              </div>

              {/* Language Switcher */}
              <div className="utility-item ml-1">
                <LanguageSwitcher />
              </div>

              {/* Cart Button */}
              <div className="utility-item ml-1">
                <CartButton />
              </div>
            </div>

            {/* Account and Admin */}
            {isLoggedIn ? (
              <div className="flex items-center space-x-3 ml-6 border-l pl-6 border-gray-200">
                <Link
                  href="/account"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-indigo-600 transition-colors cursor-pointer shadow-sm hover:shadow">
                  <User className="h-4 w-4" />
                  <span>{t("account")}</span>
                </Link>

                {isAdmin && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors cursor-pointer shadow-sm hover:shadow">
                    <Settings className="h-4 w-4" />
                    <span>{t("admin")}</span>
                  </Link>
                )}

                <Button
                  onClick={handleSignOut}
                  variant="ghost"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer shadow-sm hover:shadow">
                  <LogOut className="h-4 w-4" />
                  <span>{t("logout")}</span>
                </Button>
              </div>
            ) : (
              <div className="ml-6 border-l pl-6 border-gray-200">
                <Link
                  href="/auth/login"
                  className="flex items-center gap-1 px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm hover:shadow cursor-pointer">
                  {t("login")}
                  <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div
            className="fixed inset-0 z-50 bg-gray-800 bg-opacity-50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
            <div className="flex items-center justify-between">
              <Link
                href="/"
                className="-m-1.5 p-1.5">
                <span className="sr-only">TechTots</span>
                <div className="relative h-16 w-32">
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
                className="-m-2.5 rounded-md p-2.5 text-gray-700 hover:bg-gray-100 cursor-pointer"
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
                        "block rounded-md px-4 py-3 text-base font-medium transition-all cursor-pointer",
                        pathname === item.href
                          ? "bg-indigo-50 text-indigo-700 shadow-sm"
                          : "text-gray-900 hover:bg-gray-50 hover:text-indigo-600"
                      )}
                      onClick={() => setMobileMenuOpen(false)}>
                      {t(item.name)}
                    </Link>
                  ))}
                </div>

                <div className="py-4">
                  <div className="flex flex-wrap gap-3 mb-6 mt-2">
                    <CurrencySwitcher />
                    <LanguageSwitcher />
                    <CartButton />
                  </div>

                  <div className="border-t border-gray-200 pt-4 mt-2">
                    {isLoggedIn ? (
                      <>
                        <Link
                          href="/account"
                          className="block rounded-md px-4 py-3 text-base font-medium text-gray-900 hover:bg-gray-50 hover:text-indigo-600 mb-2 cursor-pointer"
                          onClick={() => setMobileMenuOpen(false)}>
                          <div className="flex items-center">
                            <User className="h-5 w-5 mr-2" />
                            <span>{t("account")}</span>
                          </div>
                        </Link>
                        {isAdmin && (
                          <Link
                            href="/admin"
                            className="block rounded-md px-4 py-3 text-base font-medium bg-indigo-50 text-indigo-600 hover:bg-indigo-100 cursor-pointer mb-2"
                            onClick={() => setMobileMenuOpen(false)}>
                            <div className="flex items-center">
                              <Settings className="h-5 w-5 mr-2" />
                              <span>{t("admin")}</span>
                            </div>
                          </Link>
                        )}
                        <button
                          onClick={() => {
                            handleSignOut();
                            setMobileMenuOpen(false);
                          }}
                          className="w-full block rounded-md px-4 py-3 text-base font-medium text-red-600 hover:bg-red-50 cursor-pointer">
                          <div className="flex items-center">
                            <LogOut className="h-5 w-5 mr-2" />
                            <span>{t("logout")}</span>
                          </div>
                        </button>
                      </>
                    ) : (
                      <Link
                        href="/auth/login"
                        className="flex items-center justify-center gap-2 w-full rounded-md bg-indigo-600 px-4 py-3 text-center text-base font-medium text-white shadow-sm hover:bg-indigo-700 cursor-pointer"
                        onClick={() => setMobileMenuOpen(false)}>
                        {t("login")}
                        <span aria-hidden="true">&rarr;</span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
