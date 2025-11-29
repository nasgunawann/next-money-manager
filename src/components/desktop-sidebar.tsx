"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  IconHome,
  IconChartPie,
  IconWallet,
  IconUser,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

export function DesktopSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const links = [
    { href: "/dashboard", label: "Beranda", icon: IconHome },
    { href: "/transactions", label: "Transaksi", icon: IconWallet },
    { href: "/accounts", label: "Sumber Dana", icon: IconWallet },
    { href: "/reports", label: "Laporan", icon: IconChartPie },
    { href: "/profile", label: "Profil", icon: IconUser },
  ];

  // Prefetch all navigation links for faster navigation
  useEffect(() => {
    links.forEach((link) => {
      router.prefetch(link.href);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <aside className="hidden md:flex flex-col w-64 bg-sidebar border-r border-sidebar-border h-screen fixed left-0 top-0 z-50">
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-xl font-bold text-sidebar-primary flex items-center gap-2">
          <IconWallet className="h-6 w-6" />
          MoneyManager
        </h1>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "group flex items-center gap-3 px-4 py-3 rounded-lg",
                "transition-all duration-150 ease-out",
                "transform hover:scale-[1.02] active:scale-[0.98]",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary font-medium shadow-sm"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <Icon
                className={cn(
                  "h-6 w-6 transition-transform duration-200",
                  isActive ? "scale-110" : "group-hover:scale-110"
                )}
              />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
