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
