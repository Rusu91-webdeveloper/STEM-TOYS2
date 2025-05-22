import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  encryptData,
  hashData,
  getCardType,
  maskCardNumber,
  validateCardNumber,
  validateCardExpiry,
} from "@/lib/encryption";
import { z } from "zod";

// Schema for card validation
const paymentCardSchema = z.object({
  cardholderName: z.string().min(1, "Cardholder name is required"),
  cardNumber: z
    .string()
    .min(13, "Card number is invalid")
    .max(19, "Card number is invalid")
    .refine(validateCardNumber, "Invalid card number"),
  expiryMonth: z.string().regex(/^(0[1-9]|1[0-2])$/, "Invalid expiry month"),
  expiryYear: z.string().regex(/^\d{2}$/, "Invalid expiry year"),
  cvv: z.string().regex(/^\d{3,4}$/, "Invalid CVV code"),
  isDefault: z.boolean().default(false),
  billingAddressId: z.string().optional(),
});

// GET - Get all payment cards for the current user
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const cards = await db.paymentCard.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        isDefault: "desc", // Default cards first
      },
      select: {
        id: true,
        lastFourDigits: true,
        expiryMonth: true,
        expiryYear: true,
        cardholderName: true,
        cardType: true,
        isDefault: true,
        createdAt: true,
        updatedAt: true,
        billingAddressId: true,
        // Important: Do not select encryptedCardData or encryptedCvv in API responses
      },
    });

    return NextResponse.json(cards);
  } catch (error) {
    console.error("Error fetching payment cards:", error);
    return NextResponse.json(
      { error: "Failed to fetch payment cards" },
      { status: 500 }
    );
  }
}

// POST - Add a new payment card
export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await req.json();

    // Validate request body
    const result = paymentCardSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const {
      cardholderName,
      cardNumber,
      expiryMonth,
      expiryYear,
      cvv,
      isDefault,
      billingAddressId,
    } = result.data;

    // Validate the expiry date is in the future
    if (!validateCardExpiry(expiryMonth, expiryYear)) {
      return NextResponse.json({ error: "Card has expired" }, { status: 400 });
    }

    // Process card data
    const lastFourDigits = cardNumber.slice(-4);
    const cardType = getCardType(cardNumber);

    // Encrypt sensitive data
    const encryptedCardData = encryptData(cardNumber);
    const encryptedCvv = encryptData(cvv);

    // If this is the default card, unset any existing default cards
    if (isDefault) {
      await db.paymentCard.updateMany({
        where: {
          userId: session.user.id,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    // Create the new payment card
    const newCard = await db.paymentCard.create({
      data: {
        userId: session.user.id,
        cardholderName,
        lastFourDigits,
        encryptedCardData,
        encryptedCvv,
        expiryMonth,
        expiryYear,
        cardType,
        isDefault,
        billingAddressId,
      },
      select: {
        id: true,
        lastFourDigits: true,
        expiryMonth: true,
        expiryYear: true,
        cardholderName: true,
        cardType: true,
        isDefault: true,
        billingAddressId: true,
        createdAt: true,
        // Do not include encrypted fields
      },
    });

    return NextResponse.json(newCard, { status: 201 });
  } catch (error) {
    console.error("Error creating payment card:", error);
    return NextResponse.json(
      { error: "Failed to create payment card" },
      { status: 500 }
    );
  }
}
