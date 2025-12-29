"use client";

import { useState } from "react";
import { useProfile } from "@/hooks/use-profile";
import { useAccounts, Account } from "@/hooks/use-accounts";
import { formatCurrency, formatAccountType } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconPlus, IconSearch } from "@tabler/icons-react";
import { getAccountIconComponent } from "@/constants/account-icons";
import { AppLayout } from "@/components/app-layout";
import { AddAccountDialog } from "@/components/add-account-dialog";
import { AccountDetailDialog } from "@/components/account-detail-dialog";
import { AccountsPageSkeleton } from "@/components/skeleton-loaders";
import {
  EmptyState,
  EmptyAccountsIcon,
  EmptySearchIcon,
} from "@/components/empty-state";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
      <AppLayout>
        <AccountsPageSkeleton />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-4">
        {/* Total Balance Card */}
        <Card className="bg-linear-to-br from-background to-muted/20">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Aset Saya</p>
                <p className="text-2xl md:text-3xl font-bold text-foreground">
                  {formatCurrency(totalBalance, profile?.currency)}
                </p>
              </div>
              <AddAccountDialog>
                <Button variant="ghost" size="sm" className="text-primary">
                  <IconPlus className="h-5 w-5" />
                </Button>
              </AddAccountDialog>
            </div>
          </CardContent>
        </Card>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-2.5">
          <div className="relative flex-1">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
            {filteredAccounts.map((account) => {
              const Icon = getAccountIconComponent(account.icon, account.type);
              return (
                <Card
                  key={account.id}
                  className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedAccount(account)}
                >
                  <CardContent className="p-2.5">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-7 w-7 rounded-full flex items-center justify-center text-white shrink-0"
                          style={{
                            backgroundColor: account.color || "#94a3b8",
                          }}
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-[13px] text-foreground truncate">
                            {account.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatAccountType(account.type)}
                          </p>
                        </div>
                      </div>

                      <p className="text-base font-bold text-foreground">
                        {formatCurrency(account.balance, profile?.currency)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={
              searchQuery || filterType !== "all" ? (
                <EmptySearchIcon />
              ) : (
                <EmptyAccountsIcon />
              )
            }
            title={
              searchQuery || filterType !== "all"
                ? "Tidak Ada Hasil"
                : "Belum Ada Sumber Dana"
            }
            description={
              searchQuery || filterType !== "all"
                ? "Coba ubah pencarian atau filter untuk menemukan sumber dana"
                : "Tambahkan dompet, rekening bank, atau e-wallet untuk mulai mencatat keuangan"
            }
            primaryAction={
              !searchQuery && filterType === "all"
                ? {
                    label: "Tambah Sumber Dana Pertama",
                    icon: <IconPlus className="h-4 w-4" />,
                  }
                : undefined
            }
            secondaryAction={
              searchQuery || filterType !== "all"
                ? {
                    label: "Reset Filter",
                    onClick: () => {
                      setSearchQuery("");
                      setFilterType("all");
                    },
                  }
                : undefined
            }
            variant={
              searchQuery || filterType !== "all" ? "filtered" : "default"
            }
          />
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
