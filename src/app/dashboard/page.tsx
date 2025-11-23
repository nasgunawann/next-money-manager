"use client";

import { useProfile } from "@/hooks/use-profile";
import { useAccounts } from "@/hooks/use-accounts";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Wallet, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { AppLayout } from "@/components/app-layout";
import { AddAccountDialog } from "@/components/add-account-dialog";

export default function DashboardPage() {
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: accounts, isLoading: accountsLoading } = useAccounts();

  const totalBalance =
    accounts?.reduce((acc, account) => acc + account.balance, 0) || 0;

  if (profileLoading || accountsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="p-4 md:p-8 space-y-6">
        {/* Header (Mobile Only - Welcome Message) */}
        <div className="md:hidden mb-4">
          <h1 className="text-xl font-bold text-foreground">
            Halo, {profile?.full_name?.split(" ")[0]}
          </h1>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">
              Ringkasan keuangan Anda hari ini.
            </p>
          </div>
          <AddAccountDialog>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Tambah Transaksi
            </Button>
          </AddAccountDialog>
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
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  {formatCurrency(totalBalance, profile?.currency)}
                </h2>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-background/10 rounded-lg p-4 backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="bg-green-400/20 p-1 rounded">
                        <ArrowDownLeft className="h-4 w-4 text-green-300" />
                      </div>
                      <span className="text-xs text-primary-foreground/80">
                        Pemasukan
                      </span>
                    </div>
                    <p className="font-semibold text-lg">Rp 0</p>
                  </div>
                  <div className="bg-background/10 rounded-lg p-4 backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="bg-red-400/20 p-1 rounded">
                        <ArrowUpRight className="h-4 w-4 text-red-300" />
                      </div>
                      <span className="text-xs text-primary-foreground/80">
                        Pengeluaran
                      </span>
                    </div>
                    <p className="font-semibold text-lg">Rp 0</p>
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
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary h-auto p-0 hover:bg-transparent hover:text-primary/80"
                >
                  Lihat Semua
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {accounts?.map((account) => (
                  <Card
                    key={account.id}
                    className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow bg-card"
                  >
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="h-10 w-10 rounded-full flex items-center justify-center text-white"
                          style={{
                            backgroundColor: account.color || "#94a3b8",
                          }}
                        >
                          <Wallet className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {account.name}
                          </p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {account.type}
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold text-foreground">
                        {formatCurrency(account.balance, profile?.currency)}
                      </p>
                    </CardContent>
                  </Card>
                ))}

                <AddAccountDialog>
                  <Button
                    variant="outline"
                    className="w-full border-dashed border-2 h-auto py-4 text-muted-foreground hover:text-foreground hover:border-primary/50 flex flex-col gap-2"
                  >
                    <Plus className="h-6 w-6" />
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
              <div className="text-center py-12 bg-card rounded-xl border border-dashed border-border">
                <div className="bg-muted w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Wallet className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-sm">
                  Belum ada transaksi
                </p>
                <Button variant="link" className="text-primary mt-2">
                  Mulai mencatat
                </Button>
              </div>
            </section>
          </div>
        </div>

        {/* Floating Action Button (Mobile Only) */}
        <div className="fixed bottom-20 right-6 md:hidden z-40">
          <AddAccountDialog>
            <Button size="icon" className="h-14 w-14 rounded-full shadow-xl">
              <Plus className="h-6 w-6" />
            </Button>
          </AddAccountDialog>
        </div>
      </div>
    </AppLayout>
  );
}
