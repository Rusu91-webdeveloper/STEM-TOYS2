import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Filter,
  ArrowUpDown,
  MoreHorizontal,
  Mail,
  Download,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock customers data
const customers = [
  {
    id: "C001",
    name: "Emma Thompson",
    email: "emma.t@example.com",
    joined: "May 10, 2023",
    orders: 12,
    spent: 1249.95,
    status: "Active",
  },
  {
    id: "C002",
    name: "John Miller",
    email: "john.m@example.com",
    joined: "June 22, 2023",
    orders: 8,
    spent: 789.5,
    status: "Active",
  },
  {
    id: "C003",
    name: "Olivia Wilson",
    email: "olivia.w@example.com",
    joined: "April 5, 2024",
    orders: 3,
    spent: 349.97,
    status: "Active",
  },
  {
    id: "C004",
    name: "William Davis",
    email: "william.d@example.com",
    joined: "March 14, 2023",
    orders: 15,
    spent: 1587.25,
    status: "Active",
  },
  {
    id: "C005",
    name: "Sophia Martinez",
    email: "sophia.m@example.com",
    joined: "August 9, 2023",
    orders: 7,
    spent: 642.85,
    status: "Active",
  },
  {
    id: "C006",
    name: "James Johnson",
    email: "james.j@example.com",
    joined: "December 1, 2023",
    orders: 4,
    spent: 398.96,
    status: "Inactive",
  },
  {
    id: "C007",
    name: "Charlotte Brown",
    email: "charlotte.b@example.com",
    joined: "February 18, 2024",
    orders: 2,
    spent: 179.98,
    status: "Active",
  },
  {
    id: "C008",
    name: "Benjamin Garcia",
    email: "benjamin.g@example.com",
    joined: "September 30, 2023",
    orders: 9,
    spent: 859.91,
    status: "Active",
  },
];

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span>Email All</span>
          </Button>
          <Button
            variant="outline"
            className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex w-full max-w-sm items-center space-x-2">
              <Input
                type="search"
                placeholder="Search customers..."
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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="newest">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort By" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                  <SelectItem value="spent-high">Highest Spent</SelectItem>
                  <SelectItem value="spent-low">Lowest Spent</SelectItem>
                  <SelectItem value="orders-high">Most Orders</SelectItem>
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
                      <span>Customer</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <div className="flex items-center gap-1">
                      <span>Joined</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <div className="flex items-center gap-1">
                      <span>Orders</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left">
                    <div className="flex items-center gap-1">
                      <span>Total Spent</span>
                      <ArrowUpDown className="h-3 w-3" />
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="border-b text-sm hover:bg-muted/50">
                    <td className="px-4 py-4">
                      <div>
                        <Link
                          href={`/admin/customers/${customer.id.toLowerCase()}`}
                          className="font-medium text-primary hover:underline">
                          {customer.name}
                        </Link>
                        <div className="text-xs text-muted-foreground">
                          {customer.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">{customer.joined}</td>
                    <td className="px-4 py-4">{customer.orders}</td>
                    <td className="px-4 py-4 font-medium">
                      ${customer.spent.toFixed(2)}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          customer.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}>
                        {customer.status}
                      </span>
                    </td>
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
              Showing {customers.length} of {customers.length} customers
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
