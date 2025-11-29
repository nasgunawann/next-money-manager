import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import Providers from "@/components/providers";

export const metadata: Metadata = {
  title: "Kaslo - By Nanasgunung",
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {children}
          <Toaster position="top-center" richColors />
        </Providers>
      </body>
    </html>
  );
}
