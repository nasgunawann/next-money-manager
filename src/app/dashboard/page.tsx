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
  const monthName = now.toLocaleDateString("id-ID", { month: "long" });

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

  return (
    <AppLayout>
      <div className="p-4 md:p-8 space-y-6">
        <div className="hidden md:flex justify-end">
          <AddTransactionDialog>
            <Button>
              <IconPlus className="mr-2 h-4 w-4" /> Tambah Transaksi
            </Button>
          </AddTransactionDialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column (Balance & Accounts) */}
          <div className="md:col-span-2 space-y-6">
            {/* Total Balance Card */}
            <Card className="bg-primary text-primary-foreground border-none shadow-lg">
              <CardContent className="p-6 md:p-8">
                <p className="text-primary-foreground/80 text-sm font-medium mb-1">
                  Total Saldo
                </p>
                <h2 className="text-3xl md:text-4xl font-bold mb-2">
                  {formatCurrency(totalBalance, profile?.currency)}
                </h2>

                <p className="text-primary-foreground/70 text-xs font-medium mb-4">
                  Laporan bulan {monthName}
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-background/10 rounded-lg p-4 backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="bg-green-400/20 p-1 rounded">
                        <IconArrowDownLeft className="h-4 w-4 text-green-300" />
                      </div>
                      <span className="text-xs text-primary-foreground/80">
                        Pemasukan
                      </span>
                    </div>
                    <p className="font-semibold text-lg">
                      {formatCurrency(monthlyIncome, profile?.currency)}
                    </p>
                  </div>
                  <div className="bg-background/10 rounded-lg p-4 backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="bg-red-400/20 p-1 rounded">
                        <IconArrowUpRight className="h-4 w-4 text-red-300" />
                      </div>
                      <span className="text-xs text-primary-foreground/80">
                        Pengeluaran
                      </span>
                    </div>
                    <p className="font-semibold text-lg">
                      {formatCurrency(monthlyExpense, profile?.currency)}
                    </p>
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

              <div className="grid grid-cols-2 gap-3 md:gap-4">
                {accounts?.map((account) => {
                  const AccountIcon = getAccountIconComponent(
                    account.icon,
                    account.type
                  );
                  return (
                    <Card
                      key={account.id}
                      className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow bg-card cursor-pointer"
                      onClick={() => setSelectedAccount(account)}
                    >
                      <CardContent className="p-4">
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
                })}

                <AddAccountDialog>
                  <Button
                    variant="outline"
                    className="w-full border-dashed border-2 h-auto py-4 text-muted-foreground hover:text-foreground hover:border-primary/50 flex flex-col gap-2"
                  >
                    <IconPlus className="h-6 w-6" />
                    <span>Tambah Akun Baru</span>
                  </Button>
                </AddAccountDialog>
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
