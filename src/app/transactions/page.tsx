"use client";

import { useState, useMemo } from "react";
import { AppLayout } from "@/components/app-layout";
import { useTransactions, Transaction } from "@/hooks/use-transactions";
import { useProfile } from "@/hooks/use-profile";
import { formatCurrency, cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  IconArrowUpRight,
  IconArrowDownLeft,
  IconSearch,
  IconArrowsLeftRight,
} from "@tabler/icons-react";
import { EditTransactionDialog } from "@/components/edit-transaction-dialog";
import {
  format,
  isToday,
  isYesterday,
  parseISO,
  startOfDay,
} from "date-fns";
import { id } from "date-fns/locale";

export default function TransactionsPage() {
  const { data: profile } = useProfile();
  const { data: transactionsData, isLoading } = useTransactions();
  const transactions = useMemo(
    () => transactionsData ?? [],
    [transactionsData]
  );
  const hasTransactions = transactions.length > 0;

  // Filters
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().getMonth().toString()
  );
  const [selectedYear, setSelectedYear] = useState<string>(
    new Date().getFullYear().toString()
  );

  // Edit Dialog
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsEditOpen(true);
  };

  const filteredTransactions = useMemo(
    () =>
      transactions
        .filter((t) => {
          // Filter out the receiving side of transfers to show only one entry per transfer
          if (t.type === "transfer" && t.related_transaction_id) {
            // Check if this is the receiving side (description contains "(dari")
            if (t.description?.includes("(dari")) {
              return false;
            }
          }

        const matchesSearch =
            search === "" ||
          t.description?.toLowerCase().includes(search.toLowerCase()) ||
            t.category?.name?.toLowerCase().includes(search.toLowerCase()) ||
            t.account?.name?.toLowerCase().includes(search.toLowerCase());

        const matchesType = typeFilter === "all" || t.type === typeFilter;

        const txDate = new Date(t.date);
        const matchesMonth = txDate.getMonth().toString() === selectedMonth;
        const matchesYear = txDate.getFullYear().toString() === selectedYear;

        return matchesSearch && matchesType && matchesMonth && matchesYear;
      }),
    [transactions, search, typeFilter, selectedMonth, selectedYear]
  );

  const groupedTransactions = useMemo(() => {
    const groups = filteredTransactions.reduce(
      (acc, tx) => {
        const dateKey = format(startOfDay(new Date(tx.date)), "yyyy-MM-dd");
        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }
        acc[dateKey].push(tx);
        return acc;
      },
      {} as Record<string, Transaction[]>
    );

    return Object.keys(groups)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
      .map((key) => ({
        key,
        label: renderDateLabel(key),
        items: groups[key],
      }));
  }, [filteredTransactions]);

  function renderDateLabel(key: string) {
    const date = parseISO(key);
    if (isToday(date)) return "Hari ini";
    if (isYesterday(date)) return "Kemarin";
    return format(date, "dd MMMM yyyy", { locale: id });
  }

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

  return (
    <AppLayout>
      <div className="p-4 md:p-8 space-y-6 pb-24 md:pb-8">

        {/* Filters */}
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-4 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <IconSearch className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari transaksi..."
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Bulan" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((m, i) => (
                      <SelectItem key={i} value={i.toString()}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="Tahun" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((y) => (
                      <SelectItem key={y} value={y}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Tipe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua</SelectItem>
                    <SelectItem value="income">Pemasukan</SelectItem>
                    <SelectItem value="expense">Pengeluaran</SelectItem>
                    <SelectItem value="transfer">Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transaction List */}
        <div className="space-y-4">
          {!hasTransactions && isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : groupedTransactions.length ? (
            groupedTransactions.map((group) => (
              <div key={group.key} className="space-y-2">
                <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">
                  {group.label}
                </p>
                <div className="space-y-2">
                  {group.items.map((transaction) => (
                    <Card
                      key={transaction.id}
                      className="border-none shadow-sm hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => handleTransactionClick(transaction)}
                    >
                      <CardContent className="p-4 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          <div
                            className={cn(
                              "h-9 w-9 rounded-full flex items-center justify-center shrink-0",
                              transaction.type === "income"
                                ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                                : transaction.type === "expense"
                                ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                                : "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                            )}
                          >
                            {transaction.type === "income" ? (
                              <IconArrowDownLeft className="h-4.5 w-4.5" />
                            ) : transaction.type === "expense" ? (
                              <IconArrowUpRight className="h-4.5 w-4.5" />
                            ) : (
                              <IconArrowsLeftRight className="h-4.5 w-4.5" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-foreground text-sm leading-tight truncate">
                              {transaction.description ||
                                transaction.category?.name ||
                                "Transaksi"}
                            </p>
                            <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                              {format(new Date(transaction.date), "HH:mm", {
                                locale: id,
                              })}{" "}
                              • {transaction.account?.name}
                            </p>
                          </div>
                        </div>
                        <p
                          className={cn(
                            "font-semibold text-sm whitespace-nowrap text-right shrink-0",
                            transaction.type === "income"
                              ? "text-green-600 dark:text-green-400"
                              : transaction.type === "expense"
                              ? "text-red-600 dark:text-red-400"
                              : "text-blue-600 dark:text-blue-400"
                          )}
                        >
                          {transaction.type === "income"
                            ? "+"
                            : transaction.type === "expense"
                            ? "-"
                            : ""}{" "}
                          {formatCurrency(transaction.amount, profile?.currency)}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 bg-card rounded-xl border border-dashed border-border">
              <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <IconSearch className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground">
                Tidak ada transaksi
              </h3>
              <p className="text-muted-foreground text-sm max-w-xs mx-auto mt-1">
                Coba ubah filter atau tambah transaksi baru.
              </p>
            </div>
          )}
        </div>
      </div>

      <EditTransactionDialog
        transaction={selectedTransaction}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
      />
    </AppLayout>
  );
}
