"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, ArrowLeft, ShoppingBag, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Image from "next/image";
import Link from "next/link";
import { formatDistance } from "date-fns";

// Define return types
interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  product: {
    id: string;
    name: string;
    slug: string;
    images: string[];
  };
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

// Create the return form schema
const returnSchema = z.object({
  orderItemId: z.string().min(1, "Please select an item to return"),
  reason: z.enum(
    [
      "DOES_NOT_MEET_EXPECTATIONS",
      "DAMAGED_OR_DEFECTIVE",
      "WRONG_ITEM_SHIPPED",
      "CHANGED_MIND",
      "ORDERED_WRONG_PRODUCT",
      "OTHER",
    ],
    {
      required_error: "Please select a reason for your return",
    }
  ),
  details: z.string().optional(),
});

type ReturnFormValues = z.infer<typeof returnSchema>;

// Define reason display labels
const reasonLabels = {
  DOES_NOT_MEET_EXPECTATIONS: "Does not meet expectations",
  DAMAGED_OR_DEFECTIVE: "Damaged or defective",
  WRONG_ITEM_SHIPPED: "Wrong item shipped",
  CHANGED_MIND: "Changed my mind",
  ORDERED_WRONG_PRODUCT: "Ordered wrong product",
  OTHER: "Other reason",
};

export default function InitiateReturn({ params }: { params: { id: string } }) {
  const orderId = params.id;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  // Set up form with validation
  const form = useForm<ReturnFormValues>({
    resolver: zodResolver(returnSchema),
    defaultValues: {
      orderItemId: "",
      reason: undefined,
      details: "",
    },
  });

  // Calculate if order is within 30-day return window
  const isWithin30Days = (date: string) => {
    const orderDate = new Date(date);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - orderDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30;
  };

  // Fetch order details
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        // You'll need to create this API endpoint
        const response = await fetch(`/api/orders/${orderId}`);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setOrder(data.order);

        // Check if order is within return window
        if (data.order && !isWithin30Days(data.order.createdAt)) {
          toast({
            title: "Return period expired",
            description:
              "Items can only be returned within 30 days of purchase.",
            variant: "destructive",
          });
          router.push(`/account/orders/${orderId}`);
        }
      } catch (error) {
        console.error("Error fetching order:", error);
        toast({
          title: "Error",
          description: "Failed to load order details. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, router, toast]);

  // Handle form submission
  const onSubmit = async (values: ReturnFormValues) => {
    try {
      setSubmitting(true);

      const response = await fetch("/api/returns/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to initiate return");
      }

      setSubmitted(true);
      toast({
        title: "Return initiated",
        description: "Your return request has been submitted successfully.",
      });

      // Redirect after a short delay
      setTimeout(() => {
        router.push("/account/returns");
      }, 2000);
    } catch (error) {
      console.error("Error submitting return:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to submit return request.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mt-6">
        <div className="bg-white p-8 rounded-xl shadow-sm text-center">
          <h3 className="text-lg font-medium mb-2">Order not found</h3>
          <p className="text-gray-500 mb-4">
            We couldn't find the order you're looking for.
          </p>
          <Link
            href="/account/orders"
            className="text-primary hover:underline">
            View all orders
          </Link>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="mt-6">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="pt-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Return Initiated</h2>
            <p className="text-gray-500 mb-4">
              Your return request has been submitted successfully. You'll
              receive an email with further instructions.
            </p>
            <div className="mt-6">
              <Link href="/account/returns">
                <Button>View Your Returns</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link href={`/account/orders/${orderId}`}>
            <Button
              variant="ghost"
              size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Return Items</h1>
        </div>

        <div className="text-sm text-gray-500 flex items-center space-x-1">
          <ShoppingBag className="h-4 w-4" />
          <span>Order #{order.orderNumber}</span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Items to Return</CardTitle>
        </CardHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-3">Order Items</h3>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="orderItemId"
                    render={({ field }) => (
                      <FormItem>
                        <div className="space-y-3">
                          {order.items.map((item) => (
                            <div
                              key={item.id}
                              className={`flex p-4 border rounded-lg ${field.value === item.id ? "border-primary bg-primary/5" : "border-gray-200"}`}>
                              <FormControl>
                                <input
                                  type="radio"
                                  className="hidden"
                                  checked={field.value === item.id}
                                  onChange={() => field.onChange(item.id)}
                                />
                              </FormControl>

                              <div
                                className="flex flex-1 items-center space-x-4 cursor-pointer"
                                onClick={() => field.onChange(item.id)}>
                                {item.product.images?.[0] && (
                                  <div className="relative h-16 w-16 rounded overflow-hidden">
                                    <Image
                                      src={item.product.images[0]}
                                      alt={item.name}
                                      className="object-cover"
                                      fill
                                    />
                                  </div>
                                )}

                                <div className="flex-1">
                                  <h4 className="font-medium">{item.name}</h4>
                                  <div className="text-sm text-gray-500 mt-1">
                                    Quantity: {item.quantity} · $
                                    {item.price.toFixed(2)}
                                  </div>
                                </div>

                                <div
                                  className={`w-5 h-5 rounded-full border flex items-center justify-center ${field.value === item.id ? "border-primary bg-primary" : "border-gray-300"}`}>
                                  {field.value === item.id && (
                                    <Check className="h-3 w-3 text-white" />
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason for return</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a reason" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(reasonLabels).map(([key, label]) => (
                          <SelectItem
                            key={key}
                            value={key}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch("reason") === "OTHER" && (
                <FormField
                  control={form.control}
                  name="details"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Please explain the reason for your return
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us more about why you're returning this item..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>

            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                type="button"
                onClick={() => router.back()}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Submit Return Request"
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
