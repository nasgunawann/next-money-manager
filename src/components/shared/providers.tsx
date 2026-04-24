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
            gcTime: 5 * 60 * 1000, // 5 minutes - keep cached data longer (formerly cacheTime)
            retry: (failureCount, error: unknown) => {
              // Don't retry on 4xx errors (client errors)
              const httpError = error as { status?: number };
              if (httpError?.status && httpError.status >= 400 && httpError.status < 500) {
                return false;
              }
              // Retry up to 3 times for other errors
              return failureCount < 3;
            },
            retryDelay: (attemptIndex) => {
              // Exponential backoff: 1s, 2s, 4s
              return Math.min(1000 * 2 ** attemptIndex, 30000);
            },
            refetchOnWindowFocus: false, // Better for PWA - don't refetch on tab focus
            refetchOnReconnect: true, // Refetch when back online
            refetchOnMount: true, // Refetch when component mounts (but use cache if fresh)
            networkMode: "online", // Only run queries when online (fallback to cache)
          },
          mutations: {
            retry: (failureCount, error: unknown) => {
              // Don't retry mutations on 4xx errors
              const httpError = error as { status?: number };
              if (httpError?.status && httpError.status >= 400 && httpError.status < 500) {
                return false;
              }
              // Retry once for network errors
              return failureCount < 1;
            },
            retryDelay: 1000,
            networkMode: "online", // Only run mutations when online
          },
        },
      })
  );

  useEffect(() => {
    let isInitialMount = true;
    
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      // Skip clearing cache on initial mount to preserve any pre-loaded data
      if (isInitialMount) {
        isInitialMount = false;
        return;
      }
      
      // Only clear cache on actual login/logout events, not on token refresh
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
        queryClient.clear();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

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
