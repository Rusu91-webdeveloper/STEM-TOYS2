import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sendMail } from "@/lib/brevo";
import { generateReturnLabel } from "@/lib/return-label";

export async function POST(request: Request) {
  try {
    // Check if user is admin
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("🧪 Testing return email system...");

    // Log environment variables
    console.log("Environment check:");
    console.log("- NODE_ENV:", process.env.NODE_ENV);
    console.log("- BREVO_API_KEY available:", !!process.env.BREVO_API_KEY);
    console.log("- BREVO_SMTP_KEY available:", !!process.env.BREVO_SMTP_KEY);
    console.log("- EMAIL_FROM:", process.env.EMAIL_FROM);

    // Test PDF generation first
    console.log("📄 Testing PDF generation...");
    let pdfBuffer;
    try {
      pdfBuffer = await generateReturnLabel({
        orderId: "test-order-id",
        orderNumber: "TEST-12345",
        returnId: "test-return-id",
        productName: "Test Product",
        productId: "test-product-id",
        productSku: "TEST-SKU",
        reason: "Test reason",
        customerName: "Test Customer",
        customerEmail: "test@example.com",
        customerAddress: "Test Address, Test City, Test Country",
        language: "ro",
      });
      console.log(
        "✅ PDF generated successfully, size:",
        pdfBuffer.length,
        "bytes"
      );
    } catch (pdfError) {
      console.error("❌ PDF generation failed:", pdfError);
      return NextResponse.json(
        {
          error: "PDF generation failed",
          details:
            pdfError instanceof Error ? pdfError.message : "Unknown error",
        },
        { status: 500 }
      );
    }

    // Test email sending
    console.log("📧 Testing email sending...");
    try {
      const testEmail = session.user.email || "test@example.com";

      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333333;">
          <div style="background-color: #4f46e5; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">TechTots - Test Email</h1>
          </div>
          
          <div style="padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
            <h2 style="color: #4f46e5; margin-top: 0;">Test de Sistem Email Returnări</h2>
            
            <p>Acesta este un email de test pentru a verifica dacă sistemul de returnări funcționează corect.</p>
            
            <p><strong>Detalii test:</strong></p>
            <ul>
              <li>Număr comandă: TEST-12345</li>
              <li>ID returnare: test-return-id</li>
              <li>Produs: Test Product</li>
              <li>Data: ${new Date().toLocaleString("ro-RO")}</li>
            </ul>
            
            <p>Dacă primești acest email cu eticheta atașată, sistemul funcționează corect!</p>
          </div>
        </div>
      `;

      // Convert PDF to Base64 for email attachment
      const pdfBase64 = pdfBuffer.toString("base64");

      await sendMail({
        to: testEmail,
        subject: `TechTots - Test Sistem Email Returnări - ${new Date().toISOString()}`,
        html: emailHtml,
        attachments: [
          {
            filename: `TechTots_Test_Eticheta_Returnare.pdf`,
            content: pdfBase64,
            encoding: "base64",
            contentType: "application/pdf",
          },
        ],
      });

      console.log("✅ Test email sent successfully to:", testEmail);

      return NextResponse.json({
        success: true,
        message: "Return email system test completed successfully",
        details: {
          pdfGenerated: true,
          pdfSize: pdfBuffer.length,
          emailSent: true,
          recipient: testEmail,
          timestamp: new Date().toISOString(),
        },
      });
    } catch (emailError) {
      console.error("❌ Email sending failed:", emailError);
      return NextResponse.json(
        {
          error: "Email sending failed",
          details:
            emailError instanceof Error ? emailError.message : "Unknown error",
          pdfGenerated: true,
          pdfSize: pdfBuffer?.length || 0,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("❌ Test failed:", error);
    return NextResponse.json(
      {
        error: "Test failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
