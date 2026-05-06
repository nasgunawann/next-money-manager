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

import Providers from "@/components/shared/providers";
import { ServiceWorkerRegistration } from "@/components/pwa/service-worker-registration";

export const metadata: Metadata = {
  title: "Kaslo",
  description: "Pencatatan transaksi dan pengendalian anggaran harian.",
  manifest: "/manifest.json",
  metadataBase: new URL("https://kaslo.nanasgunung.com"),
  alternates: {
    canonical: "/",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Kaslo",
  },
  formatDetection: {
    telephone: false,
  },
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
  verification: {
    google: "OKh7wKUmUFZBm-Ma4Vy6uGKJb8BdNKPYrrpg-fpFHVE",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
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
    <html lang="id" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var isRoot = window.location.pathname === '/';
                  if (!isRoot) return;

                  var storage = window.localStorage;
                  var hasSession = false;
                  for (var i = 0; i < storage.length; i++) {
                    var key = storage.key(i);
                    if (key && key.indexOf('-auth-token') !== -1) {
                      var session = storage.getItem(key);
                      if (session && session !== 'null') {
                        hasSession = true;
                        break;
                      }
                    }
                  }
                  
                  if (hasSession) {
                    window.location.replace('/dashboard');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
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
