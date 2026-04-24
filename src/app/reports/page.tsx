"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { AppLayout } from "@/components/layout/app-layout";
import { useTransactions, type Transaction } from "@/hooks/use-transactions";
import { useProfile } from "@/hooks/use-profile";
import { useAccounts } from "@/hooks/use-accounts";
import { formatCurrency, getCurrencySymbol } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { IconChevronLeft, IconChevronRight, IconFileDownload } from "@tabler/icons-react";
import { getCategoryIconComponent } from "@/constants/category-icons";
import { ReportsSkeleton } from "@/components/shared/skeleton-loaders";
import { EmptyState, EmptyReportsIcon } from "@/components/shared/empty-state";
import { ExpenseDonutChart } from "@/components/data-display/expense-donut-chart";
import { MonthlyReportPDF } from "@/components/reports/monthly-report-pdf";

const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  { ssr: false }
);

export default function ReportsPage() {
  const { data: profile } = useProfile();
  const { data: transactions, isLoading } = useTransactions();

  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().getMonth().toString()
  );
  const [selectedYear, setSelectedYear] = useState<string>(
    new Date().getFullYear().toString()
  );
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  // Compute month/year based on offset (used only for navigation)
  const adjustMonth = (offset: number) => {
    let month = parseInt(selectedMonth) + offset;
    let year = parseInt(selectedYear);
    if (month < 0) {
      month = 11;
      year -= 1;
    } else if (month > 11) {
      month = 0;
      year += 1;
    }
    return { month, year };
  };

  const handlePrevMonth = () => {
    const { month, year } = adjustMonth(-1);
    setSelectedMonth(month.toString());
    setSelectedYear(year.toString());
  };

  const handleNextMonth = () => {
    const { month, year } = adjustMonth(1);
    setSelectedMonth(month.toString());
    setSelectedYear(year.toString());
  };

  const monthTransactions = useMemo<Transaction[]>(() => {
    const month = parseInt(selectedMonth);
    const year = parseInt(selectedYear);
    return (
      transactions?.filter((t) => {
        const d = new Date(t.date);
        return d.getMonth() === month && d.getFullYear() === year;
      }) || []
    );
  }, [transactions, selectedMonth, selectedYear]);

  const expenseByCategory = useMemo(() => {
    const map = new Map<
      string,
      { name: string; value: number; color: string; icon?: string }
    >();
    monthTransactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
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
  }, [monthTransactions]);

  const { totalIncome, totalExpense, totalTransfer } = useMemo(() => {
    return monthTransactions.reduce(
      (acc, t) => {
        if (t.type === "income") acc.totalIncome += t.amount;
        else if (t.type === "expense") acc.totalExpense += t.amount;
        else if (t.type === "transfer") acc.totalTransfer += t.amount;
        return acc;
      },
      { totalIncome: 0, totalExpense: 0, totalTransfer: 0 }
    );
  }, [monthTransactions]);

  const { data: accounts } = useAccounts();

  const currentTotalBalance = useMemo(() => {
    return accounts?.reduce((sum, acc) => sum + acc.balance, 0) || 0;
  }, [accounts]);

  const initialBalance = useMemo(() => {
    return (
      transactions?.reduce((balance, t) => {
        const tDate = new Date(t.date);
        const selMonth = parseInt(selectedMonth);
        const selYear = parseInt(selectedYear);
        const startOfSelectedMonth = new Date(selYear, selMonth, 1);

        if (tDate >= startOfSelectedMonth) {
          if (t.type === "income") return balance - t.amount;
          if (t.type === "expense") return balance + t.amount;
        }
        return balance;
      }, currentTotalBalance) || 0
    );
  }, [transactions, selectedMonth, selectedYear, currentTotalBalance]);

  const reportPeriodLabel = `${months[parseInt(selectedMonth)]} ${selectedYear}`;

  // Find earliest transaction month for prev button boundary
  const earliestTransaction = useMemo(() => {
    return transactions?.reduce((earliest, t) => {
      const tDate = new Date(t.date);
      return !earliest || tDate < earliest ? tDate : earliest;
    }, null as Date | null);
  }, [transactions]);

  const earliestMonth = earliestTransaction?.getMonth();
  const earliestYear = earliestTransaction?.getFullYear();

  // Disable prev when going back would go before earliest transaction
  const isPrevDisabled =
    !earliestTransaction ||
    (earliestYear !== undefined &&
      earliestMonth !== undefined &&
      (parseInt(selectedYear) < earliestYear ||
        (parseInt(selectedYear) === earliestYear &&
          parseInt(selectedMonth) <= earliestMonth)));

  // Disable "next" navigation when advancing would go beyond the current month
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const isNextDisabled =
    parseInt(selectedYear) > currentYear ||
    (parseInt(selectedYear) === currentYear &&
      parseInt(selectedMonth) >= currentMonth);

  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-2xl mx-auto">
        {/* Month Navigation */}
        <div className="flex items-center justify-center gap-6 py-4 mb-6">
          <button
            onClick={handlePrevMonth}
            disabled={isPrevDisabled}
            aria-disabled={isPrevDisabled}
            className={`p-3 rounded-full transition-colors ${isPrevDisabled
              ? "bg-muted/50 cursor-not-allowed hover:bg-muted/50"
              : "bg-muted hover:bg-muted/80"
              }`}
          >
            <IconChevronLeft
              className={`w-5 h-5 ${isPrevDisabled ? "opacity-50" : ""}`}
            />
          </button>
          <div className="text-center min-w-[200px]">
            <h2 className="text-4xl font-bold text-foreground">
              {months[parseInt(selectedMonth)]}
            </h2>
            <p className="text-orange-500 font-medium text-lg">
              {selectedYear}
            </p>
          </div>
          <button
            onClick={handleNextMonth}
            disabled={isNextDisabled}
            aria-disabled={isNextDisabled}
            className={`p-3 rounded-full transition-colors ${isNextDisabled
              ? "bg-muted/50 cursor-not-allowed hover:bg-muted/50"
              : "bg-muted hover:bg-muted/80"
              }`}
          >
            <IconChevronRight
              className={`w-5 h-5 ${isNextDisabled ? "opacity-50" : ""}`}
            />
          </button>
        </div>

        {/* Action Bar */}
        {!isLoading && monthTransactions.length > 0 && isClient && (
          <div className="flex justify-center mb-6">
            <PDFDownloadLink
              document={
                <MonthlyReportPDF
                  transactions={monthTransactions}
                  profileName={profile?.full_name || "User"}
                  period={reportPeriodLabel}
                  currency={getCurrencySymbol(profile?.currency)}
                  stats={{
                    totalIncome,
                    totalExpense,
                    totalTransfer,
                    balance: totalIncome - totalExpense,
                    initialBalance,
                  }}
                  categories={expenseByCategory}
                />
              }
              fileName={`Kaslo-Laporan_${reportPeriodLabel.replace(" ", "_")}.pdf`}
            >
              {({ loading }) => (
                <button
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-[#4663f1] hover:bg-[#3552d8] text-white rounded-xl text-sm font-bold transition-all shadow-md active:scale-95 disabled:opacity-50"
                >
                  <IconFileDownload className="h-4 w-4" />
                  {loading ? "Menyiapkan PDF..." : "Unduh Laporan (PDF)"}
                </button>
              )}
            </PDFDownloadLink>
          </div>
        )}

        {/* Content for the selected month */}
        {isLoading ? (
          <ReportsSkeleton />
        ) : expenseByCategory.length > 0 ? (
          <div className="space-y-6">
            {/* Donut Chart */}
            <ExpenseDonutChart
              data={expenseByCategory}
              totalExpense={totalExpense}
              currency={profile?.currency}
            />

            {/* Category List - smaller cards */}
            <div className="space-y-3">
              {expenseByCategory.map((cat, i) => {
                const percent =
                  totalExpense > 0 ? (cat.value / totalExpense) * 100 : 0;
                return (
                  <Card key={i} className="border-none shadow-sm p-2">
                    <CardContent className="p-2">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 flex-1">
                          <div
                            className="h-8 w-8 rounded-full flex items-center justify-center text-white shrink-0"
                            style={{ backgroundColor: cat.color }}
                          >
                            {(() => {
                              const IconComp = getCategoryIconComponent(
                                cat.icon
                              );
                              return <IconComp className="h-5 w-5" />;
                            })()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-foreground text-sm">
                              {cat.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatCurrency(cat.value, profile?.currency)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400 font-semibold">
                          {percent.toFixed(1)}%
                        </div>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full transition-all duration-500"
                          style={{
                            width: `${percent}%`,
                            backgroundColor: cat.color,
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ) : (
          <EmptyState
            icon={<EmptyReportsIcon />}
            title="Belum Ada Data Pengeluaran"
            hint={`Mulai catat pengeluaran di bulan ${months[parseInt(selectedMonth)]
              } untuk melihat analisis dan grafik`}
          />
        )}
      </div>
    </AppLayout>
  );
}
