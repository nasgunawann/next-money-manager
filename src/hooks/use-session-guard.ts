import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

let cachedAuthStatus: boolean | null = null;

export default function useSessionGuard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(cachedAuthStatus === null);
  const [isAuthenticated, setIsAuthenticated] = useState(
    cachedAuthStatus ?? false
  );

  useEffect(() => {
    let isMounted = true;

    const syncState = (authed: boolean) => {
      cachedAuthStatus = authed;
      if (!isMounted) return;
      setIsAuthenticated(authed);
      setIsLoading(false);
      if (!authed) {
        router.replace("/login");
      }
    };

    if (cachedAuthStatus === null) {
      supabase.auth.getSession().then(({ data }) => {
        syncState(!!data.session);
      });
    } else if (!cachedAuthStatus) {
      router.replace("/login");
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      syncState(!!session);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  return { isLoading, isAuthenticated };
}

