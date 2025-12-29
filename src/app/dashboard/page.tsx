"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import useSessionGuard from "@/hooks/use-session-guard";
import { useProfile } from "@/hooks/use-profile";
import { useAccounts, Account } from "@/hooks/use-accounts";
import { useTransactions } from "@/hooks/use-transactions";
import { formatCurrency, formatAccountType } from "@/lib/utils";
import { format, isToday, isYesterday, startOfDay } from "date-fns";
import { id } from "date-fns/locale";
import type { Transaction } from "@/hooks/use-transactions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  IconPlus,
  IconArrowUpRight,
  IconArrowDownLeft,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";
import { AppLayout } from "@/components/app-layout";
import { AddAccountDialog } from "@/components/add-account-dialog";
import { AccountDetailDialog } from "@/components/account-detail-dialog";
import { TransactionListItem } from "@/components/transaction-list-item";
import { DashboardSkeleton } from "@/components/skeleton-loaders";
import { getAccountIconComponent } from "@/constants/account-icons";
import { EmptyState, EmptyTransactionsIcon } from "@/components/empty-state";
import { ExpenseDonutChart } from "@/components/expense-donut-chart";

function withAlpha(color: string, alpha: number) {
  if (!color) return `rgba(148, 163, 184, ${alpha})`; // slate-400 fallback
  if (color.startsWith("#")) {
    const hex = color.slice(1);
    const full =
      hex.length === 3
        ? hex
            .split("")
            .map((c) => c + c)
            .join("")
        : hex;
    const int = parseInt(full, 16);
    const r = (int >> 16) & 255;
    const g = (int >> 8) & 255;
    const b = int & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return color;
}

function getGroupedRecentTransactions(transactions: Transaction[]) {
  const grouped = transactions.reduce(
    (acc: Record<string, Transaction[]>, tx) => {
      const day = startOfDay(new Date(tx.date));
      let label = format(day, "dd MMMM yyyy", { locale: id });
      if (isToday(day)) label = "Hari ini";
      else if (isYesterday(day)) label = "Kemarin";

      if (!acc[label]) acc[label] = [];
      acc[label].push(tx);
      return acc;
    },
    {}
  );

  return Object.entries(grouped);
}

export default function DashboardPage() {
  const sessionGuard = useSessionGuard();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: accounts, isLoading: accountsLoading } = useAccounts();
  const { data: transactions, isLoading: transactionsLoading } =
    useTransactions();

  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

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

  // Calculate expense by category for donut chart
  const expenseByCategory = (() => {
    const monthTx =
      transactions?.filter((t) => {
        const txDate = new Date(t.date);
        return (
          t.type === "expense" &&
          txDate.getMonth() === currentMonth &&
          txDate.getFullYear() === currentYear
        );
      }) || [];

    const map = new Map<
      string,
      { name: string; value: number; color: string; icon?: string }
    >();

    monthTx.forEach((t) => {
      const name = t.category?.name || "Lainnya";
      const color = t.category?.color || "#94a3b8";
      const icon = t.category?.icon || "more-horizontal";
      const existing = map.get(name);
      if (existing) {
        existing.value += t.amount;
      } else {
        map.set(name, { name, value: t.amount, color, icon });
      }
    });

    return Array.from(map.values()).sort((a, b) => b.value - a.value);
  })();

  const scrollCarousel = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const scrollAmount = 280; // card width + gap
      carouselRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (
    sessionGuard.isLoading ||
    profileLoading ||
    accountsLoading ||
    transactionsLoading
  ) {
    return (
      <AppLayout>
        <DashboardSkeleton />
      </AppLayout>
    );
  }

  const renderAccountCard = (account: Account) => {
    const AccountIcon = getAccountIconComponent(account.icon, account.type);
    return (
      <Card
        key={account.id}
        className="relative overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer"
        style={{ backgroundColor: withAlpha(account.color || "#94a3b8", 0.12) }}
        onClick={() => setSelectedAccount(account)}
      >
        <CardContent className="px-3.5 py-2.5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <div
                className="h-8 w-8 rounded-full flex items-center justify-center text-white shrink-0"
                style={{ backgroundColor: account.color || "#94a3b8" }}
              >
                <AccountIcon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-[13px] text-foreground truncate">
                  {account.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatAccountType(account.type)}
                </p>
              </div>
            </div>
            <p className="font-semibold text-base text-foreground shrink-0 text-right">
              {formatCurrency(account.balance, profile?.currency)}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  };

  const addAccountCard = (
    <AddAccountDialog key="add-account">
      <Card className="border border-dashed border-primary/40 bg-card text-muted-foreground hover:border-primary/80 transition-colors cursor-pointer">
        <CardContent className="px-3.5 py-2.5">
          <div className="flex items-center justify-center gap-3 h-8">
            <IconPlus className="h-4 w-4" />
            <span className="text-xs font-medium">Tambah Akun Baru</span>
          </div>
        </CardContent>
      </Card>
    </AddAccountDialog>
  );

  if (!sessionGuard.isAuthenticated) {
    return null;
  }

  return (
    <AppLayout>
      <div className="p-4 md:p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Left Column (Balance & Recent Transactions) */}
          <div className="md:col-span-2 space-y-4">
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

                <div className="rounded-3xl bg-white/15 backdrop-blur grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 py-3 shadow-inner border border-white/10">
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

            {/* Mobile-only Accounts Section */}
            <section className="md:hidden">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground text-base">
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
              <div className="relative -mx-4">
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
            </section>

            {/* Recent Transactions */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground text-base">
                  Transaksi Terakhir
                </h3>
                <Link href="/transactions">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary h-auto p-0 hover:bg-transparent hover:text-primary/80"
                  >
                    Lihat Semua
                  </Button>
                </Link>
              </div>
              {transactions && transactions.length > 0 ? (
                <div className="space-y-3">
                  {getGroupedRecentTransactions(transactions)
                    .slice(0, 2)
                    .map(([label, items]) => (
                      <div key={label} className="space-y-2">
                        <p className="text-[11px] font-semibold uppercase text-muted-foreground tracking-wide">
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
                <EmptyState
                  icon={<EmptyTransactionsIcon />}
                  title="Mulai Mencatat Keuangan Anda"
                  description="Catat transaksi pertama untuk melihat ringkasan dan analisis pengeluaran Anda"
                  primaryAction={{
                    label: "Tambah Transaksi Pertama",
                    icon: <IconPlus className="h-4 w-4" />,
                  }}
                  hint="Atau tekan tombol + di navigasi bawah"
                />
              )}
            </section>
          </div>

          {/* Right Column (Accounts Carousel & Donut Chart - Desktop Only) */}
          <div className="hidden md:block space-y-4">
            {/* Accounts Carousel */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground text-base">
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

              <div className="relative">
                {/* Navigation Buttons */}
                <button
                  onClick={() => scrollCarousel("left")}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-background/80 backdrop-blur rounded-full shadow-md hover:bg-background transition-colors"
                  aria-label="Previous account"
                >
                  <IconChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scrollCarousel("right")}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-background/80 backdrop-blur rounded-full shadow-md hover:bg-background transition-colors"
                  aria-label="Next account"
                >
                  <IconChevronRight className="w-4 h-4" />
                </button>

                {/* Carousel */}
                <div
                  ref={carouselRef}
                  className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 no-scrollbar carousel-smooth px-8"
                >
                  {accounts?.map((account) => (
                    <div
                      key={account.id}
                      className="snap-center shrink-0 w-full"
                    >
                      {renderAccountCard(account)}
                    </div>
                  ))}
                  <div className="snap-center shrink-0 w-full">
                    {addAccountCard}
                  </div>
                </div>
              </div>
            </section>

            {/* Expense Donut Chart */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground text-base">
                  Pengeluaran Bulan Ini
                </h3>
                <Link href="/reports">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary h-auto p-0 hover:bg-transparent hover:text-primary/80"
                  >
                    Lihat Detail
                  </Button>
                </Link>
              </div>
              <Card className="border-none shadow-sm">
                <CardContent className="p-4">
                  {expenseByCategory.length > 0 ? (
                    <ExpenseDonutChart
                      data={expenseByCategory.slice(0, 5)}
                      totalExpense={monthlyExpense}
                      currency={profile?.currency}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
                      Belum ada pengeluaran bulan ini
                    </div>
                  )}
                </CardContent>
              </Card>
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
