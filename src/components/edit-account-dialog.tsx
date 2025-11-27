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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Account } from "@/hooks/use-accounts";

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
const [type, setType] = useState("cash");
const [color, setColor] = useState(COLORS[6]);
const [isLoading, setIsLoading] = useState(false);
const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (account) {
      setName(account.name);
      setType(account.type);
      setColor(account.color || COLORS[6]);
    }
  }, [account]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account || !name) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("accounts")
        .update({
          name,
          type,
          color,
        })
        .eq("id", account.id);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["accounts"] });
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating account:", error);
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
        <Label htmlFor="edit-type">Tipe</Label>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger id="edit-type">
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
              <X className="h-4 w-4" />
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
