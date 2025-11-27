"use client";

import { useState, useEffect } from "react";
import { useAccounts } from "@/hooks/use-accounts";
import { useCategories } from "@/hooks/use-categories";
import { useTransactions, Transaction } from "@/hooks/use-transactions";
import { AddAccountDialog } from "@/components/add-account-dialog";
import { AddCategoryDialog } from "@/components/add-category-dialog";
import { ManageCategoriesDialog } from "@/components/manage-categories-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
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
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  IconLoader2,
  IconCalendar,
  IconTrash,
  IconChevronRight,
  IconPlus,
} from "@tabler/icons-react";
import { format } from "date-fns";
import { cn, formatCurrency } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { getAccountIconComponent } from "@/constants/account-icons";
import { getCategoryIconComponent } from "@/constants/category-icons";

interface EditTransactionDialogProps {
  transaction: Transaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditTransactionDialog({
  transaction,
  open,
  onOpenChange,
}: EditTransactionDialogProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { data: accounts } = useAccounts();
  const { data: categories } = useCategories();
  const { updateTransaction, deleteTransaction } = useTransactions();

  // Form State
  const [amount, setAmount] = useState("");
  const [accountId, setAccountId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [accountDrawerOpen, setAccountDrawerOpen] = useState(false);
  const [categoryDrawerOpen, setCategoryDrawerOpen] = useState(false);

  useEffect(() => {
    if (transaction) {
      setAmount(transaction.amount.toString());
      setAccountId(transaction.account_id);
      setCategoryId(transaction.category_id || "");
      setDate(new Date(transaction.date));
      setDescription(transaction.description || "");
    }
  }, [transaction]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transaction || !amount || !accountId || !date) return;

    setIsLoading(true);
    try {
      await updateTransaction({
        id: transaction.id,
        amount: parseFloat(amount),
        account_id: accountId,
        category_id: categoryId || null,
        date: date.toISOString(),
        description,
        type: transaction.type, // Keep original type for now
      });
      toast.success("Transaksi berhasil diperbarui");
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating transaction:", error);
      toast.error("Gagal memperbarui transaksi");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!transaction) return;

    setIsDeleting(true);
    try {
      await deleteTransaction(transaction.id);
      toast.success("Transaksi berhasil dihapus");
      onOpenChange(false);
    } catch (error) {
      console.error("Error deleting transaction:", error);
      toast.error("Gagal menghapus transaksi");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const filteredCategories = categories?.filter(
    (c) => c.type === transaction?.type
  );
  const selectedAccount = accounts?.find((acc) => acc.id === accountId);
  const selectedCategory = categories?.find((cat) => cat.id === categoryId);
  const isTransfer = transaction?.type === "transfer";

  const handleSelectAccount = (id: string) => {
    setAccountId(id);
    setAccountDrawerOpen(false);
  };

  const handleSelectCategory = (id: string) => {
    setCategoryId(id);
    setCategoryDrawerOpen(false);
  };

  useEffect(() => {
    if (isTransfer && categoryDrawerOpen) {
      setCategoryDrawerOpen(false);
    }
  }, [isTransfer, categoryDrawerOpen]);

  const deleteConfirmDialog = (
    <AlertDialog
      open={showDeleteConfirm}
      onOpenChange={(open) => {
        if (!open && !isDeleting) {
          setShowDeleteConfirm(false);
        } else {
          setShowDeleteConfirm(open);
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Transaksi?</AlertDialogTitle>
          <AlertDialogDescription>
            Tindakan ini akan menghapus transaksi dan mengembalikan saldo akun
            terkait. Apakah Anda yakin ingin melanjutkan?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menghapus...
              </>
            ) : (
              "Hapus"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  const FormContent = (
    <form onSubmit={handleSubmit} className="space-y-4 px-4 md:px-0">
      <div className="space-y-2">
        <Label htmlFor="edit-amount">Jumlah</Label>
        <div className="relative">
          <span className="absolute left-3 top-2.5 text-muted-foreground">
            Rp
          </span>
          <Input
            id="edit-amount"
            type="number"
            className="pl-9 text-lg font-semibold"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Sumber dana</Label>
          <Button
            type="button"
            variant="outline"
            className="w-full justify-between h-auto py-3 px-3"
            onClick={() => setAccountDrawerOpen(true)}
          >
            {selectedAccount ? (
              <div className="flex items-center gap-3 text-left">
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
                <div>
                  <p className="font-medium">{selectedAccount.name}</p>
                  <p className="text-xs text-muted-foreground">
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

        {!isTransfer && (
          <div className="space-y-2">
            <Label>Kategori</Label>
            <Button
              type="button"
              variant="outline"
              className="w-full justify-between h-auto py-3 px-3"
              onClick={() => setCategoryDrawerOpen(true)}
            >
              {selectedCategory ? (
                <div className="flex items-center gap-3 text-left">
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
                  <div>
                    <p className="font-medium">{selectedCategory.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {selectedCategory.type === "income"
                        ? "Pemasukan"
                        : "Pengeluaran"}
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
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-desc">Catatan</Label>
        <Textarea
          id="edit-desc"
          value={description}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setDescription(e.target.value)
          }
        />
      </div>

      <div className="pt-4 flex gap-3">
        <Button
          type="button"
          variant="destructive"
          className="flex-1"
          onClick={() => setShowDeleteConfirm(true)}
          disabled={isDeleting || isLoading}
        >
          {isDeleting ? (
            <IconLoader2 className="h-4 w-4 animate-spin" />
          ) : (
            <IconTrash className="h-4 w-4 mr-2" />
          )}
          Hapus
        </Button>
        <Button
          type="submit"
          className="flex-2"
          disabled={isLoading || isDeleting}
        >
          {isLoading ? (
            <IconLoader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Simpan Perubahan"
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
            Tampilkan detail akun untuk memastikan perubahan saldo akurat.
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
              Belum ada sumber dana.
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );

  const categoryDrawer = !isTransfer ? (
    <Drawer open={categoryDrawerOpen} onOpenChange={setCategoryDrawerOpen}>
      <DrawerContent>
        <DrawerHeader className="text-left space-y-3">
          <div>
            <DrawerTitle>Pilih Kategori</DrawerTitle>
            <DrawerDescription>
              Pilih kategori {transaction?.type === "income"
                ? "pemasukan"
                : "pengeluaran"}{" "}
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
              Belum ada kategori {transaction?.type === "income"
                ? "pemasukan"
                : "pengeluaran"}
              .
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  ) : null;

  if (isDesktop) {
    return (
      <>
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Transaksi</DialogTitle>
            </DialogHeader>
            {FormContent}
          </DialogContent>
        </Dialog>
        {accountDrawer}
        {categoryDrawer}
        {deleteConfirmDialog}
      </>
    );
  }

  return (
    <>
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>Edit Transaksi</DrawerTitle>
          </DrawerHeader>
          <div className="pb-8">{FormContent}</div>
        </DrawerContent>
      </Drawer>
      {accountDrawer}
      {categoryDrawer}
      {deleteConfirmDialog}
    </>
  );
}
