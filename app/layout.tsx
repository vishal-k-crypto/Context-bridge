import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Context Bridge - Full-Stack Automation Agency",
  description:
    "Connect your business tools with custom API integrations, MCP servers, dashboards, and automation. One developer handles everything—APIs, AI, web dev. $2K-25K projects delivered in weeks.",
  keywords:
    "API integration, MCP server, Claude AI integration, business automation, custom dashboard, workflow automation, full-stack development",
  openGraph: {
    title: "Context Bridge - Full-Stack Automation Agency",
    description:
      "APIs, AI Integrations, Dashboards, Automation. One developer. Complete systems. Built in weeks.",
    url: "https://contextbridge.systems",
    siteName: "Context Bridge",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Context Bridge - Full-Stack Automation Agency",
    description:
      "APIs, AI Integrations, Dashboards, Automation. One developer. Complete systems.",
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
      <body className="font-sans">
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
