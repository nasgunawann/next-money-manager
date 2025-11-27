"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  IconHome,
  IconChartPie,
  IconWallet,
  IconUser,
  IconPlus,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { AddTransactionDialog } from "./add-transaction-dialog";
import { useState, useEffect } from "react";

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAddOpen, setIsAddOpen] = useState(false);

  const leftLinks = [
    { href: "/dashboard", label: "Beranda", icon: IconHome },
    { href: "/transactions", label: "Transaksi", icon: IconWallet },
  ];

  const rightLinks = [
    { href: "/reports", label: "Laporan", icon: IconChartPie },
    { href: "/profile", label: "Profil", icon: IconUser },
  ];

  const allLinks = [...leftLinks, ...rightLinks];

  // Prefetch all navigation links for faster navigation
  useEffect(() => {
    allLinks.forEach((link) => {
      router.prefetch(link.href);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border md:hidden z-50">
        <div className="flex justify-around items-center h-16 relative">
          {/* Left Links */}
          {leftLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex flex-col items-center justify-center w-full h-full space-y-1",
                  "transition-all duration-200 ease-in-out transform active:scale-95",
                  isActive
                    ? "text-primary scale-105"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon
                  className={cn(
                    "h-6 w-6 transition-all duration-200",
                    isActive && "scale-110"
                  )}
                />
                <span className="text-[10px] font-medium">{link.label}</span>
              </Link>
            );
          })}

          {/* Center FAB Spacer */}
          <div className="w-full" />

          {/* Right Links */}
          {rightLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex flex-col items-center justify-center w-full h-full space-y-1",
                  "transition-all duration-200 ease-in-out transform active:scale-95",
                  isActive
                    ? "text-primary scale-105"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon
                  className={cn(
                    "h-6 w-6 transition-all duration-200",
                    isActive && "scale-110"
                  )}
                />
                <span className="text-[10px] font-medium">{link.label}</span>
              </Link>
            );
          })}

          {/* Elevated Center FAB */}
          <button
            onClick={() => setIsAddOpen(true)}
            className="absolute left-1/2 -translate-x-1/2 -top-6 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 active:scale-95 flex items-center justify-center"
          >
            <IconPlus className="h-6 w-6" />
          </button>
        </div>
      </nav>

      <AddTransactionDialog open={isAddOpen} onOpenChange={setIsAddOpen} />
    </>
  );
}
