const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function sendDigitalEmail() {
  console.log("📧 Preparing to send digital download email...\n");

  try {
    // Get the user's download links
    const downloads = await prisma.digitalDownload.findMany({
      where: {
        orderItem: {
          order: {
            user: {
              email: "rusuemanuel91@gmail.com",
            },
          },
        },
      },
      include: {
        orderItem: {
          include: {
            order: {
              select: {
                orderNumber: true,
                user: {
                  select: { email: true, name: true },
                },
              },
            },
          },
        },
        digitalFile: {
          include: {
            book: {
              select: { name: true, author: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (downloads.length === 0) {
      console.log("❌ No digital downloads found for this user");
      return;
    }

    console.log(`📚 Found ${downloads.length} digital downloads for the user:`);

    // Group downloads by order
    const downloadsByOrder = {};
    downloads.forEach((download) => {
      const orderNumber = download.orderItem.order.orderNumber;
      if (!downloadsByOrder[orderNumber]) {
        downloadsByOrder[orderNumber] = {
          order: download.orderItem.order,
          downloads: [],
        };
      }
      downloadsByOrder[orderNumber].downloads.push(download);
    });

    // Generate email content
    let emailContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Your Digital Books - TeechTots</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4f46e5; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .book { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #4f46e5; }
        .download-btn { 
            display: inline-block; 
            background: #4f46e5; 
            color: white; 
            padding: 10px 20px; 
            text-decoration: none; 
            border-radius: 5px; 
            margin: 10px 0; 
        }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📚 Your Digital Books Are Ready!</h1>
        </div>
        <div class="content">
            <p>Hello! Thank you for your purchase from TeechTots. Your digital books are now available for download:</p>
            
`;

    Object.values(downloadsByOrder).forEach((orderData) => {
      emailContent += `<h3>Order: ${orderData.order.orderNumber}</h3>\n`;

      orderData.downloads.forEach((download) => {
        const book = download.digitalFile.book;
        const downloadUrl = `http://localhost:3000/api/download/${download.downloadToken}`;

        emailContent += `
            <div class="book">
                <h4>${book.name}</h4>
                <p><strong>Author:</strong> ${book.author}</p>
                <p><strong>Format:</strong> ${download.digitalFile.format.toUpperCase()}</p>
                <p><strong>Language:</strong> ${download.digitalFile.language}</p>
                <a href="${downloadUrl}" class="download-btn">📥 Download Now</a>
                <p><small>Download expires: ${new Date(download.expiresAt).toLocaleDateString()}</small></p>
            </div>
        `;
      });
    });

    emailContent += `
            <p><strong>Important:</strong></p>
            <ul>
                <li>Download links expire in 30 days</li>
                <li>You can download each book up to 5 times</li>
                <li>Save the files to your device for offline reading</li>
            </ul>
            
            <p>Enjoy your new books and happy learning!</p>
        </div>
        <div class="footer">
            <p>TeechTots - STEM Education for Every Child</p>
            <p>If you have any issues downloading your books, please contact us.</p>
        </div>
    </div>
</body>
</html>
`;

    console.log("\n📋 Email content prepared:");
    console.log("=====================================");
    console.log("Subject: 📚 Your Digital Books Are Ready - TeechTots");
    console.log("To:", downloads[0].orderItem.order.user.email);
    console.log("=====================================");

    // Display download links for manual testing
    console.log("\n🔗 Download Links:");
    downloads.forEach((download, index) => {
      const book = download.digitalFile.book;
      const downloadUrl = `http://localhost:3000/api/download/${download.downloadToken}`;
      console.log(
        `   ${index + 1}. ${book.name} (${download.digitalFile.format})`
      );
      console.log(`      ${downloadUrl}`);
      console.log(
        `      Expires: ${new Date(download.expiresAt).toLocaleDateString()}`
      );
      console.log("");
    });

    console.log("✅ Email preparation completed!");
    console.log(
      "📧 In a real system, this email would be sent to:",
      downloads[0].orderItem.order.user.email
    );
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
sendDigitalEmail();
