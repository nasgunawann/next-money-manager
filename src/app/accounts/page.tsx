"use client";

import { useState } from "react";
import { useProfile } from "@/hooks/use-profile";
import { useAccounts, Account } from "@/hooks/use-accounts";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Wallet,
  CreditCard,
  Smartphone,
  Banknote,
  PiggyBank,
  Search,
} from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { AddAccountDialog } from "@/components/add-account-dialog";
import { AccountDetailDialog } from "@/components/account-detail-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LucideIcon } from "lucide-react";

const ACCOUNT_ICONS: Record<string, LucideIcon> = {
  cash: Banknote,
  bank: CreditCard,
  ewallet: Smartphone,
  savings: PiggyBank,
};

export default function AccountsPage() {
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: accounts, isLoading: accountsLoading } = useAccounts();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  const totalBalance =
    accounts?.reduce((acc, account) => acc + account.balance, 0) || 0;

  // Filter accounts
  const filteredAccounts = accounts?.filter((account) => {
    const matchesSearch = account.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || account.type === filterType;
    return matchesSearch && matchesType;
  });

  if (profileLoading || accountsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="p-4 md:p-8 space-y-4">
        {/* Total Balance Card */}
        <Card className="bg-linear-to-br from-background to-muted/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Aset Saya</p>
                <p className="text-2xl md:text-3xl font-bold text-foreground">
                  {formatCurrency(totalBalance, profile?.currency)}
                </p>
              </div>
              <AddAccountDialog>
                <Button variant="ghost" size="sm" className="text-primary">
                  <Plus className="h-5 w-5" />
                </Button>
              </AddAccountDialog>
            </div>
          </CardContent>
        </Card>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari sumber dana..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua</SelectItem>
              <SelectItem value="cash">Tunai</SelectItem>
              <SelectItem value="bank">Bank</SelectItem>
              <SelectItem value="ewallet">E-Wallet</SelectItem>
              <SelectItem value="savings">Tabungan</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Accounts Grid */}
        {filteredAccounts && filteredAccounts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredAccounts.map((account) => {
              const Icon = ACCOUNT_ICONS[account.type] || Wallet;
              return (
                <Card
                  key={account.id}
                  className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedAccount(account)}
                >
                  <CardContent className="p-3">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-8 w-8 rounded-full flex items-center justify-center text-white shrink-0"
                          style={{
                            backgroundColor: account.color || "#94a3b8",
                          }}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm text-foreground truncate">
                            {account.name}
                          </p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {account.type === "ewallet"
                              ? "E-Wallet"
                              : account.type === "cash"
                              ? "Tunai"
                              : account.type === "bank"
                              ? "Bank"
                              : "Tabungan"}
                          </p>
                        </div>
                      </div>

                      <p className="text-lg font-bold text-foreground">
                        {formatCurrency(account.balance, profile?.currency)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-card rounded-xl border border-dashed border-border">
            <div className="bg-muted w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <Wallet className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-sm mb-2">
              {searchQuery || filterType !== "all"
                ? "Tidak ada sumber dana yang cocok"
                : "Belum ada sumber dana"}
            </p>
            {!searchQuery && filterType === "all" && (
              <AddAccountDialog>
                <Button variant="link" className="text-primary">
                  Tambah sumber dana pertama
                </Button>
              </AddAccountDialog>
            )}
          </div>
        )}
      </div>

      <AccountDetailDialog
        account={selectedAccount}
        open={!!selectedAccount}
        onOpenChange={(open) => !open && setSelectedAccount(null)}
      />
    </AppLayout>
  );
}
