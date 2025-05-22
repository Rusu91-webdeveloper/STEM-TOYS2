"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";
import { Trash, Heart, ShoppingCart, Share2, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

// Define wishlist item interface
interface WishlistItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  slug: string;
  inStock: boolean;
  dateAdded: string;
}

// Sample wishlist items
const SAMPLE_WISHLIST: WishlistItem[] = [
  {
    id: "w1",
    productId: "p1",
    name: "Science Microscope Kit for Kids",
    price: 79.99,
    image: "/images/product-placeholder.jpg",
    slug: "science-microscope-kit-for-kids",
    inStock: true,
    dateAdded: "2023-11-15T12:30:00Z",
  },
  {
    id: "w2",
    productId: "p2",
    name: "Robotics Building Set with Remote Control",
    price: 129.99,
    image: "/images/product-placeholder.jpg",
    slug: "robotics-building-set-with-remote-control",
    inStock: true,
    dateAdded: "2023-11-10T09:15:00Z",
  },
  {
    id: "w3",
    productId: "p3",
    name: "Interactive Solar System Model",
    price: 54.99,
    image: "/images/product-placeholder.jpg",
    slug: "interactive-solar-system-model",
    inStock: false,
    dateAdded: "2023-10-25T15:45:00Z",
  },
];

export function Wishlist() {
  const [isLoading, setIsLoading] = useState(true);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);

  useEffect(() => {
    // Simulate fetching wishlist items from API
    const fetchWishlist = async () => {
      try {
        // In a real app, this would be an API call
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setWishlistItems(SAMPLE_WISHLIST);
      } catch (error) {
        console.error("Error fetching wishlist:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWishlist();
  }, []);

  const handleRemoveFromWishlist = async (id: string) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Update local state
      setWishlistItems(wishlistItems.filter((item) => item.id !== id));

      toast({
        title: "Item removed from wishlist",
        description: "The item has been removed from your wishlist.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove item from wishlist.",
        variant: "destructive",
      });
    }
  };

  const handleAddToCart = async (item: WishlistItem) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      toast({
        title: "Added to cart",
        description: `${item.name} has been added to your cart.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart.",
        variant: "destructive",
      });
    }
  };

  const handleShare = (item: WishlistItem) => {
    // In a real app, this would open a share dialog or copy link to clipboard
    const shareUrl = `${window.location.origin}/products/${item.slug}`;

    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(shareUrl)
        .then(() => {
          toast({
            title: "Link copied",
            description: "Product link has been copied to clipboard.",
          });
        })
        .catch(() => {
          toast({
            title: "Error",
            description: "Failed to copy link.",
            variant: "destructive",
          });
        });
    } else {
      // Fallback for browsers that don't support clipboard API
      toast({
        title: "Sharing not supported",
        description: "Your browser doesn't support sharing.",
        variant: "destructive",
      });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <div className="relative pt-[100%]">
              <Skeleton className="absolute inset-0 rounded-t-lg" />
            </div>
            <CardContent className="p-4">
              <div className="space-y-2">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-6 w-1/3" />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between p-4 pt-0">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-24" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  // Empty state
  if (wishlistItems.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <Heart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium mb-2">Your wishlist is empty</h3>
        <p className="text-gray-500 mb-6">
          You haven't added any products to your wishlist yet.
        </p>
        <Button asChild>
          <Link href="/products">Start Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {wishlistItems.map((item) => (
        <Card
          key={item.id}
          className="overflow-hidden group">
          <div className="relative pt-[100%] bg-gray-100">
            <Link href={`/products/${item.slug}`}>
              <img
                src={item.image}
                alt={item.name}
                className="absolute inset-0 w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
              />
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 h-8 w-8 bg-white/70 hover:bg-white/90 text-red-500"
              onClick={() => handleRemoveFromWishlist(item.id)}
              title="Remove from wishlist">
              <Trash className="h-4 w-4" />
            </Button>
          </div>
          <CardContent className="p-4">
            <Link
              href={`/products/${item.slug}`}
              className="text-sm font-medium line-clamp-2 hover:underline mb-2">
              {item.name}
            </Link>
            <p className="text-lg font-bold">{formatCurrency(item.price)}</p>
            {!item.inStock && (
              <div className="flex items-center gap-1 text-amber-600 text-sm mt-2">
                <AlertCircle className="h-4 w-4" />
                Out of stock
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between p-4 pt-0">
            <Button
              variant="outline"
              size="sm"
              className="text-gray-600"
              onClick={() => handleShare(item)}>
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </Button>
            <Button
              size="sm"
              onClick={() => handleAddToCart(item)}
              disabled={!item.inStock}>
              <ShoppingCart className="h-4 w-4 mr-1" />
              {item.inStock ? "Add to Cart" : "Unavailable"}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
