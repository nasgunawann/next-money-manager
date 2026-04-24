"use client";

import { useEffect, useRef } from "react";

export function ServiceWorkerRegistration() {
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Only register if service workers are supported
    // Service worker file only exists in production builds
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      // Register after page load to avoid blocking initial render
      const registerSW = () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log(
              "Service Worker registered successfully:",
              registration.scope
            );

            // Check for updates periodically
            updateIntervalRef.current = setInterval(() => {
              registration.update();
            }, 60 * 60 * 1000); // Check every hour
          })
          .catch((error) => {
            console.error("Service Worker registration failed:", error);
          });
      };

      // Register immediately if page is already loaded
      if (document.readyState === "complete") {
        registerSW();
      } else {
        // Otherwise wait for page load
        window.addEventListener("load", registerSW);
      }

      return () => {
        // Cleanup: remove event listener and clear interval
        window.removeEventListener("load", registerSW);
        if (updateIntervalRef.current) {
          clearInterval(updateIntervalRef.current);
          updateIntervalRef.current = null;
        }
      };
    }
  }, []);

  return null;
}
