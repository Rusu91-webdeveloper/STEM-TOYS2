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

// Mock data for analytics
const salesData = {
  daily: 1245.89,
  weekly: 8976.54,
  monthly: 34521.76,
  previousPeriodChange: 14.5,
  trending: "up",
};

const conversionRateData = {
  rate: 3.2,
  previousPeriodChange: -0.8,
  trending: "down",
};

const averageOrderValueData = {
  value: 78.45,
  previousPeriodChange: 5.2,
  trending: "up",
};

const totalCustomersData = {
  value: 1876,
  previousPeriodChange: 12.3,
  trending: "up",
};

const topSellingProducts = [
  { name: "Robotic Building Kit", price: 59.99, sold: 45, revenue: 2699.55 },
  { name: "Chemistry Lab Set", price: 49.99, sold: 38, revenue: 1899.62 },
  { name: "Magnetic Building Tiles", price: 39.99, sold: 36, revenue: 1439.64 },
  { name: "Math Puzzle Game", price: 29.99, sold: 32, revenue: 959.68 },
  { name: "Coding Robot for Kids", price: 79.99, sold: 28, revenue: 2239.72 },
];

const salesByCategory = [
  { category: "Technology", amount: 12540.75, percentage: 35 },
  { category: "Science", amount: 9872.5, percentage: 28 },
  { category: "Engineering", amount: 7654.25, percentage: 22 },
  { category: "Math", amount: 5321.75, percentage: 15 },
];

export default function AnalyticsPage() {
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
                  {conversionRateData.rate}%
                </h3>
                <span
                  className={`text-xs font-medium flex items-center ${
                    conversionRateData.trending === "up"
                      ? "text-green-500"
                      : "text-red-500"
                  }`}>
                  {conversionRateData.trending === "up" ? (
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                  )}
                  {Math.abs(conversionRateData.previousPeriodChange)}%
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
                  ${averageOrderValueData.value.toFixed(2)}
                </h3>
                <span
                  className={`text-xs font-medium flex items-center ${
                    averageOrderValueData.trending === "up"
                      ? "text-green-500"
                      : "text-red-500"
                  }`}>
                  {averageOrderValueData.trending === "up" ? (
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                  )}
                  {averageOrderValueData.previousPeriodChange}%
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
                  {totalCustomersData.value.toLocaleString()}
                </h3>
                <span
                  className={`text-xs font-medium flex items-center ${
                    totalCustomersData.trending === "up"
                      ? "text-green-500"
                      : "text-red-500"
                  }`}>
                  {totalCustomersData.trending === "up" ? (
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 mr-1" />
                  )}
                  {totalCustomersData.previousPeriodChange}%
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
        {/* Sales Chart Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Sales Over Time</CardTitle>
            <CardDescription>
              Daily revenue for the past 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* In a real app, this would be a chart component */}
            <div className="h-80 w-full rounded-md bg-gradient-to-r from-muted/50 to-muted p-8 flex items-center justify-center">
              <p className="text-muted-foreground text-center">
                Sales chart would render here with real data.
                <br />
                Add a charting library like Chart.js, Recharts, or Tremor.
                <br />
                The actual implementation would display daily sales trends.
              </p>
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
            {/* Category bars - in a real app this would be a pie/bar chart */}
            <div className="space-y-4">
              {salesByCategory.map((category) => (
                <div
                  key={category.category}
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
                {topSellingProducts.map((product, index) => (
                  <tr
                    key={product.name}
                    className="border-b last:border-0">
                    <td className="py-3 text-sm font-medium">{product.name}</td>
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
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
