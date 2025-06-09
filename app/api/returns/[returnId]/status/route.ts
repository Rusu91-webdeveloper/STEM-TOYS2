import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { sendMail } from "@/lib/brevo";
import { generateReturnLabel } from "@/lib/return-label";
import { ro as roTranslations } from "@/lib/i18n/translations/ro";

// Return reason display labels
const reasonLabels = {
  DOES_NOT_MEET_EXPECTATIONS: "Does not meet expectations",
  DAMAGED_OR_DEFECTIVE: "Damaged or defective",
  WRONG_ITEM_SHIPPED: "Wrong item shipped",
  CHANGED_MIND: "Changed my mind",
  ORDERED_WRONG_PRODUCT: "Ordered wrong product",
  OTHER: "Other reason",
};

export async function PATCH(
  request: Request,
  { params }: { params: { returnId: string } }
) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized. Admin access required." },
        { status: 403 }
      );
    }

    const { returnId } = params;
    const { status } = await request.json();

    // Validate status
    const validStatuses = [
      "PENDING",
      "APPROVED",
      "REJECTED",
      "RECEIVED",
      "REFUNDED",
    ];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }

    // Update return status
    const updatedReturn = await prisma.return.update({
      where: { id: returnId },
      data: { status },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        order: {
          select: {
            id: true,
            orderNumber: true,
          },
        },
        orderItem: {
          select: {
            id: true,
            name: true,
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
              },
            },
          },
        },
      },
    });

    // If status is changed to APPROVED, send email with return label
    if (status === "APPROVED") {
      try {
        // Generate return label PDF
        const pdfBuffer = await generateReturnLabel({
          orderId: updatedReturn.order.id,
          orderNumber: updatedReturn.order.orderNumber,
          returnId: updatedReturn.id,
          productName: updatedReturn.orderItem.name,
          productId: updatedReturn.orderItem.product.id,
          productSku: updatedReturn.orderItem.product.sku,
          reason: reasonLabels[updatedReturn.reason] || updatedReturn.reason,
          customerName: updatedReturn.user.name || updatedReturn.user.email,
          customerEmail: updatedReturn.user.email,
        });

        // Create email content
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #4f46e5;">${roTranslations.email_return_approved_subject.replace("#{orderNumber}", updatedReturn.order.orderNumber)}</h1>
            <p>${roTranslations.email_return_approved_greeting.replace("{name}", updatedReturn.user.name || updatedReturn.user.email)}</p>
            <p>${roTranslations.email_return_approved_body.replace("{productName}", updatedReturn.orderItem.name)}</p>
            <pre style="background: #f9f9f9; padding: 12px; border-radius: 6px;">${roTranslations.email_return_approved_steps}</pre>
            <p style="margin-top: 16px; color: #b91c1c;"><b>${roTranslations.email_return_approved_legal}</b></p>
            <p>${roTranslations.email_return_approved_tracking}</p>
            <p>${roTranslations.email_return_approved_footer.replace("{contactEmail}", "support@techtots.com")}</p>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eaeaea; font-size: 12px; color: #666;">
              <p>© ${new Date().getFullYear()} TechTots STEM Store. Toate drepturile rezervate.</p>
              <p>Mehedinti 54-56, Bl D5, sc 2, apt 70, Cluj-Napoca, Cluj, Romania</p>
            </div>
          </div>
        `;

        // Convert PDF to Base64 for email attachment
        const pdfBase64 = pdfBuffer.toString("base64");

        // Use nodemailer for sending with attachment
        await sendMail({
          to: updatedReturn.user.email,
          subject: `Return Approved - Order #${updatedReturn.order.orderNumber}`,
          html: emailHtml,
          attachments: [
            {
              filename: `TechTots_Return_Label_${updatedReturn.order.orderNumber}.pdf`,
              content: pdfBase64,
              encoding: "base64",
              contentType: "application/pdf",
            },
          ],
        });

        console.log(`Return label email sent to ${updatedReturn.user.email}`);
      } catch (emailError) {
        console.error("Error sending return label email:", emailError);
        // We don't want to fail the status update if email fails
        // But we log the error for troubleshooting
      }
    }

    return NextResponse.json({
      success: true,
      message: `Return status updated to ${status}`,
      data: updatedReturn,
    });
  } catch (error: unknown) {
    console.error("Error updating return status:", error);

    // Check for Prisma errors
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ error: "Return not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to update return status" },
      { status: 500 }
    );
  }
}
