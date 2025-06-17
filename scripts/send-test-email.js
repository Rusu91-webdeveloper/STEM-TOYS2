const path = require("path");
require("dotenv").config({ path: path.resolve(process.cwd(), ".env.local") });
const SibApiV3Sdk = require("sib-api-v3-sdk");

async function sendTestEmail() {
  try {
    console.log("===== SENDING TEST EMAIL =====");

    const testEmail = process.argv[2] || "test@example.com";
    console.log(`Sending test email to: ${testEmail}`);

    // Log environment variables (without showing full values)
    console.log("\nEnvironment variables:");
    console.log(
      `- BREVO_API_KEY: ${process.env.BREVO_API_KEY ? "✓ Set" : "✗ Not set"}`
    );
    console.log(`- EMAIL_FROM: ${process.env.EMAIL_FROM || "Not set"}`);

    // Configure API key authorization
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKey = defaultClient.authentications["api-key"];
    apiKey.apiKey = process.env.BREVO_API_KEY;

    // Create API instance
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

    // Create email
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.subject = "Test Email from TechTots STEM Store";
    sendSmtpEmail.htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #4f46e5;">Test Email</h1>
        <p>This is a test email from your TechTots STEM Store application.</p>
        <p>If you're receiving this email, it means your email configuration is working correctly.</p>
        <p>The email was sent at: ${new Date().toLocaleString()}</p>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">
            This is an automated test email. Please do not reply.
          </p>
        </div>
      </div>
    `;
    sendSmtpEmail.sender = {
      name: "TechTots STEM Store",
      email: process.env.EMAIL_FROM || "noreply@techtots.com",
    };
    sendSmtpEmail.to = [{ email: testEmail }];

    // Send email
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);

    console.log("\nEmail sent successfully!");
    console.log(`Message ID: ${data.messageId}`);
    console.log("\nCheck your email inbox for the test message.");
    console.log("If you don't see it, check your spam folder.");
  } catch (error) {
    console.error("\nError sending test email:", error);
    console.log("\nTroubleshooting tips:");
    console.log("1. Make sure your Brevo API key is correct");
    console.log("2. Check if your Brevo account is active");
    console.log("3. Verify the recipient email address is valid");
    console.log("4. Check if you have reached your sending limit");
  }
}

sendTestEmail();
