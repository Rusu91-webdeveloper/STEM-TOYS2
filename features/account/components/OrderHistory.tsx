"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Eye, ArrowRight, ShoppingBag } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

// Define order status type
type OrderStatus = "processing" | "shipped" | "delivered" | "cancelled";

// Define order item type
interface OrderItem {
  id: string;
  productName: string;
  price: number;
  quantity: number;
  image: string;
}

// Define order type
interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: OrderStatus;
  total: number;
  items: OrderItem[];
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

// Sample orders data
const SAMPLE_ORDERS: Order[] = [
  {
    id: "1",
    orderNumber: "ORD-2023-9876",
    date: "2023-11-15T12:30:00Z",
    status: "delivered",
    total: 129.99,
    items: [
      {
        id: "item1",
        productName: "STEM Learning Robot Kit",
        price: 79.99,
        quantity: 1,
        image: "/images/product-placeholder.jpg",
      },
      {
        id: "item2",
        productName: "Beginner Coding Blocks",
        price: 49.99,
        quantity: 1,
        image: "/images/product-placeholder.jpg",
      },
    ],
    shippingAddress: {
      name: "John Doe",
      street: "123 Main St",
      city: "Anytown",
      state: "CA",
      zipCode: "90210",
      country: "USA",
    },
  },
  {
    id: "2",
    orderNumber: "ORD-2023-8765",
    date: "2023-10-25T09:15:00Z",
    status: "shipped",
    total: 59.98,
    items: [
      {
        id: "item3",
        productName: "Science Experiment Kit",
        price: 29.99,
        quantity: 2,
        image: "/images/product-placeholder.jpg",
      },
    ],
    shippingAddress: {
      name: "John Doe",
      street: "123 Main St",
      city: "Anytown",
      state: "CA",
      zipCode: "90210",
      country: "USA",
    },
  },
  {
    id: "3",
    orderNumber: "ORD-2023-7654",
    date: "2023-09-05T14:45:00Z",
    status: "processing",
    total: 149.99,
    items: [
      {
        id: "item4",
        productName: "Microscope for Kids",
        price: 149.99,
        quantity: 1,
        image: "/images/product-placeholder.jpg",
      },
    ],
    shippingAddress: {
      name: "John Doe",
      street: "123 Main St",
      city: "Anytown",
      state: "CA",
      zipCode: "90210",
      country: "USA",
    },
  },
];

// Function to get the status badge variant
const getStatusBadgeVariant = (status: OrderStatus) => {
  switch (status) {
    case "processing":
      return "bg-blue-100 text-blue-800 hover:bg-blue-100";
    case "shipped":
      return "bg-amber-100 text-amber-800 hover:bg-amber-100";
    case "delivered":
      return "bg-green-100 text-green-800 hover:bg-green-100";
    case "cancelled":
      return "bg-red-100 text-red-800 hover:bg-red-100";
    default:
      return "";
  }
};

export function OrderHistory() {
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    // Simulate fetching orders from API
    const fetchOrders = async () => {
      try {
        // In a real app, this would be an API call
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setOrders(SAMPLE_ORDERS);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Filter orders based on active tab
  const filteredOrders =
    activeTab === "all"
      ? orders
      : orders.filter((order) => order.status === activeTab);

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card
            key={i}
            className="w-full">
            <CardHeader className="pb-2">
              <div className="flex justify-between">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-24" />
              </div>
              <Skeleton className="h-4 w-48 mt-2" />
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Skeleton className="h-9 w-28" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  // Empty state
  if (orders.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <ShoppingBag className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium mb-2">No orders found</h3>
        <p className="text-gray-500 mb-6">You haven't placed any orders yet.</p>
        <Button asChild>
          <Link href="/products">Start Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs
        defaultValue="all"
        onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 md:w-auto">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
          <TabsTrigger value="shipped">Shipped</TabsTrigger>
          <TabsTrigger value="delivered">Delivered</TabsTrigger>
        </TabsList>
        <TabsContent
          value={activeTab}
          className="space-y-4 mt-4">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-8 border rounded-lg">
              <p className="text-gray-500">No orders with this status.</p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <Card
                key={order.id}
                className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                    <div>
                      <CardTitle className="text-base">
                        Order #{order.orderNumber}
                      </CardTitle>
                      <CardDescription>
                        {formatDate(new Date(order.date))}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusBadgeVariant(order.status)}>
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start gap-3">
                        <div className="h-16 w-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.productName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {item.productName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {item.quantity} × {formatCurrency(item.price)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-3 border-t">
                    <div className="flex justify-between">
                      <span className="font-medium">Total</span>
                      <span className="font-medium">
                        {formatCurrency(order.total)}
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild>
                    <Link href={`/account/orders/${order.id}`}>
                      <Eye className="h-4 w-4 mr-1" /> View Details
                    </Link>
                  </Button>
                  {order.status === "delivered" && (
                    <Button
                      size="sm"
                      variant="outline">
                      Buy Again <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  )}
                  {order.status === "processing" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-500">
                      Cancel Order
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
