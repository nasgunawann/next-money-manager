import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  fallback: [
    "system-ui",
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI",
    "Roboto",
    "Helvetica Neue",
    "Arial",
    "sans-serif",
  ],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
  fallback: [
    "ui-monospace",
    "SFMono-Regular",
    "Menlo",
    "Monaco",
    "Consolas",
    "Liberation Mono",
    "Courier New",
    "monospace",
  ],
});

import Providers from "@/components/providers";
import { ServiceWorkerRegistration } from "@/components/service-worker-registration";

export const metadata: Metadata = {
  title: "Kaslo",
  description: "Pencatatan transaksi dan pengendalian anggaran harian.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Kaslo",
  },
  formatDetection: {
    telephone: false,
  },
  // Enhanced PWA metadata
  applicationName: "Kaslo",
  referrer: "origin-when-cross-origin",
  keywords: [
    "money",
    "finance",
    "budget",
    "transaksi",
    "keuangan",
    "pengeluaran",
    "pemasukan",
  ],
  authors: [{ name: "Nanasgunung" }],
  creator: "Nanasgunung",
  publisher: "Nanasgunung",
  openGraph: {
    type: "website",
    siteName: "Kaslo",
    title: "Kaslo - Money Manager",
    description: "Pencatatan transaksi dan pengendalian anggaran harian.",
  },
  twitter: {
    card: "summary",
    title: "Kaslo - Money Manager",
    description: "Pencatatan transaksi dan pengendalian anggaran harian.",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0b0b" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5, // Allow zoom for accessibility
  userScalable: true, // Allow zoom for accessibility
  viewportFit: "cover", // For iOS notch support
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${plusJakartaSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <ServiceWorkerRegistration />
          {children}
          <Toaster position="top-center" richColors />
        </Providers>
      </body>
    </html>
  );
}
