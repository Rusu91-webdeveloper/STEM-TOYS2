// Use the generated Prisma client from the correct path
const { PrismaClient } = require("../app/generated/prisma");
const prisma = new PrismaClient();

// Import the necessary modules for email and PDF generation
const { generateReturnLabel } = require("../lib/return-label");
const nodemailer = require("nodemailer");

// Return reason display labels
const reasonLabels = {
  DOES_NOT_MEET_EXPECTATIONS: "Does not meet expectations",
  DAMAGED_OR_DEFECTIVE: "Damaged or defective",
  WRONG_ITEM_SHIPPED: "Wrong item shipped",
  CHANGED_MIND: "Changed my mind",
  ORDERED_WRONG_PRODUCT: "Ordered wrong product",
  OTHER: "Other reason",
};

// Determine if running in development mode
const isDevelopment = process.env.NODE_ENV === "development";

async function approveTestReturn() {
  try {
    // Find the most recent return for rusuemanuel1991@gmail.com
    const user = await prisma.user.findUnique({
      where: { email: "rusuemanuel1991@gmail.com" },
    });

    if (!user) {
      throw new Error("Test user not found");
    }

    const returnRecord = await prisma.return.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
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

    if (!returnRecord) {
      throw new Error("No return record found for this user");
    }

    console.log(
      `Found return: ${returnRecord.id} with status: ${returnRecord.status}`
    );

    // Update the return status to APPROVED
    const updatedReturn = await prisma.return.update({
      where: { id: returnRecord.id },
      data: { status: "APPROVED" },
    });

    console.log(`Return status updated to: ${updatedReturn.status}`);

    // Generate return label PDF
    const pdfBuffer = await generateReturnLabel({
      orderId: returnRecord.order.id,
      orderNumber: returnRecord.order.orderNumber,
      returnId: returnRecord.id,
      productName: returnRecord.orderItem.name,
      productId: returnRecord.orderItem.product.id,
      productSku: returnRecord.orderItem.product.sku,
      reason: reasonLabels[returnRecord.reason] || returnRecord.reason,
      customerName: returnRecord.user.name || returnRecord.user.email,
      customerEmail: returnRecord.user.email,
    });

    // Create email content
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4f46e5;">Your Return Request Has Been Approved</h1>
        <p>Dear ${returnRecord.user.name || "Valued Customer"},</p>
        <p>Good news! Your return request for <strong>${returnRecord.orderItem.name}</strong> has been approved.</p>
        <p>Please follow these steps to complete your return:</p>
        <ol>
          <li>Print the attached return label</li>
          <li>Pack the item securely in its original packaging if possible</li>
          <li>Attach the return label to the outside of the package</li>
          <li>Drop off the package at your local post office or shipping carrier</li>
        </ol>
        <p>Once we receive your return, we'll process it within 3-5 business days and issue a refund to your original payment method.</p>
        <p>You can track the status of your return in your account dashboard.</p>
        <p>If you have any questions, please contact our customer support team.</p>
        <p>Thank you for shopping with TechTots!</p>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eaeaea; font-size: 12px; color: #666;">
          <p>© ${new Date().getFullYear()} TechTots STEM Store. All rights reserved.</p>
          <p>Mehedinti 54-56, Bl D5, sc 2, apt 70, Cluj-Napoca, Cluj, Romania</p>
        </div>
      </div>
    `;

    // Convert PDF to Base64 for email attachment
    const pdfBase64 = pdfBuffer.toString("base64");

    console.log("Sending email with return label...");

    // Create Ethereal test account for demonstration purposes
    if (isDevelopment) {
      console.log("Using Ethereal test account for email demonstration");

      // Create test account
      const testAccount = await nodemailer.createTestAccount();

      // Create test transporter
      const transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      // Send test email
      const info = await transporter.sendMail({
        from: '"TechTots STEM Store" <returns@techtots.com>',
        to: returnRecord.user.email,
        subject: `Return Approved - Order #${returnRecord.order.orderNumber}`,
        html: emailHtml,
        attachments: [
          {
            filename: `TechTots_Return_Label_${returnRecord.order.orderNumber}.pdf`,
            content: pdfBase64,
            encoding: "base64",
            contentType: "application/pdf",
          },
        ],
      });

      console.log(`Return label email sent to ${returnRecord.user.email}`);
      console.log(`Message ID: ${info.messageId}`);
      console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      console.log(
        "You can view the email in a web browser at the preview URL above"
      );
    } else {
      console.log(
        `In production, an email would be sent to ${returnRecord.user.email}`
      );
      console.log("Email includes a PDF return label attachment");
    }
  } catch (error) {
    console.error("Error approving return:", error);
  } finally {
    await prisma.$disconnect();
  }
}

approveTestReturn();
