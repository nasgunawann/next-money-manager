"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, PieChart, Wallet, User, LogOut, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

export function DesktopSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const links = [
    { href: "/dashboard", label: "Beranda", icon: Home },
    { href: "/transactions", label: "Transaksi", icon: Wallet },
    { href: "/reports", label: "Laporan", icon: PieChart },
    { href: "/profile", label: "Profil", icon: User },
    { href: "/settings", label: "Pengaturan", icon: Settings },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <aside className="hidden md:flex flex-col w-64 bg-sidebar border-r border-sidebar-border h-screen fixed left-0 top-0 z-50">
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-xl font-bold text-sidebar-primary flex items-center gap-2">
          <Wallet className="h-6 w-6" />
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
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary font-medium"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <Button
          variant="ghost"
          className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Keluar
        </Button>
      </div>
    </aside>
  );
}
