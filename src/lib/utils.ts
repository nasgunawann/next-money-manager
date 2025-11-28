import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = "IDR") {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  cash: "Tunai",
  bank: "Bank",
  ewallet: "E-Wallet",
  savings: "Tabungan",
};

export function formatAccountType(type?: string | null) {
  if (!type) return "";
  return ACCOUNT_TYPE_LABELS[type] ?? type;
}

export function sanitizeNumericInput(value: string) {
  return value.replace(/\D/g, "");
}

export function formatNumericInput(value: string) {
  const digits = sanitizeNumericInput(value);
  if (!digits) return "";
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function numericInputToNumber(value: string) {
  const digits = sanitizeNumericInput(value);
  return digits ? parseInt(digits, 10) : 0;
}

export function generateTempId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `temp-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
