"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useProfile } from "@/hooks/use-profile";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMediaQuery } from "@/hooks/use-media-query";
import { IconLoader2 } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { ACCOUNT_ICON_OPTIONS } from "@/constants/account-icons";

const COLORS = [
  "#ef4444", // Red
  "#f97316", // Orange
  "#f59e0b", // Amber
  "#84cc16", // Lime
  "#10b981", // Emerald
  "#06b6d4", // Cyan
  "#3b82f6", // Blue
  "#6366f1", // Indigo
  "#8b5cf6", // Violet
  "#d946ef", // Fuchsia
  "#ec4899", // Pink
  "#64748b", // Slate
];

const DEFAULT_ICON_OPTION = ACCOUNT_ICON_OPTIONS[0];

export function AddAccountDialog({
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
  const [type, setType] = useState(DEFAULT_ICON_OPTION.type);
  const [balance, setBalance] = useState("");
  const [color, setColor] = useState(COLORS[6]); // Default Blue
  const [iconKey, setIconKey] = useState(DEFAULT_ICON_OPTION.key);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [showUnsavedAlert, setShowUnsavedAlert] = useState(false);

  const resetForm = () => {
    setName("");
    setType(DEFAULT_ICON_OPTION.type);
    setBalance("");
    setColor(COLORS[6]);
    setIconKey(DEFAULT_ICON_OPTION.key);
    setIsDirty(false);
  };

  const closeDialog = () => {
    setIsOpen(false);
    onOpenChange?.(false);
    setShowUnsavedAlert(false);
    setTimeout(resetForm, 300);
  };

  const handleOpenChange = (val: boolean) => {
    if (val) {
      setIsOpen(true);
      onOpenChange?.(true);
      return;
    }

    if (isDirty) {
      setShowUnsavedAlert(true);
      return;
    }

    closeDialog();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !balance) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.from("accounts").insert({
        user_id: profile?.id,
        name,
        type,
        balance: parseFloat(balance),
        color,
        icon: iconKey,
      });

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["accounts"] });
      setIsDirty(false);
      closeDialog();
    } catch (error) {
      console.error("Error creating account:", error);
      setErrorMessage("Gagal membuat akun. Silakan coba lagi.");
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
          <AlertDialogDescription>{errorMessage}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={() => setErrorMessage(null)}>
            Mengerti
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  const handleDiscardChanges = () => {
    setShowUnsavedAlert(false);
    setIsDirty(false);
    resetForm();
    closeDialog();
  };

  const unsavedDialog = (
    <AlertDialog
      open={showUnsavedAlert}
      onOpenChange={(open) => {
        if (!open) setShowUnsavedAlert(false);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Batalkan pengisian?</AlertDialogTitle>
          <AlertDialogDescription>
            Formulir akun belum disimpan. Keluar sekarang akan menghapus data
            yang sudah diisi.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDiscardChanges}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Buang Perubahan
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  const FormContent = (
    <form onSubmit={handleSubmit} className="space-y-4 px-4 md:px-0">
      <div className="space-y-2">
        <Label htmlFor="name">Nama Akun</Label>
        <Input
          id="name"
          placeholder="Contoh: BCA, GoPay, Dompet"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setIsDirty(true);
          }}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="balance">Saldo Awal</Label>
        <Input
          id="balance"
          type="number"
          placeholder="0"
          value={balance}
          onChange={(e) => {
            setBalance(e.target.value);
            setIsDirty(true);
          }}
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
                  "flex flex-col items-center gap-1 rounded-md border p-2 text-xs transition-colors",
                  isActive
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border hover:bg-muted"
                )}
                onClick={() => {
                  setIconKey(option.key);
                  setType(option.type);
                  setIsDirty(true);
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
              onClick={() => {
                setColor(c);
                setIsDirty(true);
              }}
            />
          ))}
        </div>
      </div>

      <div className="pt-4">
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            "Simpan Akun"
          )}
        </Button>
      </div>
    </form>
  );

  if (isDesktop) {
    return (
      <>
        <Dialog open={open ?? isOpen} onOpenChange={handleOpenChange}>
          {children && <DialogTrigger asChild>{children}</DialogTrigger>}
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Tambah Akun Baru</DialogTitle>
              <DialogDescription>
                Buat akun baru untuk melacak keuangan Anda.
              </DialogDescription>
            </DialogHeader>
            {FormContent}
          </DialogContent>
        </Dialog>
        {errorDialog}
        {unsavedDialog}
      </>
    );
  }

  return (
    <>
      <Drawer open={open ?? isOpen} onOpenChange={handleOpenChange}>
        {children && <DrawerTrigger asChild>{children}</DrawerTrigger>}
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>Tambah Akun Baru</DrawerTitle>
            <DrawerDescription>
              Buat akun baru untuk melacak keuangan Anda.
            </DrawerDescription>
          </DrawerHeader>
          <div className="pb-8">{FormContent}</div>
        </DrawerContent>
      </Drawer>
      {errorDialog}
      {unsavedDialog}
    </>
  );
}
