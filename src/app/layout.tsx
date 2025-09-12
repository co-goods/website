import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Analytics } from "@vercel/analytics/react";
import GoogleAnalytics from "@/components/GoogleAnalytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Co-Goods - Protocol for Co-Created Physical Products",
    template: "%s | Co-Goods"
  },
  description: "Developing a protocol and token for co-created and networked physical products that become more valuable through shared use and collaborative ownership.",
  keywords: ["co-goods", "protocol", "cooperative economics", "antirival goods", "network effects", "shared ownership", "collaborative economy", "physical products", "token economics"],
  authors: [{ name: "Co-Goods Team" }],
  creator: "Co-Goods",
  publisher: "Co-Goods",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Co-Goods - Protocol for Co-Created Physical Products",
    description: "Developing a protocol and token for co-created and networked physical products that become more valuable through shared use and collaborative ownership.",
    siteName: "Co-Goods",
  },
  twitter: {
    card: "summary_large_image",
    title: "Co-Goods - Protocol for Co-Created Physical Products",
    description: "Developing a protocol and token for co-created and networked physical products that become more valuable through shared use and collaborative ownership.",
  },
  alternates: {
    canonical: "https://cogoods.org",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <Navigation />
        <main className="min-h-screen bg-gray-50">
          {children}
        </main>
        <Footer />
        <Analytics />
        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics ga_id={process.env.NEXT_PUBLIC_GA_ID} />
        )}
      </body>
    </html>
  );
}
