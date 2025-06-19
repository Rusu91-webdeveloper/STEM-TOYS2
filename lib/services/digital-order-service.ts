import { db } from "@/lib/db";
import { emailTemplates } from "@/lib/brevoTemplates";
import crypto from "crypto";

interface DigitalOrderItem {
  id: string;
  bookId: string;
  quantity: number;
  price: number;
  name: string;
}

interface DigitalOrder {
  id: string;
  orderNumber: string;
  userId: string;
  items: DigitalOrderItem[];
  user: {
    name: string;
    email: string;
  };
}

/**
 * Generate a secure download token
 */
function generateDownloadToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Process digital book order - create download links and send email
 * @param orderId - The order ID to process
 * @param languagePreferences - Optional mapping of orderItemId to selected language
 */
export async function processDigitalBookOrder(
  orderId: string,
  languagePreferences?: Map<string, string>
): Promise<void> {
  try {
    console.log(`Processing digital book order: ${orderId}`);

    // Get the order with all digital book items
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        user: true,
        items: {
          where: { isDigital: true },
          include: {
            book: {
              include: {
                digitalFiles: {
                  where: { isActive: true },
                },
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new Error(`Order not found: ${orderId}`);
    }

    if (order.items.length === 0) {
      console.log(`No digital items found in order: ${orderId}`);
      return;
    }

    console.log(
      `Found ${order.items.length} digital items in order ${order.orderNumber}`
    );

    // Set download expiration (30 days from now)
    const downloadExpiresAt = new Date();
    downloadExpiresAt.setDate(downloadExpiresAt.getDate() + 30);

    // Generate download tokens for each digital file
    const downloadLinks: Array<{
      bookName: string;
      format: string;
      language: string;
      downloadUrl: string;
      expiresAt: Date;
    }> = [];

    const books: Array<{
      name: string;
      author: string;
      price: number;
      coverImage?: string;
    }> = [];

    for (const orderItem of order.items) {
      if (!orderItem.book) {
        console.error(`Book not found for order item: ${orderItem.id}`);
        continue;
      }

      const book = orderItem.book;

      // Add book info for email
      const bookInfo = {
        name: book.name,
        author: book.author,
        price: orderItem.price,
        coverImage: book.coverImage || undefined,
      };

      // Check if we already added this book
      const existingBook = books.find((b) => b.name === bookInfo.name);
      if (!existingBook) {
        books.push(bookInfo);
      }

      // Update order item with download expiration
      await db.orderItem.update({
        where: { id: orderItem.id },
        data: {
          downloadExpiresAt,
        },
      });

      // Filter digital files by selected language if specified
      let digitalFilesToProcess = book.digitalFiles;

      // Check if there's a language preference for this order item
      const selectedLanguage = languagePreferences?.get(orderItem.id);

      if (selectedLanguage) {
        digitalFilesToProcess = book.digitalFiles.filter(
          (file) => file.language === selectedLanguage
        );
        console.log(
          `Filtering digital files for language: ${selectedLanguage} for book: ${book.name}`
        );
      }

      // If no files match the selected language, fall back to all files
      if (digitalFilesToProcess.length === 0) {
        console.warn(
          `No digital files found for language ${selectedLanguage} for book ${book.name}. Using all available files.`
        );
        digitalFilesToProcess = book.digitalFiles;
      }

      // Create download records for each digital file
      for (const digitalFile of digitalFilesToProcess) {
        const downloadToken = generateDownloadToken();

        // Create download record
        await db.digitalDownload.create({
          data: {
            orderItemId: orderItem.id,
            userId: order.userId,
            digitalFileId: digitalFile.id,
            downloadToken,
            expiresAt: downloadExpiresAt,
          },
        });

        // Build download URL
        const baseUrl =
          process.env.NEXT_PUBLIC_SITE_URL ||
          process.env.NEXTAUTH_URL ||
          "http://localhost:3000";
        const downloadUrl = `${baseUrl}/api/download/${downloadToken}`;

        downloadLinks.push({
          bookName: book.name,
          format: digitalFile.format,
          language: digitalFile.language,
          downloadUrl,
          expiresAt: downloadExpiresAt,
        });

        console.log(
          `Created download link for ${book.name} (${digitalFile.format}, ${digitalFile.language})`
        );
      }
    }

    console.log(
      `Generated ${downloadLinks.length} download links for order ${order.orderNumber}`
    );

    // Send delivery email
    try {
      await emailTemplates.digitalBookDelivery({
        to: order.user.email,
        customerName: order.user.name || "Valued Customer",
        orderId: order.orderNumber,
        books,
        downloadLinks,
      });

      console.log(
        `Digital book delivery email sent to ${order.user.email} for order ${order.orderNumber}`
      );
    } catch (emailError) {
      console.error(
        `Failed to send delivery email for order ${order.orderNumber}:`,
        emailError
      );
      // Don't throw here - the download links are still created
    }

    console.log(
      `Successfully processed digital book order: ${order.orderNumber}`
    );
  } catch (error) {
    console.error(`Error processing digital book order ${orderId}:`, error);
    throw error;
  }
}

/**
 * Helper function to get selected language for an order item
 * This will be enhanced once we store language selection in the database
 */
async function getSelectedLanguageForOrderItem(
  orderItemId: string
): Promise<string | null> {
  // For now, we'll implement a basic approach
  // In a full implementation, we'd store the selected language in the order item
  // or in a separate table linked to the order item

  // This is a placeholder - we'll need to modify the order creation process
  // to store the selected language information
  return null;
}

/**
 * Create download links for existing completed orders (useful for migration/backfill)
 */
export async function createDownloadLinksForOrder(
  orderId: string
): Promise<void> {
  try {
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          where: { isDigital: true },
        },
      },
    });

    if (!order) {
      throw new Error(`Order not found: ${orderId}`);
    }

    // Check if download links already exist
    const existingDownloads = await db.digitalDownload.findMany({
      where: {
        orderItem: {
          orderId: order.id,
        },
      },
    });

    if (existingDownloads.length > 0) {
      console.log(
        `Download links already exist for order ${order.orderNumber}`
      );
      return;
    }

    // Process the order
    await processDigitalBookOrder(orderId);
  } catch (error) {
    console.error(`Error creating download links for order ${orderId}:`, error);
    throw error;
  }
}

/**
 * Get download status for an order
 */
export async function getOrderDownloadStatus(orderId: string) {
  const downloads = await db.digitalDownload.findMany({
    where: {
      orderItem: {
        orderId,
      },
    },
    include: {
      digitalFile: {
        include: {
          book: true,
        },
      },
      orderItem: true,
    },
  });

  return downloads.map((download) => ({
    id: download.id,
    bookName: download.digitalFile.book.name,
    fileName: download.digitalFile.fileName,
    format: download.digitalFile.format,
    language: download.digitalFile.language,
    isDownloaded: !!download.downloadedAt,
    downloadedAt: download.downloadedAt,
    expiresAt: download.expiresAt,
    remainingDownloads:
      download.orderItem.maxDownloads - download.orderItem.downloadCount,
    downloadToken: download.downloadToken,
  }));
}

/**
 * Generate new download token for an existing download (in case of issues)
 */
export async function regenerateDownloadToken(
  downloadId: string
): Promise<string> {
  const newToken = generateDownloadToken();

  await db.digitalDownload.update({
    where: { id: downloadId },
    data: {
      downloadToken: newToken,
      downloadedAt: null, // Reset downloaded status
      // Extend expiration by 7 days
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return newToken;
}
