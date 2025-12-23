import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Context Bridge - Custom AI Integrations for Business Tools",
  description:
    "Connect Claude AI to your business tools with custom MCP servers. Fast delivery, production-grade code, full documentation. Starting at $2,500.",
  keywords:
    "MCP server, Claude AI integration, AI tool integration, custom API integration, business automation",
  openGraph: {
    title: "Context Bridge - AI Integrations",
    description: "Custom MCP servers connecting Claude to your business tools",
    url: "https://contextbridge.systems",
    siteName: "Context Bridge",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Context Bridge - Custom AI Integrations",
    description: "Custom MCP servers connecting Claude to your business tools",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <script
          defer
          data-domain="contextbridge.systems"
          src="https://plausible.io/js/script.js"
        />
      </head>
      <body className="font-sans">{children}</body>
    </html>
  );
}
