"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

function ThemeSync() {
  const { setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const hasSyncedRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Only sync theme from database once on initial mount
  // This prevents overriding user-initiated theme changes
  useEffect(() => {
    if (!mounted || hasSyncedRef.current) return;

    const syncTheme = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          hasSyncedRef.current = true;
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("theme")
          .eq("id", user.id)
          .single();

        // Only set theme if we have a profile theme and haven't synced yet
        if (profile?.theme) {
          setTheme(profile.theme);
        }
        hasSyncedRef.current = true;
      } catch (error) {
        console.error("Error syncing theme:", error);
        hasSyncedRef.current = true;
      }
    };

    // Small delay to ensure next-themes has initialized
    const timer = setTimeout(() => {
      syncTheme();
    }, 100);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
          },
        },
      })
  );

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={false}
      storageKey="theme"
    >
      <ThemeSync />
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </NextThemesProvider>
  );
}
