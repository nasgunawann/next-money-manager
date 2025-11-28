import type { ComponentType } from "react";
import {
  IconTag,
  IconToolsKitchen2,
  IconBus,
  IconShoppingBag,
  IconMovie,
  IconReceipt2,
  IconHeartbeat,
  IconSchool,
  IconPigMoney,
  IconCash,
  IconWallet,
  IconGift,
  IconTrendingUp,
  IconBriefcase,
  IconCoffee,
  IconDeviceMobile,
  IconWifi,
  IconHome,
  IconCar,
  IconPlane,
  IconDots,
} from "@tabler/icons-react";

export interface CategoryIconOption {
  key: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

export const CATEGORY_ICON_OPTIONS: CategoryIconOption[] = [
  { key: "utensils", label: "Makanan", icon: IconToolsKitchen2 },
  { key: "bus", label: "Transportasi", icon: IconBus },
  { key: "shopping-bag", label: "Belanja", icon: IconShoppingBag },
  { key: "film", label: "Hiburan", icon: IconMovie },
  { key: "receipt", label: "Tagihan", icon: IconReceipt2 },
  { key: "heart-pulse", label: "Kesehatan", icon: IconHeartbeat },
  { key: "graduation-cap", label: "Pendidikan", icon: IconSchool },
  { key: "piggy-bank", label: "Tabungan", icon: IconPigMoney },
  { key: "banknote", label: "Tunai", icon: IconCash },
  { key: "wallet", label: "Dompet", icon: IconWallet },
  { key: "gift", label: "Hadiah", icon: IconGift },
  { key: "trending-up", label: "Investasi", icon: IconTrendingUp },
  { key: "briefcase", label: "Bisnis", icon: IconBriefcase },
  { key: "coffee", label: "Kopi", icon: IconCoffee },
  { key: "smartphone", label: "Teknologi", icon: IconDeviceMobile },
  { key: "wifi", label: "Internet", icon: IconWifi },
  { key: "home", label: "Rumah", icon: IconHome },
  { key: "car", label: "Kendaraan", icon: IconCar },
  { key: "plane", label: "Travel", icon: IconPlane },
  { key: "more-horizontal", label: "Lainnya", icon: IconDots },
];

export const CATEGORY_ICON_MAP: Record<string, ComponentType<{ className?: string }>> =
  CATEGORY_ICON_OPTIONS.reduce(
    (acc, option) => {
      acc[option.key] = option.icon;
      return acc;
    },
    {} as Record<string, ComponentType<{ className?: string }>>
  );

export function getCategoryIconComponent(key?: string) {
  if (key && CATEGORY_ICON_MAP[key]) {
    return CATEGORY_ICON_MAP[key];
  }
  return IconTag;
}

