"use client";

import Link from "next/link";
import { useState } from "react";
import { useProfile } from "@/hooks/use-profile";
import { useAccounts, Account } from "@/hooks/use-accounts";
import { useTransactions } from "@/hooks/use-transactions";
import { formatCurrency, cn, formatAccountType } from "@/lib/utils";
import { format, isToday, isYesterday, startOfDay } from "date-fns";
import { id } from "date-fns/locale";
import type { Transaction } from "@/hooks/use-transactions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  IconPlus,
  IconWallet,
  IconArrowUpRight,
  IconArrowDownLeft,
  IconArrowsLeftRight,
} from "@tabler/icons-react";
import { AppLayout } from "@/components/app-layout";
import { AddAccountDialog } from "@/components/add-account-dialog";
import { AddTransactionDialog } from "@/components/add-transaction-dialog";
import { AccountDetailDialog } from "@/components/account-detail-dialog";
import { TransactionListItem } from "@/components/transaction-list-item";
import { getAccountIconComponent } from "@/constants/account-icons";

import useSessionGuard from "@/hooks/use-session-guard";

const getGroupedRecentTransactions = (transactions: Transaction[]) => {
  const grouped = transactions
    .filter((tx) => {
      // Filter out the receiving side of transfers to show only one entry per transfer
      if (tx.type === "transfer" && tx.related_transaction_id) {
        if (tx.description?.includes("(dari")) {
          return false;
        }
      }
      return true;
    })
    .slice(0, 10)
    .reduce<Record<string, Transaction[]>>((acc, tx) => {
      const day = startOfDay(new Date(tx.date));
      let label = format(day, "dd MMMM yyyy", { locale: id });
      if (isToday(day)) label = "Hari ini";
      else if (isYesterday(day)) label = "Kemarin";

      if (!acc[label]) acc[label] = [];
      acc[label].push(tx);
      return acc;
    }, {});

  return Object.entries(grouped);
};

export default function DashboardPage() {
  const sessionGuard = useSessionGuard();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: accounts, isLoading: accountsLoading } = useAccounts();
  const { data: transactions, isLoading: transactionsLoading } =
    useTransactions();

  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  const totalBalance =
    accounts?.reduce((acc, account) => acc + account.balance, 0) || 0;

  // Get current month's transactions
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthlyIncome =
    transactions
      ?.filter((t) => {
        const txDate = new Date(t.date);
        return (
          t.type === "income" &&
          txDate.getMonth() === currentMonth &&
          txDate.getFullYear() === currentYear
        );
      })
      .reduce((acc, t) => acc + t.amount, 0) || 0;

  const monthlyExpense =
    transactions
      ?.filter((t) => {
        const txDate = new Date(t.date);
        return (
          t.type === "expense" &&
          txDate.getMonth() === currentMonth &&
          txDate.getFullYear() === currentYear
        );
      })
      .reduce((acc, t) => acc + t.amount, 0) || 0;

  if (
    sessionGuard.isLoading ||
    profileLoading ||
    accountsLoading ||
    transactionsLoading
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const renderAccountCard = (account: Account) => {
    const AccountIcon = getAccountIconComponent(account.icon, account.type);
    return (
      <Card
        key={account.id}
        className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow bg-card cursor-pointer"
        onClick={() => setSelectedAccount(account)}
      >
        <CardContent>
          <div className="flex items-center gap-3 mb-3">
            <div
              className="h-12 w-12 rounded-full flex items-center justify-center text-white shrink-0"
              style={{
                backgroundColor: account.color || "#94a3b8",
              }}
            >
              <AccountIcon className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-foreground truncate">
                {account.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatAccountType(account.type)}
              </p>
            </div>
          </div>
          <p className="font-semibold text-lg text-foreground">
            {formatCurrency(account.balance, profile?.currency)}
          </p>
        </CardContent>
      </Card>
    );
  };

  const addAccountCard = (
    <AddAccountDialog key="add-account">
      <Card className="border border-dashed border-primary/40 bg-card text-muted-foreground hover:border-primary/80 transition-colors cursor-pointer h-full">
        <CardContent className="p-4 flex flex-col items-center justify-center gap-2">
          <IconPlus className="h-6 w-6" />
          <span>Tambah Akun Baru</span>
        </CardContent>
      </Card>
    </AddAccountDialog>
  );

  if (!sessionGuard.isAuthenticated) {
    return null;
  }

  return (
    <AppLayout>
      <div className="p-4 md:p-8 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Left Column (Balance & Accounts) */}
          <div className="md:col-span-2 space-y-5">
            {/* Overview Hero */}
            <Card className="relative overflow-hidden border-none bg-linear-to-br from-[#4663f1] via-[#3552d8] to-[#1f37a7] text-white shadow-2xl">
              <CardContent className="p-5 md:p-7 space-y-4">
                <div className="flex flex-col gap-1">
                  <p className="text-[11px] font-semibold tracking-wide text-white/80 uppercase">
                    Total Saldo
                  </p>
                  <div className="flex items-center gap-3">
                    <h2 className="text-4xl md:text-4xl font-bold tracking-tight">
                      {formatCurrency(totalBalance, profile?.currency)}
                    </h2>
                  </div>
                  <p className="text-xs opacity-80">
                    Laporan bulan ini |{" "}
                    {new Date().toLocaleDateString("id-ID", {
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>

                <div className="rounded-[24px] bg-white/15 backdrop-blur grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 py-3 shadow-inner border border-white/10">
                  <div className="flex items-center gap-2 justify-self-start">
                    <div className="h-9 w-9 rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 flex items-center justify-center shrink-0">
                      <IconArrowDownLeft className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-white/70 uppercase tracking-wide">
                        Pendapatan
                      </p>
                      <p className="text-sm font-semibold text-white leading-tight">
                        {formatCurrency(monthlyIncome, profile?.currency)}
                      </p>
                    </div>
                  </div>
                  <div className="h-10 w-px bg-white/20 self-stretch" />
                  <div className="flex items-center gap-2 justify-self-end text-right">
                    <div className="h-9 w-9 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 flex items-center justify-center shrink-0">
                      <IconArrowUpRight className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-white/70 uppercase tracking-wide">
                        Pengeluaran
                      </p>
                      <p className="text-sm font-semibold text-white leading-tight">
                        {formatCurrency(monthlyExpense, profile?.currency)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Accounts Section */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground text-lg">
                  Akun Saya
                </h3>
                <Link href="/accounts">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary h-auto p-0 hover:bg-transparent hover:text-primary/80"
                  >
                    Lihat Semua
                  </Button>
                </Link>
              </div>

              {/* Mobile carousel */}
              <div className="relative -mx-4 md:hidden">
                <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-4 px-8 no-scrollbar carousel-smooth">
                  {accounts?.map((account) => (
                    <div key={account.id} className="snap-center shrink-0 w-64">
                      {renderAccountCard(account)}
                    </div>
                  ))}
                  <div className="snap-center shrink-0 w-64">
                    {addAccountCard}
                  </div>
                </div>
                <div className="pointer-events-none absolute inset-y-0 left-0 w-8 fade-edge-left" />
                <div className="pointer-events-none absolute inset-y-0 right-0 w-8 fade-edge-right" />
              </div>

              {/* Desktop grid */}
              <div className="hidden md:grid grid-cols-2 gap-4">
                {accounts?.map((account) => renderAccountCard(account))}
                {addAccountCard}
              </div>
            </section>
          </div>

          {/* Right Column (Recent Transactions - Desktop) */}
          <div className="space-y-6">
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground text-lg">
                  Transaksi Terakhir
                </h3>
                <Link href="/transactions">
                  <Button variant="ghost" size="sm" className="text-primary">
                    Lihat Semua
                  </Button>
                </Link>
              </div>
              {transactions && transactions.length > 0 ? (
                <div className="space-y-4">
                  {getGroupedRecentTransactions(transactions)
                    .slice(0, 2)
                    .map(([label, items]) => (
                      <div key={label} className="space-y-2">
                        <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">
                          {label}
                        </p>
                        <div className="space-y-2">
                          {items.map((transaction) => (
                            <TransactionListItem
                              key={transaction.id}
                              transaction={transaction}
                              currency={profile?.currency}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-card rounded-xl border border-dashed border-border">
                  <div className="bg-muted w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <IconWallet className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Belum ada transaksi
                  </p>
                  <AddTransactionDialog>
                    <Button variant="link" className="text-primary mt-2">
                      Mulai mencatat
                    </Button>
                  </AddTransactionDialog>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>

      <AccountDetailDialog
        account={selectedAccount}
        open={!!selectedAccount}
        onOpenChange={(open) => !open && setSelectedAccount(null)}
      />
    </AppLayout>
  );
}
