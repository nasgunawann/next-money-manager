"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useProfile } from "@/hooks/use-profile";
import { useAccounts } from "@/hooks/use-accounts";
import { useCategories } from "@/hooks/use-categories";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Loader2, CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function AddTransactionDialog({
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
  const { data: accounts } = useAccounts();
  const { data: categories } = useCategories();

  // Form State
  const [type, setType] = useState<"income" | "expense" | "transfer">(
    "expense"
  );
  const [amount, setAmount] = useState("");
  const [accountId, setAccountId] = useState("");
  const [targetAccountId, setTargetAccountId] = useState(""); // For transfer
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleOpenChange = (val: boolean) => {
    setIsOpen(val);
    onOpenChange?.(val);
    if (!val) {
      setTimeout(() => {
        setAmount("");
        setDescription("");
        setDate(new Date());
        setAccountId("");
        setTargetAccountId("");
        setCategoryId("");
      }, 300);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !accountId || !date) return;
    if (type === "transfer" && !targetAccountId) return;
    if (type !== "transfer" && !categoryId) return;

    setIsLoading(true);
    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error("Not authenticated");

      const numericAmount = parseFloat(amount);

      if (type === "transfer") {
        // Handle Transfer: Deduct from Source, Add to Target
        // 1. Expense from Source
        const { error: tx1Error } = await supabase.from("transactions").insert({
          user_id: user.id,
          account_id: accountId,
          amount: numericAmount,
          type: "transfer",
          date: date.toISOString(),
          description: `Transfer ke Akun Lain: ${description}`,
        });
        if (tx1Error) throw tx1Error;

        // 2. Income to Target
        const { error: tx2Error } = await supabase.from("transactions").insert({
          user_id: user.id,
          account_id: targetAccountId,
          amount: numericAmount,
          type: "transfer",
          date: date.toISOString(),
          description: `Transfer dari Akun Lain: ${description}`,
        });
        if (tx2Error) throw tx2Error;

        // Update Balances
        await supabase.rpc("increment_balance", {
          account_id: accountId,
          amount: -numericAmount,
        });
        await supabase.rpc("increment_balance", {
          account_id: targetAccountId,
          amount: numericAmount,
        });
      } else {
        // Handle Income/Expense
        const { error } = await supabase.from("transactions").insert({
          user_id: user.id,
          account_id: accountId,
          category_id: categoryId,
          amount: numericAmount,
          type,
          date: date.toISOString(),
          description,
        });

        if (error) throw error;

        // Update Balance
        const balanceChange =
          type === "income" ? numericAmount : -numericAmount;
        await supabase.rpc("increment_balance", {
          account_id: accountId,
          amount: balanceChange,
        });
      }

      await queryClient.invalidateQueries({ queryKey: ["transactions"] });
      await queryClient.invalidateQueries({ queryKey: ["accounts"] });
      handleOpenChange(false);
    } catch (error) {
      console.error("Error creating transaction:", error);
      alert("Gagal menyimpan transaksi. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCategories = categories?.filter((c) => c.type === type);

  const FormContent = (
    <form onSubmit={handleSubmit} className="space-y-4 px-4 md:px-0">
      <Tabs
        value={type}
        onValueChange={(v: string) => setType(v as any)}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="expense">Pengeluaran</TabsTrigger>
          <TabsTrigger value="income">Pemasukan</TabsTrigger>
          <TabsTrigger value="transfer">Transfer</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-2">
        <Label htmlFor="amount">Jumlah</Label>
        <div className="relative">
          <span className="absolute left-3 top-2.5 text-muted-foreground">
            Rp
          </span>
          <Input
            id="amount"
            type="number"
            placeholder="0"
            className="pl-9 text-lg font-semibold"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Akun {type === "transfer" ? "Asal" : ""}</Label>
          <Select value={accountId} onValueChange={setAccountId} required>
            <SelectTrigger>
              <SelectValue placeholder="Pilih Akun" />
            </SelectTrigger>
            <SelectContent>
              {accounts?.map((acc) => (
                <SelectItem key={acc.id} value={acc.id}>
                  {acc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {type === "transfer" ? (
          <div className="space-y-2">
            <Label>Akun Tujuan</Label>
            <Select
              value={targetAccountId}
              onValueChange={setTargetAccountId}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih Akun" />
              </SelectTrigger>
              <SelectContent>
                {accounts
                  ?.filter((a) => a.id !== accountId)
                  .map((acc) => (
                    <SelectItem key={acc.id} value={acc.id}>
                      {acc.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="space-y-2">
            <Label>Kategori</Label>
            <Select value={categoryId} onValueChange={setCategoryId} required>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Kategori" />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories?.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <div className="flex items-center gap-2">
                      <span>{cat.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label>Tanggal</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pilih tanggal</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label htmlFor="desc">Catatan (Opsional)</Label>
        <Textarea
          id="desc"
          placeholder="Contoh: Makan siang di Warteg"
          value={description}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setDescription(e.target.value)
          }
        />
      </div>

      <div className="pt-4">
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            "Simpan Transaksi"
          )}
        </Button>
      </div>
    </form>
  );

  if (isDesktop) {
    return (
      <Dialog open={open ?? isOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Tambah Transaksi</DialogTitle>
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
          <DrawerTitle>Tambah Transaksi</DrawerTitle>
        </DrawerHeader>
        <div className="pb-8">{FormContent}</div>
      </DrawerContent>
    </Drawer>
  );
}
