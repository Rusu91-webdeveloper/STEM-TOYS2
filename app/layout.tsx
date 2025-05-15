import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { CartProviderWrapper } from "@/features/cart";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "TechTots | STEM Toys for Curious Minds",
  description:
    "Discover the best STEM toys for curious minds at TechTots. Educational toys that make learning fun.",
  keywords:
    "STEM toys, science toys, technology toys, engineering toys, math toys, educational toys, TechTots",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="scroll-smooth">
      <head>
        <link
          rel="icon"
          type="image/svg+xml"
          href="/favicon.svg"
        />
      </head>
      <body
        className={`${inter.variable} font-sans antialiased min-h-screen flex flex-col`}>
        <CartProviderWrapper>
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
        </CartProviderWrapper>
        <Toaster />
      </body>
    </html>
  );
}
