"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useProfile } from "@/hooks/use-profile";
import { useTransactions } from "@/hooks/use-transactions";
import { formatCurrency, cn } from "@/lib/utils";
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
  DrawerClose,
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
import { Card, CardContent } from "@/components/ui/card";
import {
  Wallet,
  Edit,
  Trash2,
  X,
  ArrowUpRight,
  ArrowDownLeft,
  Loader2,
} from "lucide-react";
import type { Account } from "@/hooks/use-accounts";
import { EditAccountDialog } from "@/components/edit-account-dialog";

interface AccountDetailDialogProps {
  account: Account | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AccountDetailDialog({
  account,
  open,
  onOpenChange,
}: AccountDetailDialogProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { data: profile } = useProfile();
  const { data: transactions } = useTransactions();
  const queryClient = useQueryClient();

  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!account) return null;

  // Get transactions for this account
  const accountTransactions =
    transactions?.filter((t) => t.account_id === account.id).slice(0, 10) || [];

  const handleDelete = async () => {
    if (!account) return;

    setIsDeleting(true);
    try {
      // Check if there are transactions for this account
      const { count } = await supabase
        .from("transactions")
        .select("*", { count: "exact", head: true })
        .eq("account_id", account.id);

      if (count && count > 0) {
        setErrorMessage(
          "Tidak dapat menghapus sumber dana yang memiliki transaksi. Hapus transaksi terlebih dahulu."
        );
        setShowDeleteAlert(false);
        setIsDeleting(false);
        return;
      }

      // Delete the account
      const { error } = await supabase
        .from("accounts")
        .delete()
        .eq("id", account.id);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["accounts"] });
      onOpenChange(false); // Close the detail dialog
    } catch (error) {
      console.error("Error deleting account:", error);
      setErrorMessage("Gagal menghapus sumber dana");
    } finally {
      setIsDeleting(false);
      setShowDeleteAlert(false);
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

  const Content = (
    <div className="space-y-6">
      {/* Account Info */}
      <div className="flex items-center gap-4">
        <div
          className="h-16 w-16 rounded-full flex items-center justify-center text-white shrink-0"
          style={{ backgroundColor: account.color || "#94a3b8" }}
        >
          <Wallet className="h-8 w-8" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{account.name}</h3>
          <p className="text-sm text-muted-foreground capitalize">
            {account.type === "ewallet"
              ? "E-Wallet"
              : account.type === "cash"
              ? "Tunai"
              : account.type === "bank"
              ? "Bank"
              : "Tabungan"}
          </p>
          <p className="text-2xl font-bold mt-2">
            {formatCurrency(account.balance, profile?.currency)}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setShowEditDialog(true)}
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
        <Button
          variant="outline"
          className="w-full text-destructive hover:text-destructive"
          onClick={() => setShowDeleteAlert(true)}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Hapus
        </Button>
      </div>

      {/* Recent Transactions */}
      <div>
        <h4 className="font-semibold mb-3">Transaksi Terakhir</h4>
        {accountTransactions.length > 0 ? (
          <div className="space-y-2">
            {accountTransactions.map((transaction) => (
              <Card
                key={transaction.id}
                className="border-none shadow-sm hover:bg-accent/50 transition-colors"
              >
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center",
                        transaction.type === "income"
                          ? "bg-green-100 text-green-600"
                          : transaction.type === "expense"
                          ? "bg-red-100 text-red-600"
                          : "bg-blue-100 text-blue-600"
                      )}
                    >
                      {transaction.type === "income" ? (
                        <ArrowDownLeft className="h-4 w-4" />
                      ) : transaction.type === "expense" ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <Wallet className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {transaction.description ||
                          transaction.category?.name ||
                          "Transaksi"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(transaction.date).toLocaleDateString(
                          "id-ID",
                          { day: "numeric", month: "short", year: "numeric" }
                        )}
                      </p>
                    </div>
                  </div>
                  <p
                    className={cn(
                      "font-semibold text-sm",
                      transaction.type === "income"
                        ? "text-green-600"
                        : "text-red-600"
                    )}
                  >
                    {transaction.type === "income" ? "+" : "-"}{" "}
                    {formatCurrency(transaction.amount, profile?.currency)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground text-sm">
            <Wallet className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Belum ada transaksi</p>
          </div>
        )}
      </div>
    </div>
  );

  if (isDesktop) {
    return (
      <>
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detail Sumber Dana</DialogTitle>
            </DialogHeader>
            {Content}
          </DialogContent>
        </Dialog>

        <EditAccountDialog
          account={account}
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
        />

        <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus Sumber Dana?</AlertDialogTitle>
              <AlertDialogDescription>
                Apakah Anda yakin ingin menghapus &quot;{account.name}&quot;?
                Tindakan ini tidak dapat dibatalkan. Sumber dana yang memiliki
                transaksi tidak dapat dihapus.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
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
        {errorDialog}
      </>
    );
  }

  return (
    <>
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader className="text-left relative">
            <DrawerTitle>Detail Sumber Dana</DrawerTitle>
            <DrawerClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DrawerClose>
          </DrawerHeader>
          <div className="pb-8 px-4">{Content}</div>
        </DrawerContent>
      </Drawer>

      <EditAccountDialog
        account={account}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Sumber Dana?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus &quot;{account.name}&quot;?
              Tindakan ini tidak dapat dibatalkan. Sumber dana yang memiliki
              transaksi tidak dapat dihapus.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destruct ive-foreground hover:bg-destructive/90"
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
      {errorDialog}
    </>
  );
}
