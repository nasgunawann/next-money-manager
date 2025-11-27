import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type AuthStatus = "unknown" | "authenticated" | "unauthenticated";

export default function useSessionGuard() {
  const router = useRouter();
  const [status, setStatus] = useState<AuthStatus>("unknown");

  useEffect(() => {
    let isMounted = true;

    const syncState = (nextStatus: AuthStatus) => {
      if (!isMounted) return;
      setStatus(nextStatus);
      if (nextStatus === "unauthenticated") {
        router.replace("/login");
      }
    };

    supabase.auth.getSession().then(({ data }) => {
      syncState(data.session ? "authenticated" : "unauthenticated");
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      syncState(session ? "authenticated" : "unauthenticated");
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
