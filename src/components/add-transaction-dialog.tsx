"use client";

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAccounts } from "@/hooks/use-accounts";
import type { Account } from "@/hooks/use-accounts";
import type { Transaction } from "@/hooks/use-transactions";
import { useCategories } from "@/hooks/use-categories";
import { ManageCategoriesDialog } from "@/components/manage-categories-dialog";
import { AddAccountDialog } from "@/components/add-account-dialog";
import { AddCategoryDialog } from "@/components/add-category-dialog";
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
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  IconLoader2,
  IconCalendar,
  IconChevronRight,
  IconPlus,
} from "@tabler/icons-react";
import { format } from "date-fns";
import {
  cn,
  formatCurrency,
  formatNumericInput,
  sanitizeNumericInput,
  numericInputToNumber,
  generateTempId,
} from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getAccountIconComponent } from "@/constants/account-icons";
import { getCategoryIconComponent } from "@/constants/category-icons";

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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [showUnsavedAlert, setShowUnsavedAlert] = useState(false);
  const [accountDrawerOpen, setAccountDrawerOpen] = useState(false);
  const [targetAccountDrawerOpen, setTargetAccountDrawerOpen] = useState(false);
  const [categoryDrawerOpen, setCategoryDrawerOpen] = useState(false);

  useEffect(() => {
    if (type === "transfer" && categoryId) {
      setCategoryId("");
      return;
    }

    if (categoryId && type !== "transfer") {
      const cat = categories?.find((c) => c.id === categoryId);
      if (cat && cat.type !== type) {
        setCategoryId("");
      }
    }
  }, [type, categoryId, categories]);

  useEffect(() => {
    if (type === "transfer" && categoryDrawerOpen) {
      setCategoryDrawerOpen(false);
    }
  }, [type, categoryDrawerOpen]);

  const resetForm = () => {
    setAmount("");
    setDescription("");
    setDate(new Date());
    setAccountId("");
    setTargetAccountId("");
    setCategoryId("");
    setType("expense");
    setErrorMessage(null);
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

  const isTransfer = type === "transfer";
  const filteredCategories = isTransfer
    ? []
    : categories?.filter((c) => c.type === type) ?? [];
  const selectedAccount = accounts?.find((acc) => acc.id === accountId);
  const selectedTargetAccount = accounts?.find(
    (acc) => acc.id === targetAccountId
  );
  const selectedCategory = categories?.find((cat) => cat.id === categoryId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = numericInputToNumber(amount);
    if (!numericAmount || !accountId || !date) return;
    if (isTransfer && !targetAccountId) return;
    if (!isTransfer && !categoryId) return;

    setIsLoading(true);

    const previousTransactions = queryClient.getQueryData<Transaction[]>([
      "transactions",
    ]);
    const previousAccounts = queryClient.getQueryData<Account[]>(["accounts"]);
    const isoDate = date.toISOString();
    const optimisticId = generateTempId();

    const optimisticTransaction: Transaction | null = !isTransfer
      ? {
          id: optimisticId,
          account_id: accountId,
          category_id: categoryId,
          amount: numericAmount,
          type,
          date: isoDate,
          description: description || "",
          related_transaction_id: null,
          account: selectedAccount
            ? {
                name: selectedAccount.name,
                icon: selectedAccount.icon,
                color: selectedAccount.color,
              }
            : undefined,
          category:
            selectedCategory && !isTransfer
              ? {
                  name: selectedCategory.name,
                  icon: selectedCategory.icon,
                  color: selectedCategory.color,
                }
              : undefined,
        }
      : null;

    if (optimisticTransaction) {
      queryClient.setQueryData<Transaction[]>(["transactions"], (old = []) => [
        optimisticTransaction,
        ...old,
      ]);
    }

    const applyAccountDelta = (targetId: string, delta: number) => {
      queryClient.setQueryData<Account[]>(["accounts"], (old = []) =>
        old.map((account) =>
          account.id === targetId
            ? { ...account, balance: account.balance + delta }
            : account
        )
      );
    };

    if (type === "income") {
      applyAccountDelta(accountId, numericAmount);
    } else if (type === "expense") {
      applyAccountDelta(accountId, -numericAmount);
    } else if (isTransfer && targetAccountId) {
      applyAccountDelta(accountId, -numericAmount);
      applyAccountDelta(targetAccountId, numericAmount);
    }

    const resetOptimisticState = () => {
      if (optimisticTransaction) {
        if (previousTransactions !== undefined) {
          queryClient.setQueryData(["transactions"], previousTransactions);
        } else {
          queryClient.removeQueries({
            queryKey: ["transactions"],
            exact: true,
          });
        }
      }
      if (previousAccounts !== undefined) {
        queryClient.setQueryData(["accounts"], previousAccounts);
      } else {
        queryClient.removeQueries({ queryKey: ["accounts"], exact: true });
      }
    };

    try {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error("Not authenticated");

      let createdTransaction: Transaction | null = null;

      if (isTransfer && targetAccountId) {
        // Check if source account has sufficient balance
        const sourceAccount = accounts?.find((acc) => acc.id === accountId);
        if (sourceAccount && sourceAccount.balance < numericAmount) {
          throw new Error("Saldo tidak mencukupi untuk melakukan transfer");
        }

        // Create the first transaction (source - outgoing)
        const sourceDesc = description
          ? `${description} (ke ${selectedTargetAccount?.name})`
          : `Transfer ke ${selectedTargetAccount?.name}`;

        const { data: tx1, error: tx1Error } = await supabase
          .from("transactions")
          .insert({
            user_id: user.id,
            account_id: accountId,
            amount: numericAmount,
            type: "transfer",
            date: isoDate,
            description: sourceDesc,
          })
          .select()
          .single();
        if (tx1Error) throw tx1Error;

        // Create the second transaction (target - incoming) with related_transaction_id
        const targetDesc = description
          ? `${description} (dari ${selectedAccount?.name})`
          : `Transfer dari ${selectedAccount?.name}`;

        const { data: tx2, error: tx2Error } = await supabase
          .from("transactions")
          .insert({
            user_id: user.id,
            account_id: targetAccountId,
            amount: numericAmount,
            type: "transfer",
            date: isoDate,
            description: targetDesc,
            related_transaction_id: tx1.id,
          })
          .select()
          .single();
        if (tx2Error) throw tx2Error;

        // Update first transaction to link back to second
        await supabase
          .from("transactions")
          .update({ related_transaction_id: tx2.id })
          .eq("id", tx1.id);

        // Update balances
        const { error: rpcError1 } = await supabase.rpc("increment_balance", {
          account_id: accountId,
          amount: -numericAmount,
        });
        if (rpcError1) throw rpcError1;

        const { error: rpcError2 } = await supabase.rpc("increment_balance", {
          account_id: targetAccountId,
          amount: numericAmount,
        });
        if (rpcError2) throw rpcError2;
      } else {
        // Check balance for expenses
        if (type === "expense") {
          const sourceAccount = accounts?.find((acc) => acc.id === accountId);
          if (sourceAccount && sourceAccount.balance < numericAmount) {
            throw new Error("Saldo tidak mencukupi untuk pengeluaran ini");
          }
        }

        const { data: insertedTx, error } = await supabase
          .from("transactions")
          .insert({
            user_id: user.id,
            account_id: accountId,
            category_id: categoryId,
            amount: numericAmount,
            type,
            date: isoDate,
            description,
          })
          .select(
            `
            *,
            account:accounts(name, icon, color),
            category:categories(name, icon, color)
          `
          )
          .single();

        if (error || !insertedTx) throw error;
        createdTransaction = insertedTx as Transaction;

        const balanceChange =
          type === "income" ? numericAmount : -numericAmount;
        const { error: rpcError } = await supabase.rpc("increment_balance", {
          account_id: accountId,
          amount: balanceChange,
        });
        if (rpcError) throw rpcError;
      }

      if (optimisticTransaction && createdTransaction) {
        queryClient.setQueryData<Transaction[]>(["transactions"], (old = []) =>
          old.map((transaction) =>
            transaction.id === optimisticTransaction.id
              ? createdTransaction!
              : transaction
          )
        );
      }

      await queryClient.invalidateQueries({ queryKey: ["transactions"] });
      await queryClient.invalidateQueries({ queryKey: ["accounts"] });
      setIsDirty(false);
      closeDialog();
    } catch (error) {
      console.error("Error creating transaction:", error);
      const errorMsg =
        error instanceof Error
          ? error.message
          : "Gagal menyimpan transaksi. Silakan coba lagi.";
      setErrorMessage(errorMsg);
      resetOptimisticState();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAccount = (id: string) => {
    setAccountId(id);
    setIsDirty(true);
    setAccountDrawerOpen(false);
    if (type === "transfer" && id === targetAccountId) {
      setTargetAccountId("");
    }
  };

  const handleSelectTargetAccount = (id: string) => {
    setTargetAccountId(id);
    setIsDirty(true);
    setTargetAccountDrawerOpen(false);
  };

  const handleSelectCategory = (id: string) => {
    setCategoryId(id);
    setIsDirty(true);
    setCategoryDrawerOpen(false);
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
            Formulir transaksi belum disimpan. Keluar sekarang akan menghapus
            data yang sudah diisi.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Lanjutkan mengisi</AlertDialogCancel>
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
      <Tabs
        value={type}
        onValueChange={(v: string) => {
          setType(v as "income" | "expense" | "transfer");
          setIsDirty(true);
        }}
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
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder="0"
            className="pl-9 text-lg font-semibold"
            value={formatNumericInput(amount)}
            onChange={(e) => {
              setAmount(sanitizeNumericInput(e.target.value));
              setIsDirty(true);
            }}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Sumber dana {type === "transfer" ? "Asal" : ""}</Label>
          <Button
            type="button"
            variant="outline"
            className="w-full justify-between h-auto py-3 px-3"
            onClick={() => setAccountDrawerOpen(true)}
          >
            {selectedAccount ? (
              <div className="flex items-center gap-3 text-left min-w-0 flex-1">
                <div
                  className="h-10 w-10 rounded-full flex items-center justify-center text-white"
                  style={{ backgroundColor: selectedAccount.color }}
                >
                  {(() => {
                    const IconComp = getAccountIconComponent(
                      selectedAccount.icon,
                      selectedAccount.type
                    );
                    return <IconComp className="h-5 w-5" />;
                  })()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{selectedAccount.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {formatCurrency(selectedAccount.balance)}
                  </p>
                </div>
              </div>
            ) : (
              <span className="text-muted-foreground text-left">
                Pilih Sumber dana
              </span>
            )}
            <IconChevronRight className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>

        {type === "transfer" ? (
          <div className="space-y-2">
            <Label>Sumber dana Tujuan</Label>
            <Button
              type="button"
              variant="outline"
              className="w-full justify-between h-auto py-3 px-3"
              onClick={() => setTargetAccountDrawerOpen(true)}
            >
              {selectedTargetAccount ? (
                <div className="flex items-center gap-3 text-left min-w-0 flex-1">
                  <div
                    className="h-10 w-10 rounded-full flex items-center justify-center text-white"
                    style={{ backgroundColor: selectedTargetAccount.color }}
                  >
                    {(() => {
                      const IconComp = getAccountIconComponent(
                        selectedTargetAccount.icon,
                        selectedTargetAccount.type
                      );
                      return <IconComp className="h-5 w-5" />;
                    })()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">
                      {selectedTargetAccount.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {formatCurrency(selectedTargetAccount.balance)}
                    </p>
                  </div>
                </div>
              ) : (
                <span className="text-muted-foreground text-left">
                  Pilih Akun Tujuan
                </span>
              )}
              <IconChevronRight className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Label>Kategori</Label>
            <Button
              type="button"
              variant="outline"
              className="w-full justify-between h-auto py-3 px-3"
              onClick={() => setCategoryDrawerOpen(true)}
            >
              {selectedCategory ? (
                <div className="flex items-center gap-3 text-left min-w-0 flex-1">
                  <div
                    className="h-10 w-10 rounded-full flex items-center justify-center text-white"
                    style={{ backgroundColor: selectedCategory.color }}
                  >
                    {(() => {
                      const IconComp = getCategoryIconComponent(
                        selectedCategory.icon
                      );
                      return <IconComp className="h-5 w-5" />;
                    })()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">
                      {selectedCategory.name}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize truncate">
                      {type === "income" ? "Pemasukan" : "Pengeluaran"}
                    </p>
                  </div>
                </div>
              ) : (
                <span className="text-muted-foreground text-left">
                  Pilih Kategori
                </span>
              )}
              <IconChevronRight className="h-4 w-4 text-muted-foreground" />
            </Button>
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
              <IconCalendar className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pilih tanggal</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(selectedDate) => {
                setDate(selectedDate);
                if (selectedDate) {
                  setIsDirty(true);
                }
              }}
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
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
            setDescription(e.target.value);
            setIsDirty(true);
          }}
        />
      </div>

      <div className="pt-4">
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            "Simpan Transaksi"
          )}
        </Button>
      </div>
    </form>
  );

  const accountDrawer = (
    <Drawer open={accountDrawerOpen} onOpenChange={setAccountDrawerOpen}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Pilih Sumber Dana</DrawerTitle>
          <DrawerDescription>
            Tampilkan detail akun untuk memastikan transaksi dicatat pada akun
            yang benar.
          </DrawerDescription>
          <div className="flex flex-wrap gap-2 mt-4">
            <AddAccountDialog>
              <Button type="button" size="sm" className="gap-1">
                <IconPlus className="h-4 w-4" />
                Akun Baru
              </Button>
            </AddAccountDialog>
          </div>
        </DrawerHeader>
        <div className="px-4 pb-8 space-y-3 max-h-[60vh] overflow-y-auto">
          {accounts && accounts.length > 0 ? (
            accounts.map((acc) => {
              const IconComp = getAccountIconComponent(acc.icon, acc.type);
              const isActive = acc.id === accountId;
              return (
                <button
                  type="button"
                  key={acc.id}
                  className={cn(
                    "w-full rounded-2xl border p-3 flex items-center justify-between gap-3 text-left transition-colors",
                    isActive
                      ? "border-primary bg-primary/5"
                      : "hover:border-primary/50"
                  )}
                  onClick={() => handleSelectAccount(acc.id)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-12 w-12 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: acc.color }}
                    >
                      <IconComp className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{acc.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(acc.balance)}
                      </p>
                    </div>
                  </div>
                  {isActive && (
                    <span className="text-xs font-semibold text-primary">
                      Dipilih
                    </span>
                  )}
                </button>
              );
            })
          ) : (
            <div className="text-center text-muted-foreground text-sm py-8">
              Belum ada sumber dana. Tambah akun terlebih dahulu.
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );

  const targetDrawer = (
    <Drawer
      open={targetAccountDrawerOpen}
      onOpenChange={setTargetAccountDrawerOpen}
    >
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Pilih Akun Tujuan</DrawerTitle>
          <DrawerDescription>
            Untuk transfer, pilih akun tujuan berbeda dari sumber dana asal.
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-8 space-y-3 max-h-[60vh] overflow-y-auto">
          {accounts?.filter((acc) => acc.id !== accountId).length ? (
            accounts
              ?.filter((acc) => acc.id !== accountId)
              .map((acc) => {
                const IconComp = getAccountIconComponent(acc.icon, acc.type);
                const isActive = acc.id === targetAccountId;
                return (
                  <button
                    type="button"
                    key={acc.id}
                    className={cn(
                      "w-full rounded-2xl border p-3 flex items-center justify-between gap-3 text-left transition-colors",
                      isActive
                        ? "border-primary bg-primary/5"
                        : "hover:border-primary/50"
                    )}
                    onClick={() => handleSelectTargetAccount(acc.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="h-12 w-12 rounded-full flex items-center justify-center text-white"
                        style={{ backgroundColor: acc.color }}
                      >
                        <IconComp className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{acc.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(acc.balance)}
                        </p>
                      </div>
                    </div>
                    {isActive && (
                      <span className="text-xs font-semibold text-primary">
                        Dipilih
                      </span>
                    )}
                  </button>
                );
              })
          ) : (
            <div className="text-center text-muted-foreground text-sm py-8">
              Pilih sumber dana asal terlebih dahulu.
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );

  const categoryDrawer = (
    <Drawer open={categoryDrawerOpen} onOpenChange={setCategoryDrawerOpen}>
      <DrawerContent>
        <DrawerHeader className="text-left space-y-3">
          <div>
            <DrawerTitle>Pilih Kategori</DrawerTitle>
            <DrawerDescription>
              Pilih kategori {type === "income" ? "pemasukan" : "pengeluaran"}{" "}
              atau buat kategori baru.
            </DrawerDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <ManageCategoriesDialog>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="border border-border"
              >
                Kelola
              </Button>
            </ManageCategoriesDialog>
            <AddCategoryDialog>
              <Button type="button" size="sm" className="gap-1">
                <IconPlus className="h-4 w-4" />
                Kategori baru
              </Button>
            </AddCategoryDialog>
          </div>
        </DrawerHeader>
        <div className="px-4 pb-8 space-y-3 max-h-[60vh] overflow-y-auto">
          {filteredCategories && filteredCategories.length > 0 ? (
            filteredCategories.map((cat) => {
              const IconComp = getCategoryIconComponent(cat.icon);
              const isActive = cat.id === categoryId;
              return (
                <button
                  type="button"
                  key={cat.id}
                  className={cn(
                    "w-full rounded-2xl border p-3 flex items-center justify-between gap-3 text-left transition-colors",
                    isActive
                      ? "border-primary bg-primary/5"
                      : "hover:border-primary/50"
                  )}
                  onClick={() => handleSelectCategory(cat.id)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-12 w-12 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: cat.color }}
                    >
                      <IconComp className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{cat.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {cat.type === "income" ? "Pemasukan" : "Pengeluaran"}
                      </p>
                    </div>
                  </div>
                  {isActive && (
                    <span className="text-xs font-semibold text-primary">
                      Dipilih
                    </span>
                  )}
                </button>
              );
            })
          ) : (
            <div className="text-center text-muted-foreground text-sm py-8">
              Belum ada kategori{" "}
              {type === "income" ? "pemasukan" : "pengeluaran"}.
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );

  if (isDesktop) {
    return (
      <>
        <Dialog open={open ?? isOpen} onOpenChange={handleOpenChange}>
          {children && <DialogTrigger asChild>{children}</DialogTrigger>}
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Tambah Transaksi</DialogTitle>
            </DialogHeader>
            {FormContent}
          </DialogContent>
        </Dialog>
        {accountDrawer}
        {targetDrawer}
        {categoryDrawer}
        {errorDialog}
        {unsavedDialog}
      </>
    );
  }

  return (
    <>
      <Drawer
        open={open ?? isOpen}
        onOpenChange={handleOpenChange}
        modal={true}
      >
        {children && <DrawerTrigger asChild>{children}</DrawerTrigger>}
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>Tambah Transaksi</DrawerTitle>
          </DrawerHeader>
          <div className="pb-8">{FormContent}</div>
        </DrawerContent>
      </Drawer>
      {accountDrawer}
      {targetDrawer}
      {categoryDrawer}
      {errorDialog}
      {unsavedDialog}
    </>
  );
}
