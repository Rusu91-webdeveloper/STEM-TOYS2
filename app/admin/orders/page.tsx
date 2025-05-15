import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Filter,
  ArrowUpDown,
  CheckCircle2,
  Clock,
  Truck,
  AlertCircle,
  MoreHorizontal,
  Download,
  RotateCw,
  Ban,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock orders data
const orders = [
  {
    id: "ORD-7652",
    customer: "Emma Thompson",
    email: "emma.t@example.com",
    date: "May 14, 2025",
    total: 124.99,
    status: "Completed",
    payment: "Credit Card",
    items: 3,
  },
  {
    id: "ORD-7651",
    customer: "John Miller",
    email: "john.m@example.com",
    date: "May 14, 2025",
    total: 89.95,
    status: "Processing",
    payment: "PayPal",
    items: 2,
  },
  {
    id: "ORD-7650",
    customer: "Olivia Wilson",
    email: "olivia.w@example.com",
    date: "May 13, 2025",
    total: 249.99,
    status: "Completed",
    payment: "Credit Card",
    items: 4,
  },
  {
    id: "ORD-7649",
    customer: "William Davis",
    email: "william.d@example.com",
    date: "May 13, 2025",
    total: 175.85,
    status: "Shipped",
    payment: "Credit Card",
    items: 3,
  },
  {
    id: "ORD-7648",
    customer: "Sophia Martinez",
    email: "sophia.m@example.com",
    date: "May 12, 2025",
    total: 64.49,
    status: "Processing",
    payment: "PayPal",
    items: 1,
  },
  {
    id: "ORD-7647",
    customer: "James Johnson",
    email: "james.j@example.com",
    date: "May 12, 2025",
    total: 145.99,
    status: "Cancelled",
    payment: "Credit Card",
    items: 2,
  },
  {
    id: "ORD-7646",
    customer: "Charlotte Brown",
    email: "charlotte.b@example.com",
    date: "May 11, 2025",
    total: 199.95,
    status: "Shipped",
    payment: "Credit Card",
    items: 3,
  },
  {
    id: "ORD-7645",
    customer: "Benjamin Garcia",
    email: "benjamin.g@example.com",
    date: "May 11, 2025",
    total: 79.99,
    status: "Completed",
    payment: "PayPal",
    items: 1,
  },
];

// Helper function to get status icon
const getStatusIcon = (status: string) => {
  switch (status) {
    case "Completed":
      return <CheckCircle2 className="mr-1 h-3 w-3" />;
    case "Processing":
      return <Clock className="mr-1 h-3 w-3" />;
    case "Shipped":
      return <Truck className="mr-1 h-3 w-3" />;
    case "Cancelled":
      return <Ban className="mr-1 h-3 w-3" />;
    default:
      return <AlertCircle className="mr-1 h-3 w-3" />;
  }
};

// Helper function to get status color
const getStatusColor = (status: string) => {
  switch (status) {
    case "Completed":
      return "bg-green-100 text-green-800";
    case "Processing":
      return "bg-blue-100 text-blue-800";
    case "Shipped":
      return "bg-purple-100 text-purple-800";
    case "Cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Orders</h1>
        <Button
          variant="outline"
          className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          <span>Export</span>
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex w-full max-w-sm items-center space-x-2">
              <Input
                type="search"
                placeholder="Search orders or customers..."
                className="w-full"
              />
              <Button
                variant="outline"
                size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="30">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Time Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b text-xs font-medium text-muted-foreground">
                  <th className="px-4 py-3 text-left">
                    <div className="flex items-center gap-1">
                      <span>Order</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <div className="flex items-center gap-1">
                      <span>Date</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left">Customer</th>
                  <th className="px-4 py-3 text-left">
                    <div className="flex items-center gap-1">
                      <span>Total</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Payment</th>
                  <th className="px-4 py-3 text-left">Items</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b text-sm hover:bg-muted/50">
                    <td className="px-4 py-4">
                      <Link
                        href={`/admin/orders/${order.id.toLowerCase()}`}
                        className="font-medium text-primary hover:underline">
                        {order.id}
                      </Link>
                    </td>
                    <td className="px-4 py-4">{order.date}</td>
                    <td className="px-4 py-4">
                      <div>
                        <div>{order.customer}</div>
                        <div className="text-xs text-muted-foreground">
                          {order.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-medium">
                      ${order.total.toFixed(2)}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">{order.payment}</td>
                    <td className="px-4 py-4">{order.items} items</td>
                    <td className="px-4 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {orders.length} of {orders.length} orders
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled>
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1">
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
