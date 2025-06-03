import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  ShoppingBag,
  Users,
  CreditCard,
  Activity,
  Calendar,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SalesChart } from "./components/sales-chart";

// Define types for our API responses
interface SalesData {
  daily: number;
  weekly: number;
  monthly: number;
  previousPeriodChange: number;
  trending: "up" | "down";
}

interface OrderStats {
  conversionRate: {
    rate: number;
    previousPeriodChange: number;
    trending: "up" | "down";
  };
  averageOrderValue: {
    value: number;
    previousPeriodChange: number;
    trending: "up" | "down";
  };
  totalCustomers: {
    value: number;
    previousPeriodChange: number;
    trending: "up" | "down";
  };
}

interface TopSellingProduct {
  name: string;
  price: number;
  sold: number;
  revenue: number;
}

interface CategorySales {
  categoryId: string;
  category: string;
  amount: number;
  percentage: number;
}

interface SalesByDay {
  date: string;
  sales: number;
}

interface AnalyticsData {
  salesData: SalesData;
  orderStats: OrderStats;
  topSellingProducts: TopSellingProduct[];
  salesByCategory: CategorySales[];
}

interface SalesChartData {
  salesData: SalesByDay[];
}

// Function to fetch analytics data from our API
async function getAnalyticsData(period: number = 30): Promise<AnalyticsData> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/admin/analytics?period=${period}`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch analytics data");
  }

  return response.json();
}

// Function to fetch sales chart data
async function getSalesChartData(period: number = 30): Promise<SalesChartData> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/admin/analytics/sales-chart?period=${period}`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch sales chart data");
  }

  return response.json();
}

export default async function AnalyticsPage() {
  // Check authentication
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  // Default period is 30 days
  const period = 30;

  // Fetch data from our API endpoints
  const [analyticsData, salesChartData] = await Promise.all([
    getAnalyticsData(period),
    getSalesChartData(period),
  ]);

  const { salesData, orderStats, topSellingProducts, salesByCategory } =
    analyticsData;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Last 30 days</span>
          </Button>
          <Button
            size="sm"
            className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span>Export Report</span>
          </Button>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Sales Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">
                  Total Sales
                </p>
                <div className="rounded-full bg-primary/10 p-1 text-primary">
                  <ShoppingBag className="h-4 w-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-bold">
                  ${salesData.monthly.toLocaleString()}
                </h3>
                <span
                  className={`text-xs font-medium flex items-center ${
                    salesData.trending === "up"
                      ? "text-green-500"
                      : "text-red-500"
                  }`}>
                  {salesData.trending === "up" ? (
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                  )}
                  {salesData.previousPeriodChange}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <div>
                  <p className="text-muted-foreground">Daily</p>
                  <p className="font-medium">
                    ${salesData.daily.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Weekly</p>
                  <p className="font-medium">
                    ${salesData.weekly.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conversion Rate Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">
                  Conversion Rate
                </p>
                <div className="rounded-full bg-primary/10 p-1 text-primary">
                  <Activity className="h-4 w-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-bold">
                  {orderStats.conversionRate.rate}%
                </h3>
                <span
                  className={`text-xs font-medium flex items-center ${
                    orderStats.conversionRate.trending === "up"
                      ? "text-green-500"
                      : "text-red-500"
                  }`}>
                  {orderStats.conversionRate.trending === "up" ? (
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                  )}
                  {Math.abs(orderStats.conversionRate.previousPeriodChange)}%
                </span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Visitors who made purchases
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Average Order Value Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">
                  Average Order Value
                </p>
                <div className="rounded-full bg-primary/10 p-1 text-primary">
                  <CreditCard className="h-4 w-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-bold">
                  ${orderStats.averageOrderValue.value.toFixed(2)}
                </h3>
                <span
                  className={`text-xs font-medium flex items-center ${
                    orderStats.averageOrderValue.trending === "up"
                      ? "text-green-500"
                      : "text-red-500"
                  }`}>
                  {orderStats.averageOrderValue.trending === "up" ? (
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                  )}
                  {orderStats.averageOrderValue.previousPeriodChange}%
                </span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Per transaction</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Customers Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">
                  Total Customers
                </p>
                <div className="rounded-full bg-primary/10 p-1 text-primary">
                  <Users className="h-4 w-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-bold">
                  {orderStats.totalCustomers.value.toLocaleString()}
                </h3>
                <span
                  className={`text-xs font-medium flex items-center ${
                    orderStats.totalCustomers.trending === "up"
                      ? "text-green-500"
                      : "text-red-500"
                  }`}>
                  {orderStats.totalCustomers.trending === "up" ? (
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                  )}
                  {orderStats.totalCustomers.previousPeriodChange}%
                </span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active accounts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Sales Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Sales Over Time</CardTitle>
            <CardDescription>
              Daily revenue for the past 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <SalesChart data={salesChartData.salesData} />
            </div>
          </CardContent>
        </Card>

        {/* Sales by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
            <CardDescription>
              Distribution of sales across product categories
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Category bars - real data from API */}
            <div className="space-y-4">
              {salesByCategory.map((category: CategorySales) => (
                <div
                  key={category.categoryId}
                  className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-3 w-3 rounded-full bg-primary`}
                        style={{
                          opacity: 0.3 + (category.percentage / 100) * 0.7,
                        }}></div>
                      <span className="text-sm font-medium">
                        {category.category}
                      </span>
                    </div>
                    <div className="text-sm">
                      ${category.amount.toLocaleString()}
                    </div>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{ width: `${category.percentage}%` }}></div>
                  </div>
                  <div className="text-xs text-muted-foreground text-right">
                    {category.percentage}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Selling Products */}
      <Card>
        <CardHeader>
          <CardTitle>Top Selling Products</CardTitle>
          <CardDescription>
            Best performing products in the last 30 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-xs font-medium text-muted-foreground">
                  <th className="pb-3 pt-1 text-left">Product</th>
                  <th className="pb-3 pt-1 text-left">Price</th>
                  <th className="pb-3 pt-1 text-left">Units Sold</th>
                  <th className="pb-3 pt-1 text-left">Revenue</th>
                  <th className="pb-3 pt-1 text-left">Performance</th>
                </tr>
              </thead>
              <tbody>
                {topSellingProducts.map(
                  (product: TopSellingProduct, index: number) => (
                    <tr
                      key={product.name}
                      className="border-b last:border-0">
                      <td className="py-3 text-sm font-medium">
                        {product.name}
                      </td>
                      <td className="py-3 text-sm">
                        ${product.price.toFixed(2)}
                      </td>
                      <td className="py-3 text-sm">{product.sold}</td>
                      <td className="py-3 text-sm">
                        ${product.revenue.toFixed(2)}
                      </td>
                      <td className="py-3">
                        <div className="flex w-32 items-center gap-2">
                          <div className="h-2 w-full rounded-full bg-muted">
                            <div
                              className="h-2 rounded-full bg-primary"
                              style={{ width: `${100 - index * 15}%` }}></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
