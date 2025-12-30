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
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AddTransactionDialog } from "@/components/add-transaction-dialog";
import Image from "next/image";

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
      <div className="p-4 border-b border-sidebar-border flex items-center justify-center">
        <Image
          src="/logo-sm.svg"
          alt="Kaslo"
          width={525}
          height={464}
          className="h-8 w-auto object-contain"
          priority
        />
      </div>

      {/* Add Transaction Button - Primary Action */}
      <div className="px-4 pt-4 pb-2">
        <AddTransactionDialog>
          <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-md hover:shadow-lg transition-all duration-200">
            <IconPlus className="h-5 w-5 mr-2" />
            Tambah Transaksi
          </Button>
        </AddTransactionDialog>
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
