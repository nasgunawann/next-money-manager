"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "amount-visible";

export function useAmountVisibility() {
  // Initialize from localStorage, default to true (visible)
  const [visible, setVisible] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored === null ? true : stored === "true";
    } catch {
      return true;
    }
  });

  // Sync to localStorage whenever visibility changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(visible));
    } catch {
      // Silently fail if localStorage is unavailable
    }
  }, [visible]);

  const toggle = () => setVisible((v) => !v);

  return { visible, toggle };
}
