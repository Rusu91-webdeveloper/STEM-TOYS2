"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

type RouteStatus = {
  path: string;
  status: "working" | "error" | "checking";
  error?: string;
};

export default function TestRoutesPage() {
  const [routes, setRoutes] = useState<RouteStatus[]>([
    { path: "/", status: "checking" },
    { path: "/products", status: "checking" },
    { path: "/products/stem-toy-1", status: "checking" },
    { path: "/about", status: "checking" },
    { path: "/auth/login", status: "checking" },
    { path: "/auth/register", status: "checking" },
    { path: "/check", status: "checking" },
  ]);

  useEffect(() => {
    const checkRoutes = async () => {
      const updatedRoutes = [...routes];

      for (let i = 0; i < updatedRoutes.length; i++) {
        const route = updatedRoutes[i];
        try {
          const response = await fetch(route.path);
          if (response.ok) {
            route.status = "working";
          } else {
            route.status = "error";
            route.error = `Status: ${response.status}`;
          }
        } catch (error) {
          route.status = "error";
          route.error = String(error);
        }
        setRoutes([...updatedRoutes]);
      }
    };

    checkRoutes();
  }, []);

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Route Testing Page</h1>
      <p className="mb-8">
        This page checks all important routes in the application
      </p>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300 rounded-lg">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-3 px-4 text-left border-b">Route</th>
              <th className="py-3 px-4 text-left border-b">Status</th>
              <th className="py-3 px-4 text-left border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {routes.map((route, index) => (
              <tr
                key={index}
                className={index % 2 === 0 ? "bg-gray-50" : ""}>
                <td className="py-3 px-4 border-b">{route.path}</td>
                <td className="py-3 px-4 border-b">
                  {route.status === "checking" && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Checking...
                    </span>
                  )}
                  {route.status === "working" && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Working
                    </span>
                  )}
                  {route.status === "error" && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Error: {route.error}
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 border-b">
                  <Link
                    href={route.path}
                    className="text-blue-600 hover:underline mr-4">
                    Visit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
