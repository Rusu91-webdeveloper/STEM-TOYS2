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

// Mock data for dashboard
const stats = [
  {
    title: "Total Revenue",
    value: "$12,486.89",
    change: "+14.5%",
    trend: "up",
    icon: <DollarSign className="h-8 w-8" />,
    description: "Last 30 days",
  },
  {
    title: "Total Orders",
    value: "368",
    change: "+8.2%",
    trend: "up",
    icon: <ShoppingBag className="h-8 w-8" />,
    description: "Last 30 days",
  },
  {
    title: "New Customers",
    value: "45",
    change: "-2.4%",
    trend: "down",
    icon: <Users className="h-8 w-8" />,
    description: "Last 30 days",
  },
  {
    title: "Total Products",
    value: "127",
    change: "+3.1%",
    trend: "up",
    icon: <Package className="h-8 w-8" />,
    description: "Active products",
  },
];

// Mock recent orders data
const recentOrders = [
  {
    id: "ORD-7652",
    customer: "Emma Thompson",
    date: "May 14, 2025",
    amount: "$124.99",
    status: "Completed",
  },
  {
    id: "ORD-7651",
    customer: "John Miller",
    date: "May 14, 2025",
    amount: "$89.95",
    status: "Processing",
  },
  {
    id: "ORD-7650",
    customer: "Olivia Wilson",
    date: "May 13, 2025",
    amount: "$249.99",
    status: "Completed",
  },
  {
    id: "ORD-7649",
    customer: "William Davis",
    date: "May 13, 2025",
    amount: "$175.85",
    status: "Shipped",
  },
  {
    id: "ORD-7648",
    customer: "Sophia Martinez",
    date: "May 12, 2025",
    amount: "$64.49",
    status: "Processing",
  },
];

// Mock top products data
const topProducts = [
  { name: "Robotic Building Kit", price: "$59.99", sales: 45, inventory: 32 },
  { name: "Chemistry Lab Set", price: "$49.99", sales: 38, inventory: 24 },
  {
    name: "Magnetic Building Tiles",
    price: "$39.99",
    sales: 36,
    inventory: 18,
  },
  { name: "Math Puzzle Game", price: "$29.99", sales: 32, inventory: 27 },
  { name: "Coding Robot for Kids", price: "$79.99", sales: 28, inventory: 15 },
];

export default function AdminDashboard() {
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
        <Link href="/admin/users">
          <Card className="p-6 hover:bg-slate-50 transition-colors cursor-pointer h-full">
            <h3 className="text-lg font-medium mb-2">Manage Users</h3>
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
        {stats.map((stat) => (
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
                {stat.icon}
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
                {recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b last:border-0 text-sm">
                    <td className="py-3 pr-2">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-primary hover:underline">
                        {order.id}
                      </Link>
                    </td>
                    <td className="py-3 pr-2">{order.customer}</td>
                    <td className="py-3 pr-2">{order.date}</td>
                    <td className="py-3 pr-2">{order.amount}</td>
                    <td className="py-3 pr-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          order.status === "Completed"
                            ? "bg-green-100 text-green-800"
                            : order.status === "Processing"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
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
                {topProducts.map((product) => (
                  <tr
                    key={product.name}
                    className="border-b last:border-0 text-sm">
                    <td className="py-3 pr-2">
                      <Link
                        href={`/admin/products/${product.name.toLowerCase().replace(/\s+/g, "-")}`}
                        className="text-primary hover:underline">
                        {product.name}
                      </Link>
                    </td>
                    <td className="py-3 pr-2">{product.price}</td>
                    <td className="py-3 pr-2">{product.sales} units</td>
                    <td className="py-3 pr-2">
                      <span
                        className={`${
                          product.inventory > 20
                            ? "text-green-600"
                            : product.inventory > 10
                              ? "text-yellow-600"
                              : "text-red-600"
                        }`}>
                        {product.inventory} in stock
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
