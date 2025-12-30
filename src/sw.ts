/// <reference lib="webworker" />

import { defaultCache } from "@serwist/next/worker";
import {
  Serwist,
  CacheableResponsePlugin,
  ExpirationPlugin,
  NetworkFirst,
  CacheFirst,
} from "serwist";

declare const self: ServiceWorkerGlobalScope & {
  __SW_MANIFEST: Array<string | { url: string; revision?: string }>;
};

// Filter manifest to exclude files that commonly cause 404s
// These will be cached on-demand via runtime caching instead
const filteredManifest = self.__SW_MANIFEST.filter((entry) => {
  const url = typeof entry === "string" ? entry : entry.url;
  // Exclude problematic file patterns that often return 404
  // These are typically old build artifacts or files that don't exist
  return !(
    (url.includes("/_next/static/media/") && url.endsWith(".woff2")) ||
    url.includes("/_next/static/chunks/webpack-") ||
    url.includes("/_next/static/chunks/polyfills-") ||
    url.includes("/_next/static/chunks/pages/_error-") ||
    (url.includes("/_next/static/css/") && url.endsWith(".css"))
  );
});

const serwist = new Serwist({
  precacheEntries: filteredManifest,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // Handle navigation requests with offline fallback
    {
      matcher: ({ request }) => request.mode === "navigate",
      handler: new NetworkFirst({
        cacheName: "pages-cache",
        plugins: [
          new CacheableResponsePlugin({
            statuses: [0, 200],
          }),
          {
            handlerDidError: async () => {
              // Try to get offline page from all caches
              const cacheNames = await caches.keys();

              for (const cacheName of cacheNames) {
                const cache = await caches.open(cacheName);
                const offlineResponse = await cache.match("/offline");
                if (offlineResponse) {
                  return offlineResponse;
                }
              }

              // Last resort: return a basic HTML response if offline page not cached
              return new Response(
                `<!DOCTYPE html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Offline</title><style>body{font-family:system-ui;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f5f5f5;color:#333}div{text-align:center;padding:2rem;background:white;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1)}h1{font-size:1.5rem;margin:0 0 1rem}button{padding:0.75rem 1.5rem;background:#0070f3;color:white;border:none;border-radius:4px;cursor:pointer;font-size:1rem}button:hover{background:#0051cc}</style></head><body><div><h1>Anda Sedang Offline</h1><p>Periksa koneksi internet Anda dan coba lagi.</p><button onclick="window.location.reload()">Coba Lagi</button></div></body></html>`,
                {
                  status: 200,
                  headers: { "Content-Type": "text/html" },
                }
              );
            },
          },
        ],
      }),
    },
    // Cache API requests with network-first strategy
    {
      matcher: ({ url }) => url.pathname.startsWith("/api/"),
      handler: new NetworkFirst({
        cacheName: "api-cache",
        plugins: [
          new CacheableResponsePlugin({
            statuses: [0, 200],
          }),
          new ExpirationPlugin({
            maxEntries: 50,
            maxAgeSeconds: 5 * 60, // 5 minutes
          }),
        ],
      }),
    },
    // Cache Supabase requests with network-first
    {
      matcher: ({ url }) => url.hostname.includes("supabase.co"),
      handler: new NetworkFirst({
        cacheName: "supabase-cache",
        plugins: [
          new CacheableResponsePlugin({
            statuses: [0, 200],
          }),
          new ExpirationPlugin({
            maxEntries: 100,
            maxAgeSeconds: 10 * 60, // 10 minutes
          }),
        ],
      }),
    },
    // Cache images with cache-first
    {
      matcher: ({ request }) => request.destination === "image",
      handler: new CacheFirst({
        cacheName: "image-cache",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 60,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          }),
        ],
      }),
    },
    // Default cache for everything else
    ...defaultCache,
  ],
});

serwist.addEventListeners();

// Cache offline page on service worker activation
self.addEventListener("activate", async (event) => {
  event.waitUntil(
    (async () => {
      // Check if offline page is already cached
      const cacheNames = await caches.keys();
      let offlineCached = false;

      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        if (await cache.match("/offline")) {
          offlineCached = true;
          break;
        }
      }

      // If not cached, fetch and cache it
      if (!offlineCached) {
        try {
          const response = await fetch("/offline");
          if (response.ok) {
            const cache = await caches.open("pages-cache");
            await cache.put("/offline", response.clone());
          }
        } catch {
          // Ignore errors - will cache on next visit when online
        }
      }
    })()
  );
});

export {};
