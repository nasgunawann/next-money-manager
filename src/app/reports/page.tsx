"use client";

import { useState, useMemo, useRef } from "react";
import { AppLayout } from "@/components/app-layout";
import { useTransactions } from "@/hooks/use-transactions";
import { useProfile } from "@/hooks/use-profile";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ReportsPage() {
  const { data: profile } = useProfile();
  const { data: transactions, isLoading } = useTransactions();

  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().getMonth().toString()
  );
  const [selectedYear, setSelectedYear] = useState<string>(
    new Date().getFullYear().toString()
  );

  // Touch swipe state
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

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

  const years = Array.from({ length: 5 }, (_, i) =>
    (new Date().getFullYear() - i).toString()
  );

  // Filter transactions by selected month/year
  const filteredTransactions = useMemo(() => {
    return (
      transactions?.filter((t) => {
        const txDate = new Date(t.date);
        return (
          txDate.getMonth().toString() === selectedMonth &&
          txDate.getFullYear().toString() === selectedYear
        );
      }) || []
    );
  }, [transactions, selectedMonth, selectedYear]);

  // Calculate expense by category
  const expenseByCategory = useMemo(() => {
    const categoryMap = new Map<
      string,
      { name: string; value: number; color: string }
    >();

    filteredTransactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        const categoryName = t.category?.name || "Lainnya";
        const categoryColor = t.category?.color || "#94a3b8";
        const existing = categoryMap.get(categoryName);

        if (existing) {
          existing.value += t.amount;
        } else {
          categoryMap.set(categoryName, {
            name: categoryName,
            value: t.amount,
            color: categoryColor,
          });
        }
      });

    return Array.from(categoryMap.values()).sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  const totalExpense = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const handlePrevMonth = () => {
    const newMonth = parseInt(selectedMonth) - 1;
    if (newMonth < 0) {
      setSelectedMonth("11");
      setSelectedYear((parseInt(selectedYear) - 1).toString());
    } else {
      setSelectedMonth(newMonth.toString());
    }
  };

  const handleNextMonth = () => {
    const newMonth = parseInt(selectedMonth) + 1;
    if (newMonth > 11) {
      setSelectedMonth("0");
      setSelectedYear((parseInt(selectedYear) + 1).toString());
    } else {
      setSelectedMonth(newMonth.toString());
    }
  };

  // Touch swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const swipeThreshold = 50; // minimum distance for swipe
    const diff = touchStartX.current - touchEndX.current;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        // Swiped left - go to next month
        handleNextMonth();
      } else {
        // Swiped right - go to previous month
        handlePrevMonth();
      }
    }
  };

  return (
    <AppLayout>
      <div
        className="p-4 md:p-8 space-y-6 pb-24 md:pb-8 max-w-2xl mx-auto"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Header */}
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-foreground">
            Analisis Pengeluaran
          </h1>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-center gap-6 py-4">
          <button
            onClick={handlePrevMonth}
            className="p-3 bg-muted rounded-full hover:bg-muted/80 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
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
            className="p-3 bg-muted rounded-full hover:bg-muted/80 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Donut Chart */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : expenseByCategory.length > 0 ? (
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
                  >
                    {expenseByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
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
        ) : (
          <div className="flex justify-center py-12">
            <p className="text-muted-foreground">Tidak ada data pengeluaran</p>
          </div>
        )}

        {/* Category List */}
        <div className="space-y-4">
          {expenseByCategory.length > 0 ? (
            <div className="space-y-3">
              {expenseByCategory.map((category, index) => {
                const percentage =
                  totalExpense > 0 ? (category.value / totalExpense) * 100 : 0;
                return (
                  <Card key={index} className="border-none shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3 flex-1">
                          <div
                            className="h-12 w-12 rounded-full flex items-center justify-center text-white shrink-0"
                            style={{ backgroundColor: category.color }}
                          >
                            <span className="text-2xl font-bold">•</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-foreground">
                              {category.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {formatCurrency(
                                category.value,
                                profile?.currency
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-green-600 dark:text-green-400 text-sm font-semibold flex items-center gap-1">
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div
                          className="h-2.5 rounded-full transition-all duration-300"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: category.color,
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Tidak ada data
            </p>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
