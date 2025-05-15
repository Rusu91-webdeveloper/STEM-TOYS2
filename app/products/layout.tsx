import React from "react";

export const metadata = {
  title: "Products | NextCommerce",
  description: "Browse our collection of educational STEM toys for children",
};

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Page header banner */}
      <div className="bg-slate-100 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">Educational STEM Toys</h1>
          <p className="mt-2 text-slate-600 max-w-3xl">
            Explore our collection of educational toys designed to inspire
            curiosity and foster learning in science, technology, engineering,
            and mathematics.
          </p>
        </div>
      </div>

      {/* Main content */}
      <main>{children}</main>
    </>
  );
}
