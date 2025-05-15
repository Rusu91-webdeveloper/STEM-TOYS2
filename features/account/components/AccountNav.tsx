"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  Package,
  MapPin,
  CreditCard,
  Heart,
  Settings,
  LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";

const navItems = [
  {
    label: "Profile",
    href: "/account",
    icon: User,
  },
  {
    label: "Orders",
    href: "/account/orders",
    icon: Package,
  },
  {
    label: "Addresses",
    href: "/account/addresses",
    icon: MapPin,
  },
  {
    label: "Payment Methods",
    href: "/account/payment-methods",
    icon: CreditCard,
  },
  {
    label: "Wishlist",
    href: "/account/wishlist",
    icon: Heart,
  },
  {
    label: "Settings",
    href: "/account/settings",
    icon: Settings,
  },
];

export function AccountNav() {
  const pathname = usePathname();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center px-4 py-2 text-sm rounded-md ${
              isActive
                ? "bg-primary text-primary-foreground font-medium"
                : "text-gray-700 hover:bg-gray-100"
            }`}>
            <item.icon className="w-4 h-4 mr-3" />
            {item.label}
          </Link>
        );
      })}
      <button
        onClick={handleSignOut}
        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 rounded-md hover:bg-gray-100">
        <LogOut className="w-4 h-4 mr-3" />
        Sign Out
      </button>
    </nav>
  );
}
