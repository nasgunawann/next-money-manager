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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [type, setType] = useState("cash");
  const [balance, setBalance] = useState("");
  const [color, setColor] = useState(COLORS[6]); // Default Blue
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [showUnsavedAlert, setShowUnsavedAlert] = useState(false);

  const resetForm = () => {
    setName("");
    setType("cash");
    setBalance("");
    setColor(COLORS[6]);
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

  const handleFieldChange = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setIsDirty(true);
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
        icon: "wallet", // Default icon for now
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

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">Tipe</Label>
          <Select
            value={type}
            onValueChange={(value) => {
              setType(value);
              setIsDirty(true);
            }}
          >
            <SelectTrigger id="type">
              <SelectValue placeholder="Pilih tipe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">Tunai</SelectItem>
              <SelectItem value="bank">Bank</SelectItem>
              <SelectItem value="ewallet">E-Wallet</SelectItem>
              <SelectItem value="savings">Tabungan</SelectItem>
            </SelectContent>
          </Select>
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
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
