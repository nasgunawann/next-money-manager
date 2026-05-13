"use client";

import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription as AlertDialogDesc,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useMediaQuery } from "@/hooks/use-media-query";
import { IconLoader2, IconX } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import type { Account } from "@/hooks/use-accounts";
import { ACCOUNT_ICON_OPTIONS } from "@/constants/account-icons";

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

const DEFAULT_ICON_OPTION = ACCOUNT_ICON_OPTIONS[0];

interface EditAccountDialogProps {
  account: Account | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditAccountDialog({
  account,
  open,
  onOpenChange,
}: EditAccountDialogProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [type, setType] = useState(DEFAULT_ICON_OPTION.type);
  const [color, setColor] = useState(COLORS[6]);
  const [iconKey, setIconKey] = useState(DEFAULT_ICON_OPTION.key);
  const [isMainBalance, setIsMainBalance] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (account) {
      setName(account.name);
      setType(account.type);
      setColor(account.color || COLORS[6]);
      const availableKeys = ACCOUNT_ICON_OPTIONS.map((option) => option.key);
      const preferredKey = account.icon && availableKeys.includes(account.icon)
        ? account.icon
        : account.type;
      setIconKey(preferredKey || DEFAULT_ICON_OPTION.key);
      setIsMainBalance(account.is_main_balance ?? true);
    }
  }, [account]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account || !name) return;
 
    setIsLoading(true);
    
    // Simpan data lama untuk rollback jika gagal
    const previousAccounts = queryClient.getQueryData<Account[]>(["accounts"]);
    
    // Update cache secara optimis
    queryClient.setQueryData<Account[]>(["accounts"], (old) => {
      if (!old) return old;
      return old.map((acc) => 
        acc.id === account.id 
          ? { 
              ...acc, 
              name, 
              type, 
              color, 
              icon: iconKey, 
              is_main_balance: isMainBalance 
            } 
          : acc
      );
    });
 
    try {
      const { error } = await supabase
        .from("accounts")
        .update({
          name,
          type,
          color,
          icon: iconKey,
          is_main_balance: isMainBalance,
        })
        .eq("id", account.id);
 
      if (error) throw error;
 
      await queryClient.invalidateQueries({ queryKey: ["accounts"] });
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating account:", error);
      // Rollback jika terjadi error
      if (previousAccounts) {
        queryClient.setQueryData(["accounts"], previousAccounts);
      }
      setErrorMessage("Gagal memperbarui akun. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const errorDialog = (
    <AlertDialog
      open={!!errorMessage}
      onOpenChange={(open) => {
        if (!open) setErrorMessage(null);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Terjadi Kesalahan</AlertDialogTitle>
          <AlertDialogDesc>{errorMessage}</AlertDialogDesc>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={() => setErrorMessage(null)}>
            Mengerti
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  const FormContent = (
    <form onSubmit={handleSubmit} className="space-y-4 px-4 md:px-0">
      <div className="space-y-2">
        <Label htmlFor="edit-name">Nama Sumber Dana</Label>
        <Input
          id="edit-name"
          placeholder="Contoh: BCA, GoPay, Dompet"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Ikon &amp; Tipe</Label>
        <div className="grid grid-cols-4 gap-2">
          {ACCOUNT_ICON_OPTIONS.map((option) => {
            const IconComponent = option.icon;
            const isActive = iconKey === option.key;
            return (
              <button
                key={option.key}
                type="button"
                className={cn(
                  "flex flex-col items-center gap-1 rounded-md border p-2 text-xs transition-colors text-center",
                  isActive
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border hover:bg-muted"
                )}
                onClick={() => {
                  setIconKey(option.key);
                  setType(option.type);
                }}
              >
                <IconComponent className="h-5 w-5" />
                <span>{option.label}</span>
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

      <div className="flex items-center space-x-2 py-2">
        <Checkbox
          id="edit-isMainBalance"
          checked={isMainBalance}
          onCheckedChange={(checked) => setIsMainBalance(checked === true)}
        />
        <div className="grid gap-1.5 leading-none">
          <Label
            htmlFor="edit-isMainBalance"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            Sertakan dalam Saldo Utama
          </Label>
          <p className="text-[11px] text-muted-foreground">
            Jika aktif, saldo ini akan dihitung dalam ringkasan dashboard.
          </p>
        </div>
      </div>

      <div className="pt-4">
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
              Memperbarui...
            </>
          ) : (
            "Simpan Perubahan"
          )}
        </Button>
      </div>
    </form>
  );

  if (isDesktop) {
    return (
      <>
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Sumber Dana</DialogTitle>
              <DialogDescription>
                Perbarui informasi sumber dana Anda.
              </DialogDescription>
            </DialogHeader>
            {FormContent}
          </DialogContent>
        </Dialog>
        {errorDialog}
      </>
    );
  }

  return (
    <>
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader className="text-left relative">
            <DrawerTitle>Edit Sumber Dana</DrawerTitle>
            <DrawerDescription>
              Perbarui informasi sumber dana Anda.
            </DrawerDescription>
          <DrawerClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
            <IconX className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DrawerClose>
          </DrawerHeader>
          <div className="pb-8">{FormContent}</div>
        </DrawerContent>
      </Drawer>
      {errorDialog}
    </>
  );
}
