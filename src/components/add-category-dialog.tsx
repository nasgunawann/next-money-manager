"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useProfile } from "@/hooks/use-profile";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  Loader2,
  Utensils,
  Bus,
  ShoppingBag,
  Film,
  Receipt,
  HeartPulse,
  GraduationCap,
  PiggyBank,
  Banknote,
  Wallet,
  Gift,
  TrendingUp,
  MoreHorizontal,
  Briefcase,
  Coffee,
  Smartphone,
  Wifi,
  Home,
  Car,
  Plane,
} from "lucide-react";
import { cn } from "@/lib/utils";

const COLORS = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#84cc16",
  "#10b981",
  "#06b6d4",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#d946ef",
  "#ec4899",
  "#64748b",
];

const ICONS = [
  { name: "utensils", icon: Utensils },
  { name: "bus", icon: Bus },
  { name: "shopping-bag", icon: ShoppingBag },
  { name: "film", icon: Film },
  { name: "receipt", icon: Receipt },
  { name: "heart-pulse", icon: HeartPulse },
  { name: "graduation-cap", icon: GraduationCap },
  { name: "piggy-bank", icon: PiggyBank },
  { name: "banknote", icon: Banknote },
  { name: "wallet", icon: Wallet },
  { name: "gift", icon: Gift },
  { name: "trending-up", icon: TrendingUp },
  { name: "briefcase", icon: Briefcase },
  { name: "coffee", icon: Coffee },
  { name: "smartphone", icon: Smartphone },
  { name: "wifi", icon: Wifi },
  { name: "home", icon: Home },
  { name: "car", icon: Car },
  { name: "plane", icon: Plane },
  { name: "more-horizontal", icon: MoreHorizontal },
];

export function AddCategoryDialog({
  children,
  open,
  onOpenChange,
}: {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();

  // Form State
  const [name, setName] = useState("");
  const [type, setType] = useState("expense");
  const [color, setColor] = useState(COLORS[0]);
  const [icon, setIcon] = useState("more-horizontal");
  const [isLoading, setIsLoading] = useState(false);

  const handleOpenChange = (val: boolean) => {
    setIsOpen(val);
    onOpenChange?.(val);
    if (!val) {
      setTimeout(() => {
        setName("");
        setType("expense");
        setColor(COLORS[0]);
        setIcon("more-horizontal");
      }, 300);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.from("categories").insert({
        user_id: profile?.id,
        name,
        type,
        color,
        icon,
      });

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Kategori berhasil dibuat");
      handleOpenChange(false);
    } catch (error) {
      console.error("Error creating category:", error);
      toast.error(
        error instanceof Error ? error.message : "Gagal membuat kategori. Silakan coba lagi."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const FormContent = (
    <form onSubmit={handleSubmit} className="space-y-4 px-4 md:px-0">
      <div className="space-y-2">
        <Label htmlFor="cat-name">Nama Kategori</Label>
        <Input
          id="cat-name"
          placeholder="Contoh: Jajan, Hobi, Freelance"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cat-type">Tipe</Label>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger id="cat-type">
            <SelectValue placeholder="Pilih tipe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="income">Pemasukan</SelectItem>
            <SelectItem value="expense">Pengeluaran</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Ikon</Label>
        <div className="grid grid-cols-5 gap-2 max-h-40 overflow-y-auto p-1">
          {ICONS.map((item) => {
            const IconComp = item.icon;
            return (
              <button
                key={item.name}
                type="button"
                className={cn(
                  "flex items-center justify-center p-2 rounded-md hover:bg-accent transition-colors",
                  icon === item.name
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "text-muted-foreground"
                )}
                onClick={() => setIcon(item.name)}
              >
                <IconComp className="h-5 w-5" />
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Warna</Label>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              className={cn(
                "w-8 h-8 rounded-full transition-all",
                color === c
                  ? "ring-2 ring-offset-2 ring-primary scale-110"
                  : "hover:scale-105"
              )}
              style={{ backgroundColor: c }}
              onClick={() => setColor(c)}
            />
          ))}
        </div>
      </div>

      <div className="pt-4">
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            "Simpan Kategori"
          )}
        </Button>
      </div>
    </form>
  );

  if (isDesktop) {
    return (
      <Dialog open={open ?? isOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Tambah Kategori Baru</DialogTitle>
            <DialogDescription>
              Buat kategori kustom untuk transaksi Anda.
            </DialogDescription>
          </DialogHeader>
          {FormContent}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open ?? isOpen} onOpenChange={handleOpenChange}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Tambah Kategori Baru</DrawerTitle>
          <DrawerDescription>
            Buat kategori kustom untuk transaksi Anda.
          </DrawerDescription>
        </DrawerHeader>
        <div className="pb-8">{FormContent}</div>
      </DrawerContent>
    </Drawer>
  );
}
