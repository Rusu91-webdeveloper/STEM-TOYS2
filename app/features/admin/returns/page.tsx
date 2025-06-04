"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  MoreHorizontal,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { formatDistance, format } from "date-fns";
import Image from "next/image";

// Define types
type ReturnReason =
  | "DOES_NOT_MEET_EXPECTATIONS"
  | "DAMAGED_OR_DEFECTIVE"
  | "WRONG_ITEM_SHIPPED"
  | "CHANGED_MIND"
  | "ORDERED_WRONG_PRODUCT"
  | "OTHER";

type ReturnStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "RECEIVED"
  | "REFUNDED";

interface ReturnItem {
  id: string;
  reason: ReturnReason;
  details: string | null;
  status: ReturnStatus;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  order: {
    id: string;
    orderNumber: string;
    createdAt: string;
  };
  orderItem: {
    id: string;
    name: string;
    price: number;
    quantity: number;
    product: {
      id: string;
      name: string;
      slug: string;
      sku: string;
      images: string[];
    };
  };
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Define status badges
const statusBadges: Record<ReturnStatus, { label: string; color: string }> = {
  PENDING: { label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  APPROVED: { label: "Approved", color: "bg-blue-100 text-blue-800" },
  REJECTED: { label: "Rejected", color: "bg-red-100 text-red-800" },
  RECEIVED: { label: "Received", color: "bg-purple-100 text-purple-800" },
  REFUNDED: { label: "Refunded", color: "bg-green-100 text-green-800" },
};

// Define reason display labels
const reasonLabels: Record<ReturnReason, string> = {
  DOES_NOT_MEET_EXPECTATIONS: "Does not meet expectations",
  DAMAGED_OR_DEFECTIVE: "Damaged or defective",
  WRONG_ITEM_SHIPPED: "Wrong item shipped",
  CHANGED_MIND: "Changed mind",
  ORDERED_WRONG_PRODUCT: "Ordered wrong product",
  OTHER: "Other reason",
};

export default function AdminReturnsPage() {
  const [returns, setReturns] = useState<ReturnItem[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<ReturnStatus | undefined>(
    undefined
  );
  const { toast } = useToast();

  const fetchReturns = async (page = 1, status?: ReturnStatus) => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
      });

      if (status) {
        params.append("status", status);
      }

      const response = await fetch(`/api/returns/admin?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setReturns(data.returns);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching returns:", error);
      toast({
        title: "Error",
        description: "Failed to load returns. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns(pagination.page, filterStatus);
  }, [pagination.page, filterStatus, pagination.limit]);

  const handleUpdateStatus = async (
    returnId: string,
    newStatus: ReturnStatus
  ) => {
    try {
      const response = await fetch(`/api/returns/${returnId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      toast({
        title: "Status Updated",
        description: `Return status changed to ${statusBadges[newStatus].label}`,
      });

      // Refresh the data
      fetchReturns(pagination.page, filterStatus);
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update return status.",
        variant: "destructive",
      });
    }
  };

  const filteredReturns = searchTerm
    ? returns.filter(
        (ret) =>
          ret.orderItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ret.order.orderNumber
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          ret.user.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : returns;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Returns Management</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search returns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-[250px]"
            />
            {searchTerm && (
              <X
                className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground cursor-pointer"
                onClick={() => setSearchTerm("")}
              />
            )}
          </div>
          <Select
            value={filterStatus || ""}
            onValueChange={(value) =>
              setFilterStatus((value as ReturnStatus) || undefined)
            }>
            <SelectTrigger className="w-[160px]">
              <div className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                {filterStatus
                  ? statusBadges[filterStatus].label
                  : "All Statuses"}
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              {Object.entries(statusBadges).map(([status, { label }]) => (
                <SelectItem
                  key={status}
                  value={status}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Return Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : filteredReturns.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              No returns found.
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Return ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Order Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReturns.map((returnItem) => (
                      <TableRow key={returnItem.id}>
                        <TableCell className="font-medium">
                          {returnItem.id.slice(-6)}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {returnItem.user.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {returnItem.user.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            {returnItem.orderItem.product.images?.[0] && (
                              <div className="relative h-10 w-10 rounded overflow-hidden">
                                <Image
                                  src={returnItem.orderItem.product.images[0]}
                                  alt={returnItem.orderItem.name}
                                  className="object-cover"
                                  fill
                                />
                              </div>
                            )}
                            <div>
                              <div className="font-medium">
                                {returnItem.orderItem.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                Order #{returnItem.order.orderNumber}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div>{reasonLabels[returnItem.reason]}</div>
                            {returnItem.details && (
                              <div className="text-xs text-gray-500 mt-1 italic">
                                {returnItem.details}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {format(
                            new Date(returnItem.order.createdAt),
                            "MMM dd, yyyy"
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={statusBadges[returnItem.status].color}>
                            {statusBadges[returnItem.status].label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleUpdateStatus(returnItem.id, "APPROVED")
                                }
                                disabled={returnItem.status === "APPROVED"}>
                                Approve Return
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleUpdateStatus(returnItem.id, "REJECTED")
                                }
                                disabled={returnItem.status === "REJECTED"}>
                                Reject Return
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleUpdateStatus(returnItem.id, "RECEIVED")
                                }
                                disabled={
                                  returnItem.status === "RECEIVED" ||
                                  returnItem.status === "REFUNDED"
                                }>
                                Mark as Received
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleUpdateStatus(returnItem.id, "REFUNDED")
                                }
                                disabled={returnItem.status === "REFUNDED"}>
                                Mark as Refunded
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-gray-500">
                  Showing {filteredReturns.length} of {pagination.total} returns
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPagination({
                        ...pagination,
                        page: pagination.page - 1,
                      })
                    }
                    disabled={pagination.page <= 1}>
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <div className="text-sm">
                    Page {pagination.page} of {pagination.totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPagination({
                        ...pagination,
                        page: pagination.page + 1,
                      })
                    }
                    disabled={pagination.page >= pagination.totalPages}>
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
