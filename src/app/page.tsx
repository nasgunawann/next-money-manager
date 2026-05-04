"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import LandingPage from "@/components/landing/landing-page";
import { PWAOnboarding } from "@/components/pwa/pwa-onboarding";

export default function Home() {
  const router = useRouter();
  const [isPWA, setIsPWA] = useState<boolean>(false);

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

  // We no longer defer rendering with null to ensure SEO crawlers see the LandingPage content during SSR

  if (isPWA) {
    return <PWAOnboarding />;
  }

  // Show landing page for web browsers
  return <LandingPage />;
}
