import React from "react";
import TestProductForm from "@/components/admin/TestProductForm";

export default function TestProductPage() {
  return (
    <div className="container mx-auto py-10 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Test Product Creation</h1>
      <TestProductForm />
    </div>
  );
}
