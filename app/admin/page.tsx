import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { getDashboardData } from "@/lib/admin/api";
import type { DashboardStat, RecentOrder, TopProduct } from "@/lib/admin/api";

// Mark this route as dynamic to prevent static generation errors
export const dynamic = "force-dynamic";

// Dashboard icons for stats
const ICONS: Record<string, React.ReactNode> = {
  "Total Revenue": <DollarSign className="h-8 w-8" />,
  "Total Orders": <ShoppingBag className="h-8 w-8" />,
  "New Customers": <Users className="h-8 w-8" />,
  "Total Products": <Package className="h-8 w-8" />,
};

export default async function AdminDashboard() {
  // Fetch real data from the API
  const { stats, recentOrders, topProducts } = await getDashboardData();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Last 30 days</span>
          </Button>
          <Button size="sm">
            <TrendingUp className="h-4 w-4 mr-2" />
            View Reports
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/featured-products">
          <Card className="p-6 hover:bg-slate-50 transition-colors cursor-pointer h-full">
            <h3 className="text-lg font-medium mb-2">
              Manage Featured Products
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Select products to showcase on the homepage
            </p>
            <div className="flex justify-end">
              <span className="text-primary text-sm font-medium flex items-center">
                Manage
                <ArrowUpRight className="h-4 w-4 ml-1" />
              </span>
            </div>
          </Card>
        </Link>
        <Link href="/admin/products">
          <Card className="p-6 hover:bg-slate-50 transition-colors cursor-pointer h-full">
            <h3 className="text-lg font-medium mb-2">Manage Products</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add, edit, or remove products
            </p>
            <div className="flex justify-end">
              <span className="text-primary text-sm font-medium flex items-center">
                Manage
                <ArrowUpRight className="h-4 w-4 ml-1" />
              </span>
            </div>
          </Card>
        </Link>
        <Link href="/admin/orders">
          <Card className="p-6 hover:bg-slate-50 transition-colors cursor-pointer h-full">
            <h3 className="text-lg font-medium mb-2">View Orders</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Manage customer orders and shipments
            </p>
            <div className="flex justify-end">
              <span className="text-primary text-sm font-medium flex items-center">
                View
                <ArrowUpRight className="h-4 w-4 ml-1" />
              </span>
            </div>
          </Card>
        </Link>
        <Link href="/admin/customers">
          <Card className="p-6 hover:bg-slate-50 transition-colors cursor-pointer h-full">
            <h3 className="text-lg font-medium mb-2">Manage Customers</h3>
            <p className="text-sm text-muted-foreground mb-4">
              View and manage customer accounts
            </p>
            <div className="flex justify-end">
              <span className="text-primary text-sm font-medium flex items-center">
                Manage
                <ArrowUpRight className="h-4 w-4 ml-1" />
              </span>
            </div>
          </Card>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat: DashboardStat) => (
          <Card
            key={stat.title}
            className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold">{stat.value}</h3>
                  <span
                    className={`text-xs font-medium flex items-center ${
                      stat.trend === "up" ? "text-green-500" : "text-red-500"
                    }`}>
                    {stat.trend === "up" ? (
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 mr-1" />
                    )}
                    {stat.change}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </div>
              <div className="rounded-full bg-primary/10 p-3 text-primary">
                {ICONS[stat.title] || <Package className="h-8 w-8" />}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Recent Orders</h2>
            <Link
              href="/admin/orders"
              className="text-sm text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-xs text-muted-foreground">
                  <th className="pb-2 font-medium text-left">Order ID</th>
                  <th className="pb-2 font-medium text-left">Customer</th>
                  <th className="pb-2 font-medium text-left">Date</th>
                  <th className="pb-2 font-medium text-left">Amount</th>
                  <th className="pb-2 font-medium text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order: RecentOrder) => (
                  <tr
                    key={order.id}
                    className="border-b last:border-0 text-sm">
                    <td className="py-3 pr-4">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-medium text-primary hover:underline">
                        {order.id}
                      </Link>
                    </td>
                    <td className="py-3 pr-4">{order.customer}</td>
                    <td className="py-3 pr-4">{order.date}</td>
                    <td className="py-3 pr-4">{order.amount}</td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          order.status === "Completed"
                            ? "bg-green-100 text-green-700"
                            : order.status === "Processing"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-amber-100 text-amber-700"
                        }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {recentOrders.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-4 text-center text-muted-foreground">
                      No orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Top Products */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Top Products</h2>
            <Link
              href="/admin/products"
              className="text-sm text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-xs text-muted-foreground">
                  <th className="pb-2 font-medium text-left">Product</th>
                  <th className="pb-2 font-medium text-left">Price</th>
                  <th className="pb-2 font-medium text-left">Sales</th>
                  <th className="pb-2 font-medium text-left">Inventory</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((product: TopProduct) => (
                  <tr
                    key={product.id}
                    className="border-b last:border-0 text-sm">
                    <td className="py-3 pr-4">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="font-medium hover:text-primary hover:underline">
                        {product.name}
                      </Link>
                    </td>
                    <td className="py-3 pr-4">${product.price.toFixed(2)}</td>
                    <td className="py-3 pr-4">{product.sales}</td>
                    <td className="py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                          product.inventory > 10
                            ? "bg-green-100 text-green-700"
                            : product.inventory > 0
                              ? "bg-amber-100 text-amber-700"
                              : "bg-red-100 text-red-700"
                        }`}>
                        {product.inventory === 0
                          ? "Out of Stock"
                          : product.inventory < 5
                            ? "Low Stock"
                            : product.inventory}
                      </span>
                    </td>
                  </tr>
                ))}
                {topProducts.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-4 text-center text-muted-foreground">
                      No product data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
