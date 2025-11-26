"use client";

import { MobileNav } from "@/components/mobile-nav";
import { DesktopSidebar } from "@/components/desktop-sidebar";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { useProfile } from "@/hooks/use-profile";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);
  const { data: profile } = useProfile();
  const firstName = profile?.full_name?.split(" ")[0];

  const headerContent = useMemo(() => {
    const menuItems = [
      {
        href: "/dashboard",
        title: firstName ? `Halo, ${firstName}` : "Dashboard",
      },
      {
        href: "/transactions",
        title: "Riwayat Transaksi",
        subtitle: "Kelola semua pemasukan dan pengeluaran Anda.",
      },
      {
        href: "/accounts",
        title: "Sumber Dana",
        subtitle: "Pantau setiap akun dan saldo Anda.",
      },
      {
        href: "/reports",
        title: "Analisis Pengeluaran",
        subtitle: "Visualisasikan distribusi pengeluaran bulanan.",
      },
      {
        href: "/profile",
        title: "Profil Saya",
        subtitle: "Kelola informasi profil dan pengaturan akun.",
      },
      {
        href: "/settings",
        title: "Pengaturan",
        subtitle: "Atur preferensi aplikasi Anda.",
      },
      {
        href: "/onboarding",
        title: "Onboarding",
        subtitle: "Lengkapi langkah awal sebelum mulai menggunakan aplikasi.",
      },
    ];

    const match = menuItems.find((item) => pathname?.startsWith(item.href));
    return match ?? { title: "MoneyManager" };
  }, [pathname, firstName]);

  useEffect(() => {
    setIsNavigating(true);
    const timer = setTimeout(() => setIsNavigating(false), 150);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-background">
      <DesktopSidebar />

      {/* Subtle loading indicator */}
      {isNavigating && (
        <motion.div
          className="fixed top-0 left-0 right-0 h-0.5 bg-primary z-50 origin-left"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          exit={{ scaleX: 0 }}
          transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
        />
      )}

      <div className="md:pl-64 pb-16 md:pb-0 transition-all duration-300">
        <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
            <h1 className="text-lg font-semibold text-foreground md:text-xl">
              {headerContent.title}
            </h1>
            {headerContent.subtitle && (
              <p className="text-sm text-muted-foreground mt-1">
                {headerContent.subtitle}
              </p>
            )}
          </div>
        </header>

        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{
                duration: 0.15,
                ease: [0.4, 0, 0.2, 1],
              }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <MobileNav />
    </div>
  );
}
