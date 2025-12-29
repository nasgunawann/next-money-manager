"use client";

import { useState } from "react";
import { AppLayout } from "@/components/app-layout";
import { useTransactions } from "@/hooks/use-transactions";
import { useProfile } from "@/hooks/use-profile";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { getCategoryIconComponent } from "@/constants/category-icons";
import { ReportsSkeleton } from "@/components/skeleton-loaders";
import { EmptyState, EmptyReportsIcon } from "@/components/empty-state";

const RADIAN = Math.PI / 180;

export default function ReportsPage() {
  const { data: profile } = useProfile();
  const { data: transactions, isLoading } = useTransactions();

  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().getMonth().toString()
  );
  const [selectedYear, setSelectedYear] = useState<string>(
    new Date().getFullYear().toString()
  );

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

  const getMonthTransactions = () => {
    const month = parseInt(selectedMonth);
    const year = parseInt(selectedYear);
    return (
      transactions?.filter((t) => {
        const d = new Date(t.date);
        return d.getMonth() === month && d.getFullYear() === year;
      }) || []
    );
  };

  const expenseByCategory = (() => {
    const monthTx = getMonthTransactions();
    const map = new Map<
      string,
      { name: string; value: number; color: string; icon?: string }
    >();
    monthTx
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
  })();

  const totalExpense = getMonthTransactions().reduce(
    (sum, t) => (t.type === "expense" ? sum + t.amount : sum),
    0
  );

  const renderIconLabel = (props: {
    cx?: number;
    cy?: number;
    midAngle?: number;
    innerRadius?: number;
    outerRadius?: number;
    payload?: { color: string; icon: string };
    value?: number;
  }) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, payload, value } =
      props;
    if (
      !totalExpense ||
      !cx ||
      !cy ||
      !midAngle ||
      !innerRadius ||
      !outerRadius ||
      !payload ||
      !value
    )
      return null;
    const percent = (value / totalExpense) * 100;
    if (percent < 5) return null; // hide on tiny slices to avoid overlap

    const radius = (innerRadius + outerRadius) / 2.05;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const IconComp = getCategoryIconComponent(payload.icon);
    return (
      <g
        transform={`translate(${x},${y})`}
        pointerEvents="none"
        style={{
          animation: "fade-icon 320ms ease forwards",
          opacity: 0,
          transformOrigin: "center center",
        }}
      >
        <circle r={11} fill={payload.color} opacity={0.95} />
        <g transform="translate(-8 -8)">
          <IconComp className="h-4 w-4 text-white" />
        </g>
      </g>
    );
  };

  return (
    <AppLayout>
      <style>
        {`
          @keyframes fade-icon {
            from { opacity: 0; }
            to { opacity: 1; }
          }
        `}
      </style>
      <div className="p-4 md:p-8 max-w-2xl mx-auto">
        {/* Month Navigation */}
        <div className="flex items-center justify-center gap-6 py-4 mb-6">
          <button
            onClick={handlePrevMonth}
            className="p-3 bg-muted rounded-full hover:bg-muted/80 transition-colors"
          >
            <IconChevronLeft className="w-5 h-5" />
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
            style={{ animation: "fade-icon 320ms ease forwards", opacity: 0 }}
            className="p-3 bg-muted rounded-full hover:bg-muted/80 transition-colors"
          >
            <IconChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Content for the selected month */}
        {isLoading ? (
          <ReportsSkeleton />
        ) : expenseByCategory.length > 0 ? (
          <div className="space-y-6">
            {/* Donut Chart */}
            <div className="flex justify-center">
              <div className="relative w-full max-w-[400px] aspect-square">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseByCategory}
                      cx="50%"
                      cy="50%"
                      innerRadius="60%"
                      outerRadius="85%"
                      fill="#8884d8"
                      dataKey="value"
                      paddingAngle={2}
                      strokeWidth={0}
                      animationDuration={500}
                      isAnimationActive={true}
                      label={renderIconLabel}
                      labelLine={false}
                    >
                      {expenseByCategory.map((entry, i) => (
                        <Cell key={`cell-${i}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-3xl md:text-4xl font-bold text-foreground">
                    {formatCurrency(totalExpense, profile?.currency)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Total Pengeluaran
                  </p>
                </div>
              </div>
            </div>

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
            hint={`Mulai catat pengeluaran di bulan ${
              months[parseInt(selectedMonth)]
            } untuk melihat analisis dan grafik`}
          />
        )}
      </div>
    </AppLayout>
  );
}
