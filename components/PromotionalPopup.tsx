"use client";

import { useState, useEffect } from "react";
import { X, Copy, Clock, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface PromotionalCoupon {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: "PERCENTAGE" | "FIXED_AMOUNT";
  value: number;
  image?: string;
  minimumOrderValue?: number;
  maxDiscountAmount?: number;
  expiresAt?: string;
  isInfluencer: boolean;
  influencerName?: string;
  discountText: string;
  expiryText?: string;
  minOrderText?: string;
}

export default function PromotionalPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [coupon, setCoupon] = useState<PromotionalCoupon | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user has already seen a popup in this session
    const hasSeenPopup = sessionStorage.getItem("promotional-popup-seen");

    if (hasSeenPopup) {
      setIsLoading(false);
      return;
    }

    // Delay popup appearance to not interrupt page loading
    const timer = setTimeout(async () => {
      try {
        const response = await fetch("/api/coupons/popup");
        if (response.ok) {
          const data = await response.json();
          if (data.coupon) {
            setCoupon(data.coupon);
            setIsVisible(true);
          }
        }
      } catch (error) {
        console.error("Error fetching promotional coupon:", error);
      } finally {
        setIsLoading(false);
      }
    }, 2000); // 2-second delay

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    // Mark as seen for this session
    sessionStorage.setItem("promotional-popup-seen", "true");
  };

  const handleCopyCode = () => {
    if (coupon) {
      navigator.clipboard.writeText(coupon.code);
      toast({
        title: "Copied!",
        description: `Coupon code "${coupon.code}" copied to clipboard`,
      });
    }
  };

  if (isLoading || !coupon || !isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Popup Content */}
      <div className="relative max-w-lg w-full max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl animate-in fade-in zoom-in duration-300">
        {/* Background Image */}
        {coupon.image && (
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${coupon.image})` }}
          />
        )}

        {/* Overlay for better text readability */}
        <div
          className={`absolute inset-0 ${coupon.image ? "bg-black/40" : "bg-gradient-to-br from-purple-600 via-pink-600 to-red-500"}`}
        />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors">
          <X className="h-5 w-5 text-white" />
        </button>

        {/* Content */}
        <div className="relative z-10 p-8 text-white">
          {/* Header */}
          <div className="text-center mb-6">
            {coupon.isInfluencer && coupon.influencerName && (
              <div className="inline-block px-3 py-1 mb-3 text-xs font-medium bg-white/20 backdrop-blur-sm rounded-full">
                💫 {coupon.influencerName} Special
              </div>
            )}

            <h2 className="text-2xl md:text-3xl font-bold mb-2 leading-tight">
              {coupon.name}
            </h2>

            {coupon.description && (
              <p className="text-white/90 text-sm md:text-base mb-4">
                {coupon.description}
              </p>
            )}
          </div>

          {/* Discount Badge */}
          <div className="text-center mb-6">
            <div className="inline-block px-6 py-3 bg-white text-gray-900 rounded-2xl shadow-lg">
              <div className="text-3xl md:text-4xl font-black">
                {coupon.discountText}
              </div>
            </div>
          </div>

          {/* Coupon Code */}
          <div className="mb-6">
            <div className="text-center mb-3">
              <span className="text-white/90 text-sm font-medium">
                Use code:
              </span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="flex-1 max-w-xs">
                <div className="bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-lg p-4 text-center">
                  <div className="font-mono text-xl md:text-2xl font-bold tracking-widest">
                    {coupon.code}
                  </div>
                </div>
              </div>
              <Button
                onClick={handleCopyCode}
                size="sm"
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border-white/20"
                variant="outline">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div className="space-y-2 mb-6">
            {coupon.expiryText && (
              <div className="flex items-center justify-center gap-2 text-white/80 text-sm">
                <Clock className="h-4 w-4" />
                <span>{coupon.expiryText}</span>
              </div>
            )}

            {coupon.minOrderText && (
              <div className="flex items-center justify-center gap-2 text-white/80 text-sm">
                <ShoppingBag className="h-4 w-4" />
                <span>{coupon.minOrderText}</span>
              </div>
            )}

            {coupon.type === "PERCENTAGE" && coupon.maxDiscountAmount && (
              <div className="text-center text-white/70 text-xs">
                Max discount: {coupon.maxDiscountAmount} LEI
              </div>
            )}
          </div>

          {/* CTA Button */}
          <div className="text-center">
            <Button
              onClick={handleClose}
              size="lg"
              className="bg-white text-gray-900 hover:bg-white/90 font-semibold px-8 py-3 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200">
              Shop Now & Save
            </Button>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-white/60 text-xs">
              Limited time offer • Valid while supplies last
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
