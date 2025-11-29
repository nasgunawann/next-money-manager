/// <reference lib="webworker" />

import { defaultCache } from "@serwist/next/worker";
import { Serwist, CacheableResponsePlugin, ExpirationPlugin } from "serwist";

declare const self: ServiceWorkerGlobalScope & {
  __SW_MANIFEST: Array<string | { url: string; revision?: string }>;
};

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    // Cache API requests with network-first strategy
    {
      matcher: ({ url }) => url.pathname.startsWith("/api/"),
      handler: "NetworkFirst",
      options: {
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
      },
    },
    // Cache Supabase requests with network-first
    {
      matcher: ({ url }) => url.hostname.includes("supabase.co"),
      handler: "NetworkFirst",
      options: {
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
      },
    },
    // Cache images with cache-first
    {
      matcher: ({ request }) => request.destination === "image",
      handler: "CacheFirst",
      options: {
        cacheName: "image-cache",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 60,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          }),
        ],
      },
    },
    // Default cache for everything else
    ...defaultCache,
  ],
});

serwist.addEventListeners();

export {};

