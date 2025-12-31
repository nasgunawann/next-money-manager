"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import LandingPage from "@/components/landing-page";
import { PWAOnboarding } from "@/components/pwa-onboarding";

export default function Home() {
  const router = useRouter();
  const [isPWA, setIsPWA] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        router.replace("/dashboard");
      }
    });

    // Detect if running as PWA
    const checkPWA = () => {
      const navigatorWithStandalone = window.navigator as Navigator & {
        standalone?: boolean;
      };
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        navigatorWithStandalone.standalone === true ||
        document.referrer.includes("android-app://");
      setIsPWA(isStandalone);
    };

    checkPWA();
  }, [router]);

  // Defer rendering until we've checked PWA state to avoid flashing the wrong UI
  if (isPWA === null) return null;

  if (isPWA) {
    return <PWAOnboarding />;
  }

  // Show landing page for web browsers
  return <LandingPage />;
}
