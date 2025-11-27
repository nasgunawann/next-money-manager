import type { ComponentType } from "react";
import {
  IconCashBanknote,
  IconCreditCard,
  IconDeviceMobileDollar,
  IconMoneybag,
  IconWallet,
} from "@tabler/icons-react";

export type AccountTypeValue = "cash" | "bank" | "ewallet" | "savings";

export interface AccountIconOption {
  key: string;
  label: string;
  type: AccountTypeValue;
  icon: ComponentType<{ className?: string }>;
}

export const ACCOUNT_ICON_OPTIONS: AccountIconOption[] = [
  {
    key: "cash",
    label: "Tunai",
    type: "cash",
    icon: IconCashBanknote,
  },
  {
    key: "bank",
    label: "Bank",
    type: "bank",
    icon: IconCreditCard,
  },
  {
    key: "ewallet",
    label: "E-Wallet",
    type: "ewallet",
    icon: IconDeviceMobileDollar,
  },
  {
    key: "savings",
    label: "Tabungan",
    type: "savings",
    icon: IconMoneybag,
  },
];

export const ACCOUNT_ICON_MAP: Record<string, ComponentType<{ className?: string }>> = {
  cash: IconCashBanknote,
  bank: IconCreditCard,
  ewallet: IconDeviceMobileDollar,
  savings: IconMoneybag,
  wallet: IconWallet, // legacy key
};

export function getAccountIconComponent(key?: string, type?: string) {
  if (key && ACCOUNT_ICON_MAP[key]) {
    return ACCOUNT_ICON_MAP[key];
  }
  if (type && ACCOUNT_ICON_MAP[type]) {
    return ACCOUNT_ICON_MAP[type];
  }
  return IconWallet;
}

