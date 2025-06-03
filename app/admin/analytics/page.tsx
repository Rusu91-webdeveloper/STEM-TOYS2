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
import { db } from "@/lib/db";

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

/**
 * Fetch sales data with aggregations for daily, weekly, and monthly
 */
async function fetchSalesData(startDate: Date, endDate: Date) {
  // Get current period sales data
  const currentPeriodSales = await db.order.aggregate({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
      status: {
        in: ["COMPLETED", "DELIVERED", "SHIPPED"],
      },
    },
    _sum: {
      total: true,
    },
  });

  // Calculate daily sales
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const dailySales = await db.order.aggregate({
    where: {
      createdAt: {
        gte: yesterday,
        lte: today,
      },
      status: {
        in: ["COMPLETED", "DELIVERED", "SHIPPED"],
      },
    },
    _sum: {
      total: true,
    },
  });

  // Calculate weekly sales
  const weekStartDate = new Date();
  weekStartDate.setDate(today.getDate() - 7);

  const weeklySales = await db.order.aggregate({
    where: {
      createdAt: {
        gte: weekStartDate,
        lte: today,
      },
      status: {
        in: ["COMPLETED", "DELIVERED", "SHIPPED"],
      },
    },
    _sum: {
      total: true,
    },
  });

  // Get previous period data for comparison
  const prevPeriodStartDate = new Date(startDate);
  prevPeriodStartDate.setDate(
    prevPeriodStartDate.getDate() -
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const previousPeriodSales = await db.order.aggregate({
    where: {
      createdAt: {
        gte: prevPeriodStartDate,
        lt: startDate,
      },
      status: {
        in: ["COMPLETED", "DELIVERED", "SHIPPED"],
      },
    },
    _sum: {
      total: true,
    },
  });

  // Calculate percentage change
  const currentTotal = currentPeriodSales._sum.total || 0;
  const previousTotal = previousPeriodSales._sum.total || 0;

  let percentageChange = 0;
  if (previousTotal > 0) {
    percentageChange = ((currentTotal - previousTotal) / previousTotal) * 100;
  } else if (currentTotal > 0) {
    percentageChange = 100;
  }

  return {
    daily: dailySales._sum.total || 0,
    weekly: weeklySales._sum.total || 0,
    monthly: currentTotal,
    previousPeriodChange: parseFloat(percentageChange.toFixed(1)),
    trending: percentageChange >= 0 ? "up" : "down",
  };
}

/**
 * Fetch order stats including conversion rate and avg order value
 */
async function fetchOrderStats(startDate: Date, endDate: Date) {
  // Total orders in period
  const totalOrders = await db.order.count({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  // Total customers in the system
  const totalCustomers = await db.user.count({
    where: {
      role: "CUSTOMER",
    },
  });

  // New customers in period
  const newCustomers = await db.user.count({
    where: {
      role: "CUSTOMER",
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
  });

  // Previous period data for comparison
  const prevPeriodStartDate = new Date(startDate);
  prevPeriodStartDate.setDate(
    prevPeriodStartDate.getDate() -
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const prevPeriodNewCustomers = await db.user.count({
    where: {
      role: "CUSTOMER",
      createdAt: {
        gte: prevPeriodStartDate,
        lt: startDate,
      },
    },
  });

  // Calculate customer growth percentage
  let customerGrowthPercentage = 0;
  if (prevPeriodNewCustomers > 0) {
    customerGrowthPercentage =
      ((newCustomers - prevPeriodNewCustomers) / prevPeriodNewCustomers) * 100;
  } else if (newCustomers > 0) {
    customerGrowthPercentage = 100;
  }

  // Average order value
  const orderValues = await db.order.aggregate({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
      status: {
        in: ["COMPLETED", "DELIVERED", "SHIPPED"],
      },
    },
    _avg: {
      total: true,
    },
  });

  // Previous period average order value
  const prevOrderValues = await db.order.aggregate({
    where: {
      createdAt: {
        gte: prevPeriodStartDate,
        lt: startDate,
      },
      status: {
        in: ["COMPLETED", "DELIVERED", "SHIPPED"],
      },
    },
    _avg: {
      total: true,
    },
  });

  // Calculate AOV growth percentage
  const currentAOV = orderValues._avg.total || 0;
  const prevAOV = prevOrderValues._avg.total || 0;

  let aovGrowthPercentage = 0;
  if (prevAOV > 0) {
    aovGrowthPercentage = ((currentAOV - prevAOV) / prevAOV) * 100;
  } else if (currentAOV > 0) {
    aovGrowthPercentage = 100;
  }

  // Estimated site visits for conversion rate
  const estimatedVisits = totalOrders * 25; // Simple estimation
  const conversionRate =
    estimatedVisits > 0 ? (totalOrders / estimatedVisits) * 100 : 0;

  // Simulate previous conversion rate (in real app, get from analytics)
  const previousConversionRate = conversionRate * 0.9; // 10% lower than current
  const conversionRateChange =
    ((conversionRate - previousConversionRate) / previousConversionRate) * 100;

  return {
    conversionRate: {
      rate: parseFloat(conversionRate.toFixed(1)),
      previousPeriodChange: parseFloat(conversionRateChange.toFixed(1)),
      trending: conversionRateChange >= 0 ? "up" : "down",
    },
    averageOrderValue: {
      value: parseFloat(currentAOV.toFixed(2)),
      previousPeriodChange: parseFloat(aovGrowthPercentage.toFixed(1)),
      trending: aovGrowthPercentage >= 0 ? "up" : "down",
    },
    totalCustomers: {
      value: totalCustomers,
      previousPeriodChange: parseFloat(customerGrowthPercentage.toFixed(1)),
      trending: customerGrowthPercentage >= 0 ? "up" : "down",
    },
  };
}

/**
 * Fetch top selling products
 */
async function fetchTopSellingProducts(startDate: Date, endDate: Date) {
  // Get top products by quantity sold
  const topSoldProducts = await db.$queryRaw`
    SELECT 
      p.id, 
      p.name, 
      p.price, 
      SUM(oi.quantity) AS sold,
      SUM(oi.price * oi.quantity) AS revenue
    FROM "OrderItem" oi
    JOIN "Product" p ON oi."productId" = p.id
    JOIN "Order" o ON oi."orderId" = o.id
    WHERE o."createdAt" >= ${startDate} AND o."createdAt" <= ${endDate}
      AND o.status IN ('COMPLETED', 'DELIVERED', 'SHIPPED')
    GROUP BY p.id, p.name, p.price
    ORDER BY sold DESC
    LIMIT 5
  `;

  return (topSoldProducts as any[]).map((product) => ({
    name: product.name,
    price: parseFloat(product.price),
    sold: parseInt(product.sold),
    revenue: parseFloat(product.revenue),
  }));
}

/**
 * Fetch sales by category
 */
async function fetchSalesByCategory(startDate: Date, endDate: Date) {
  // Get sales by category
  const categorySales = await db.$queryRaw`
    SELECT 
      c.id AS "categoryId", 
      c.name AS category, 
      SUM(oi.price * oi.quantity) AS amount
    FROM "OrderItem" oi
    JOIN "Product" p ON oi."productId" = p.id
    JOIN "Category" c ON p."categoryId" = c.id
    JOIN "Order" o ON oi."orderId" = o.id
    WHERE o."createdAt" >= ${startDate} AND o."createdAt" <= ${endDate}
      AND o.status IN ('COMPLETED', 'DELIVERED', 'SHIPPED')
    GROUP BY c.id, c.name
    ORDER BY amount DESC
  `;

  // Calculate total sales to get percentages
  const totalSales = (categorySales as any[]).reduce(
    (sum, item) => sum + parseFloat(item.amount),
    0
  );

  return (categorySales as any[]).map((item) => ({
    categoryId: item.categoryId,
    category: item.category,
    amount: parseFloat(item.amount),
    percentage: parseFloat(
      ((parseFloat(item.amount) / totalSales) * 100).toFixed(1)
    ),
  }));
}

/**
 * Fetch sales chart data by day
 */
async function fetchSalesChartData(startDate: Date, endDate: Date) {
  // Create an array with all days in the period
  const days = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    days.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Get daily sales data using SQL for better performance
  const dailySales = await db.$queryRaw`
    SELECT 
      DATE(o."createdAt") AS date,
      SUM(o.total) AS sales
    FROM "Order" o
    WHERE o."createdAt" >= ${startDate} AND o."createdAt" <= ${endDate}
      AND o.status IN ('COMPLETED', 'DELIVERED', 'SHIPPED', 'PROCESSING')
    GROUP BY DATE(o."createdAt")
    ORDER BY date
  `;

  // Create a map for quick lookups
  const salesByDateMap = new Map();
  (dailySales as any[]).forEach((day) => {
    const dateStr = new Date(day.date).toISOString().split("T")[0];
    salesByDateMap.set(dateStr, parseFloat(day.sales));
  });

  // Fill in all days, even those with no sales
  const salesData = days.map((day) => {
    const dateStr = day.toISOString().split("T")[0];
    return {
      date: dateStr,
      sales: salesByDateMap.get(dateStr) || 0,
    };
  });

  return { salesData };
}

export default async function AnalyticsPage() {
  // Check authentication
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  // Default period is 30 days
  const period = 30;

  // Calculate date range
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - period);

  try {
    // Fetch all data in parallel using direct database queries
    const [
      salesData,
      orderStats,
      topSellingProducts,
      salesByCategory,
      salesChartData,
    ] = await Promise.all([
      fetchSalesData(startDate, endDate),
      fetchOrderStats(startDate, endDate),
      fetchTopSellingProducts(startDate, endDate),
      fetchSalesByCategory(startDate, endDate),
      fetchSalesChartData(startDate, endDate),
    ]);

    // Create analytics data object
    const analyticsData = {
      salesData,
      orderStats,
      topSellingProducts,
      salesByCategory,
    };

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
                  <p className="text-sm text-muted-foreground">
                    Per transaction
                  </p>
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
                  <p className="text-sm text-muted-foreground">
                    Active accounts
                  </p>
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
              {/* Category bars */}
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
  } catch (error) {
    console.error("Error fetching analytics data:", error);

    // Fallback to graceful error handling
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        </div>

        <Card>
          <CardContent className="p-12 flex flex-col items-center justify-center">
            <h2 className="text-xl font-semibold text-center mb-4">
              Unable to load analytics data
            </h2>
            <p className="text-muted-foreground text-center max-w-md">
              There was an error loading the analytics data. Please try again
              later or contact support if the issue persists.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
}
