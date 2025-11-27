import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type AuthStatus = "unknown" | "authenticated" | "unauthenticated";
let cachedStatus: AuthStatus | null = null;

export default function useSessionGuard() {
  const router = useRouter();
  const [status, setStatus] = useState<AuthStatus>(
    cachedStatus ?? "unknown"
  );

  useEffect(() => {
    let isMounted = true;

    const applyStatus = (nextStatus: AuthStatus) => {
      cachedStatus = nextStatus;
      if (!isMounted) return;
      setStatus(nextStatus);
      if (nextStatus === "unauthenticated") {
        router.replace("/login");
      }
    };

    // Only check user once on mount (reads from local storage, fast)
    supabase.auth
      .getUser()
      .then(({ data }) => {
        applyStatus(data.user ? "authenticated" : "unauthenticated");
      })
      .catch(() => {
        applyStatus("unauthenticated");
      });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      applyStatus(session ? "authenticated" : "unauthenticated");
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  return {
    isLoading: status === "unknown",
    isAuthenticated: status === "authenticated",
  };
}
