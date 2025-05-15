"use client";

import React from "react";
import Link from "next/link";

export default function CheckPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">System Check Page</h1>
      <p className="mb-4">
        If you can see this page, the basic routing is working properly.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-4">Navigation Links</h2>
      <ul className="space-y-2">
        <li>
          <Link
            href="/"
            className="text-blue-600 hover:underline">
            Home
          </Link>
        </li>
        <li>
          <Link
            href="/products"
            className="text-blue-600 hover:underline">
            Products
          </Link>
        </li>
        <li>
          <Link
            href="/about"
            className="text-blue-600 hover:underline">
            About
          </Link>
        </li>
        <li>
          <Link
            href="/auth/login"
            className="text-blue-600 hover:underline">
            Login
          </Link>
        </li>
        <li>
          <Link
            href="/auth/register"
            className="text-blue-600 hover:underline">
            Register
          </Link>
        </li>
      </ul>
    </div>
  );
}
