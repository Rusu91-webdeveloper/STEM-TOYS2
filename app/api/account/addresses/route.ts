import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { addressSchema } from "@/lib/validations";
import { z } from "zod";

// Extended schema for creating an address
const createAddressSchema = addressSchema.extend({
  name: z.string().min(1, "Address nickname is required"),
  isDefault: z.boolean().default(false),
});

// GET - Get all addresses for the current user
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const addresses = await db.address.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        isDefault: "desc", // Default addresses first
      },
    });

    return NextResponse.json(addresses);
  } catch (error) {
    console.error("Error fetching addresses:", error);
    return NextResponse.json(
      { error: "Failed to fetch addresses" },
      { status: 500 }
    );
  }
}

// POST - Create a new address
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
    const result = createAddressSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.errors[0].message },
        { status: 400 }
      );
    }

    const { isDefault, ...addressData } = result.data;

    // Use transaction to ensure operations are atomic
    const newAddress = await db.$transaction(async (tx) => {
      // If this is the default address, unset any existing default addresses
      if (isDefault) {
        await tx.address.updateMany({
          where: {
            userId: session.user.id,
            isDefault: true,
          },
          data: {
            isDefault: false,
          },
        });
      }

      // Create the new address
      return tx.address.create({
        data: {
          ...addressData,
          isDefault,
          userId: session.user.id,
        },
      });
    });

    return NextResponse.json(newAddress, { status: 201 });
  } catch (error) {
    console.error("Error creating address:", error);
    return NextResponse.json(
      { error: "Failed to create address" },
      { status: 500 }
    );
  }
}
