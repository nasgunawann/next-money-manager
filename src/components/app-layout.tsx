"use client";

import { MobileNav } from "@/components/mobile-nav";
import { DesktopSidebar } from "@/components/desktop-sidebar";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { useProfile } from "@/hooks/use-profile";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import useSessionGuard from "@/hooks/use-session-guard";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  IconUser,
  IconLogout,
  IconChevronDown,
  IconSettings,
} from "@tabler/icons-react";
import Link from "next/link";
import { toast } from "sonner";

type HeaderMenuItem = {
  href?: string;
  title: string;
  subtitle?: string;
};

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { data: profile } = useProfile();
  const firstName = profile?.full_name?.split(" ")[0];
  const sessionGuard = useSessionGuard();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    toast.success("Berhasil keluar");
    setIsUserMenuOpen(false);
  };

  const headerContent = useMemo(() => {
    const menuItems: HeaderMenuItem[] = [
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
        href: "/onboarding",
        title: "Onboarding",
        subtitle: "Lengkapi langkah awal sebelum mulai menggunakan aplikasi.",
      },
    ];

    const match = menuItems.find((item) => {
      if (!item.href) return false;
      return pathname?.startsWith(item.href);
    });
    return match ?? { title: "MoneyManager" };
  }, [pathname, firstName]);

  useEffect(() => {
    setIsNavigating(true);
    const timer = setTimeout(() => setIsNavigating(false), 150);
    return () => clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    let ticking = false;
    const ENTER_COLLAPSED = 64; // Trigger earlier for more space
    const EXIT_COLLAPSED = 32; // Exit earlier too

    const updateScrollState = () => {
      const scrollY = window.scrollY;

      setIsScrolled((prev) => {
        if (prev && scrollY < EXIT_COLLAPSED) {
          return false;
        }
        if (!prev && scrollY > ENTER_COLLAPSED) {
          return true;
        }
        return prev;
      });

      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollState);
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    updateScrollState();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!sessionGuard.isAuthenticated) {
    return null;
  }

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
        <header
          className={cn(
            "sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-md supports-backdrop-filter:bg-background/60 transition-all duration-300 shadow-sm"
          )}
        >
          <div
            className={cn(
              "max-w-7xl mx-auto px-4 md:px-6 lg:px-8 transition-all duration-300",
              isScrolled ? "py-1.5 md:py-2" : "py-4 md:py-5"
            )}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h1
                  className={cn(
                    "font-bold text-foreground transition-all duration-300 tracking-tight",
                    isScrolled ? "text-sm md:text-base" : "text-xl md:text-2xl"
                  )}
                >
                  {headerContent.title}
                </h1>
                {headerContent.subtitle && !isScrolled && (
                  <p className="text-sm text-muted-foreground mt-1.5 line-clamp-1">
                    {headerContent.subtitle}
                  </p>
                )}
              </div>
              
              {/* User Menu */}
              <Popover open={isUserMenuOpen} onOpenChange={setIsUserMenuOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      "flex items-center rounded-full hover:bg-accent/50 transition-all duration-200",
                      isScrolled 
                        ? "h-auto py-1 px-1.5 gap-1.5" 
                        : "h-auto py-2 px-3 gap-2.5"
                    )}
                  >
                    <div
                      className={cn(
                        "rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border-2 border-border/50 ring-2 ring-transparent hover:ring-primary/20 transition-all",
                        isScrolled ? "h-7 w-7" : "h-9 w-9"
                      )}
                    >
                      {profile?.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt={profile.full_name || "Profile"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <IconUser
                          className={cn(
                            "text-primary transition-all duration-300",
                            isScrolled ? "h-3.5 w-3.5" : "h-4.5 w-4.5"
                          )}
                        />
                      )}
                    </div>
                    {!isScrolled && (
                      <>
                        <div className="hidden md:flex flex-col items-start">
                          <span className="text-sm font-semibold text-foreground leading-tight">
                            {firstName || profile?.email?.split("@")[0] || "User"}
                          </span>
                          <span className="text-xs text-muted-foreground leading-tight">
                            {profile?.email?.split("@")[0] || ""}
                          </span>
                        </div>
                        <IconChevronDown className="h-4 w-4 hidden md:inline text-muted-foreground" />
                      </>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-3" align="end">
                  <div className="space-y-2">
                    <div className="px-2 py-3 border-b border-border/50 flex items-center gap-3 bg-muted/30 rounded-lg">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border-2 border-border flex-shrink-0 ring-2 ring-primary/10">
                        {profile?.avatar_url ? (
                          <img
                            src={profile.avatar_url}
                            alt={profile.full_name || "Profile"}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <IconUser className="h-6 w-6 text-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {profile?.full_name || "User"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {profile?.email}
                        </p>
                      </div>
                    </div>
                    <Link
                      href="/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="w-full"
                    >
                      <Button
                        variant="ghost"
                        className="w-full justify-start hover:bg-accent transition-colors"
                      >
                        <IconSettings className="mr-2 h-4 w-4" />
                        Profil & Pengaturan
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
                      onClick={handleLogout}
                    >
                      <IconLogout className="mr-2 h-4 w-4" />
                      Keluar
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
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
