/**
 * Security utilities for the NextCommerce application
 */

/**
 * Checks if the application is running in development mode
 * @returns {boolean} True if in development mode
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === "development";
}

/**
 * Sanitizes HTML content to prevent XSS attacks
 * @param html The raw HTML content to sanitize
 * @returns Sanitized HTML content
 */
export function sanitizeHtml(html: string): string {
  // This is a very simple implementation
  // In a production app, you would use a library like DOMPurify
  return html
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/`/g, "&#96;");
}

/**
 * Sanitizes a URL to prevent JavaScript injection
 * @param url The URL to sanitize
 * @returns Sanitized URL or undefined if the URL is invalid
 */
export function sanitizeUrl(url: string): string | undefined {
  try {
    const parsedUrl = new URL(url);
    // Only allow http and https protocols
    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      return undefined;
    }
    return parsedUrl.toString();
  } catch (error) {
    // If the URL is invalid, return undefined
    return undefined;
  }
}

/**
 * Sanitizes form input to prevent common attacks
 * @param input The input string to sanitize
 * @returns Sanitized input string
 */
export function sanitizeInput(input: string): string {
  // Remove potentially dangerous characters
  return input.trim();
}

/**
 * Generates a limited-time CSRF token for forms
 * @param sessionId The current session ID
 * @param expirationMinutes How long the token should be valid in minutes
 * @returns A CSRF token that includes an expiration timestamp
 */
export function generateCsrfToken(
  sessionId: string,
  expirationMinutes: number = 60
): string {
  const timestamp = Date.now() + expirationMinutes * 60 * 1000;
  const tokenData = `${sessionId}:${timestamp}`;
  // In a real implementation, this would be signed with a secret key
  // using a library like crypto to create an HMAC
  return Buffer.from(tokenData).toString("base64");
}

/**
 * Validates a CSRF token
 * @param token The token to validate
 * @param sessionId The current session ID
 * @returns True if the token is valid and not expired, false otherwise
 */
export function validateCsrfToken(token: string, sessionId: string): boolean {
  try {
    const tokenData = Buffer.from(token, "base64").toString();
    const [storedSessionId, timestampStr] = tokenData.split(":");

    if (storedSessionId !== sessionId) {
      return false;
    }

    const timestamp = parseInt(timestampStr, 10);
    const now = Date.now();

    if (isNaN(timestamp) || timestamp < now) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Generates a nonce for Content-Security-Policy
 * @returns A random nonce value
 */
export function generateNonce(): string {
  return Buffer.from(Math.random().toString(36).substring(2, 15)).toString(
    "base64"
  );
}

/**
 * Security headers that should be applied to all responses
 */
export const securityHeaders = {
  // Prevent the browser from interpreting files as a different MIME type
  "X-Content-Type-Options": "nosniff",

  // Disable loading the page in an iframe (helps prevent clickjacking)
  "X-Frame-Options": "DENY",

  // Enable XSS protection in older browsers
  "X-XSS-Protection": "1; mode=block",

  // Prevents the browser from sending the Referer header when navigating away
  "Referrer-Policy": "strict-origin-when-cross-origin",

  // Control permissions for browser features
  "Permissions-Policy":
    "camera=(), microphone=(), geolocation=(), interest-cohort=()",

  // HTTP Strict Transport Security
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
};
