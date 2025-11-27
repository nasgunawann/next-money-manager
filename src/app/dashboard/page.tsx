"use client";

import Link from "next/link";
import { useState } from "react";
import { useProfile } from "@/hooks/use-profile";
import { useAccounts, Account } from "@/hooks/use-accounts";
import { useTransactions } from "@/hooks/use-transactions";
import { formatCurrency, cn, formatAccountType } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  IconPlus,
  IconWallet,
  IconArrowUpRight,
  IconArrowDownLeft,
  IconArrowsLeftRight,
  IconCircleArrowDownRight,
  IconCircleArrowUpRight,
} from "@tabler/icons-react";
import { AppLayout } from "@/components/app-layout";
import { AddAccountDialog } from "@/components/add-account-dialog";
import { AddTransactionDialog } from "@/components/add-transaction-dialog";
import { AccountDetailDialog } from "@/components/account-detail-dialog";
import { getAccountIconComponent } from "@/constants/account-icons";

export default function DashboardPage() {
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

  if (profileLoading || accountsLoading || transactionsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const OverviewPill = ({
    label,
    amount,
    currency,
    icon: Icon,
    accentBg,
    accentText,
  }: {
    label: string;
    amount: number;
    currency?: string;
    icon: React.ComponentType<{ className?: string }>;
    accentBg: string;
    accentText: string;
  }) => (
    <div className="flex-1 flex items-center justify-between gap-3 px-4 py-3">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "rounded-full p-2 flex items-center justify-center shadow-sm",
            accentBg
          )}
        >
          <Icon className={cn("h-4 w-4", accentText)} />
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-white/75">
            {label}
          </p>
          <p className="text-lg font-semibold">
            {formatCurrency(amount, currency)}
          </p>
        </div>
      </div>
    </div>
  );

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

  return (
    <AppLayout>
      <div className="p-4 md:p-8 space-y-5">
        <div className="hidden md:flex justify-end">
          <AddTransactionDialog>
            <Button>
              <IconPlus className="mr-2 h-4 w-4" /> Tambah Transaksi
            </Button>
          </AddTransactionDialog>
        </div>

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

                <div className="bg-white/12 rounded-[26px] backdrop-blur flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-white/15 overflow-hidden shadow-inner border border-white/10">
                  <OverviewPill
                    label="Pendapatan"
                    amount={monthlyIncome}
                    currency={profile?.currency}
                    icon={IconCircleArrowDownRight}
                    accentBg="bg-emerald-100/90"
                    accentText="text-emerald-600"
                  />
                  <OverviewPill
                    label="Pengeluaran"
                    amount={monthlyExpense}
                    currency={profile?.currency}
                    icon={IconCircleArrowUpRight}
                    accentBg="bg-rose-100/90"
                    accentText="text-rose-600"
                  />
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
              <h3 className="font-semibold text-foreground mb-4 text-lg">
                Transaksi Terakhir
              </h3>
              {transactions && transactions.length > 0 ? (
                <div className="space-y-3">
                  {transactions.slice(0, 5).map((transaction) => (
                    <Card
                      key={transaction.id}
                      className="border-none shadow-sm hover:bg-accent/50 transition-colors"
                    >
                      <CardContent className="p-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div
                            className={cn(
                              "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
                              transaction.type === "income"
                                ? "bg-green-100 text-green-600"
                                : transaction.type === "expense"
                                ? "bg-red-100 text-red-600"
                                : "bg-blue-100 text-blue-600"
                            )}
                          >
                            {transaction.type === "income" ? (
                              <IconArrowDownLeft className="h-5 w-5" />
                            ) : transaction.type === "expense" ? (
                              <IconArrowUpRight className="h-5 w-5" />
                            ) : (
                              <IconArrowsLeftRight className="h-5 w-5" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-foreground text-sm truncate">
                              {transaction.description ||
                                transaction.category?.name ||
                                "Transaksi"}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {new Date(transaction.date).toLocaleDateString(
                                "id-ID",
                                { day: "numeric", month: "short" }
                              )}{" "}
                              • {transaction.account?.name}
                            </p>
                          </div>
                        </div>
                        <p
                          className={cn(
                            "font-semibold text-sm whitespace-nowrap text-right shrink-0",
                            transaction.type === "income"
                              ? "text-green-600"
                              : "text-red-600"
                          )}
                        >
                          {transaction.type === "income" ? "+" : "-"}{" "}
                          {formatCurrency(
                            transaction.amount,
                            profile?.currency
                          )}
                        </p>
                      </CardContent>
                    </Card>
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
