import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/coupons/popup - Get active promotional coupons for popup display
export async function GET(request: NextRequest) {
  try {
    const searchParams = new URL(request.url).searchParams;
    const excludeViewed = searchParams.get("excludeViewed");

    const now = new Date();

    // Find active coupons that should be shown as popup
    const promotionalCoupons = await db.coupon.findMany({
      where: {
        isActive: true,
        showAsPopup: true,
        AND: [
          {
            OR: [{ startsAt: null }, { startsAt: { lte: now } }],
          },
          {
            OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
          },
        ],
      },
      orderBy: [{ popupPriority: "desc" }, { createdAt: "desc" }],
      take: 1, // Only return the highest priority coupon
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        type: true,
        value: true,
        image: true,
        minimumOrderValue: true,
        maxDiscountAmount: true,
        expiresAt: true,
        isInfluencer: true,
        influencerName: true,
        popupPriority: true,
      },
    });

    if (promotionalCoupons.length === 0) {
      return NextResponse.json({ coupon: null });
    }

    const coupon = promotionalCoupons[0];

    // Format the response
    const formattedCoupon = {
      id: coupon.id,
      code: coupon.code,
      name: coupon.name,
      description: coupon.description,
      type: coupon.type,
      value: coupon.value,
      image: coupon.image,
      minimumOrderValue: coupon.minimumOrderValue,
      maxDiscountAmount: coupon.maxDiscountAmount,
      expiresAt: coupon.expiresAt,
      isInfluencer: coupon.isInfluencer,
      influencerName: coupon.influencerName,
      discountText:
        coupon.type === "PERCENTAGE"
          ? `${coupon.value}% OFF`
          : `${coupon.value} LEI OFF`,
      expiryText: coupon.expiresAt
        ? `Expires: ${coupon.expiresAt.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}`
        : null,
      minOrderText: coupon.minimumOrderValue
        ? `Minimum order: ${coupon.minimumOrderValue} LEI`
        : null,
    };

    return NextResponse.json({ coupon: formattedCoupon });
  } catch (error) {
    console.error("Error fetching promotional coupon:", error);
    return NextResponse.json(
      { error: "Failed to fetch promotional coupon" },
      { status: 500 }
    );
  }
}
