"use client";

import { useEffect, useMemo, useState } from "react";
import { AppLayout } from "@/components/app-layout";
import { useTransactions, Transaction } from "@/hooks/use-transactions";
import { useProfile } from "@/hooks/use-profile";
import { useCategories } from "@/hooks/use-categories";
import { useAccounts } from "@/hooks/use-accounts";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  IconSearch,
  IconFilter,
  IconX,
  IconAdjustments,
} from "@tabler/icons-react";
import { EditTransactionDialog } from "@/components/edit-transaction-dialog";
import { TransactionListItem } from "@/components/transaction-list-item";
import { format, isToday, isYesterday, parseISO, startOfDay } from "date-fns";
import { id } from "date-fns/locale";
import { CATEGORY_ICON_MAP } from "@/constants/category-icons";
import { ACCOUNT_ICON_MAP } from "@/constants/account-icons";

export default function TransactionsPage() {
  const { data: profile } = useProfile();
  const { data: transactionsData, isLoading } = useTransactions();
  const { data: categories } = useCategories();
  const { data: accounts } = useAccounts();

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
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [minAmount, setMinAmount] = useState<string>("");
  const [maxAmount, setMaxAmount] = useState<string>("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [tempCategories, setTempCategories] = useState<string[]>([]);
  const [tempAccounts, setTempAccounts] = useState<string[]>([]);
  const [tempMinAmount, setTempMinAmount] = useState<string>("");
  const [tempMaxAmount, setTempMaxAmount] = useState<string>("");

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
      transactions.filter((t) => {
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

        const matchesCategory =
          selectedCategories.length === 0 ||
          (t.category_id && selectedCategories.includes(t.category_id));

        const matchesAccount =
          selectedAccounts.length === 0 ||
          selectedAccounts.includes(t.account_id);

        const matchesMinAmount =
          minAmount === "" || t.amount >= parseFloat(minAmount);

        const matchesMaxAmount =
          maxAmount === "" || t.amount <= parseFloat(maxAmount);

        return (
          matchesSearch &&
          matchesType &&
          matchesMonth &&
          matchesYear &&
          matchesCategory &&
          matchesAccount &&
          matchesMinAmount &&
          matchesMaxAmount
        );
      }),
    [
      transactions,
      search,
      typeFilter,
      selectedMonth,
      selectedYear,
      selectedCategories,
      selectedAccounts,
      minAmount,
      maxAmount,
    ]
  );

  const groupedTransactions = useMemo(() => {
    const groups = filteredTransactions.reduce((acc, tx) => {
      const dateKey = format(startOfDay(new Date(tx.date)), "yyyy-MM-dd");
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(tx);
      return acc;
    }, {} as Record<string, Transaction[]>);

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

  const typeOptions = [
    { value: "all", label: "Semua" },
    { value: "income", label: "Pemasukan" },
    { value: "expense", label: "Pengeluaran" },
    { value: "transfer", label: "Transfer" },
  ];

  // Helpers: Indonesian number display (thousands '.' and decimal ',')
  function normalizeDecimal(input: string): string {
    if (!input) return "";
    // Remove spaces, thousand separators and convert comma to dot
    const s = input.replace(/\s+/g, "").replace(/\./g, "").replace(/,/g, ".");
    // Keep digits and at most one dot
    const cleaned = s.replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");
    if (parts.length === 1) return parts[0];
    return parts[0] + "." + parts.slice(1).join("");
  }

  function formatIdDisplay(raw: string): string {
    if (!raw) return "";
    const [intPart, fracPart] = raw.split(".");
    const intWithDots = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return fracPart !== undefined && fracPart !== ""
      ? `${intWithDots},${fracPart}`
      : intWithDots;
  }

  // Active filters count
  const activeFiltersCount = [
    selectedCategories.length > 0,
    selectedAccounts.length > 0,
    minAmount !== "",
    maxAmount !== "",
  ].filter(Boolean).length;

  useEffect(() => {
    if (isFilterOpen) {
      setTempCategories(selectedCategories);
      setTempAccounts(selectedAccounts);
      setTempMinAmount(minAmount);
      setTempMaxAmount(maxAmount);
    }
  }, [
    isFilterOpen,
    selectedCategories,
    selectedAccounts,
    minAmount,
    maxAmount,
  ]);

  const resetTempFilters = () => {
    setTempCategories([]);
    setTempAccounts([]);
    setTempMinAmount("");
    setTempMaxAmount("");
  };

  const applyFilters = () => {
    setSelectedCategories(tempCategories);
    setSelectedAccounts(tempAccounts);
    setMinAmount(tempMinAmount);
    setMaxAmount(tempMaxAmount);
    setIsFilterOpen(false);
  };

  const clearAdvancedFilters = () => {
    setSelectedCategories([]);
    setSelectedAccounts([]);
    setMinAmount("");
    setMaxAmount("");
    resetTempFilters();
  };

  // Prepare category options for multi-select
  const categoryOptions = useMemo(() => {
    if (!categories) return [];
    return categories.map((cat) => {
      const IconComponent = CATEGORY_ICON_MAP[cat.icon];
      return {
        value: cat.id,
        label: cat.name,
        icon: IconComponent ? <IconComponent className="h-4 w-4" /> : undefined,
        color: cat.color,
      };
    });
  }, [categories]);

  // Prepare account options for multi-select
  const accountOptions = useMemo(() => {
    if (!accounts) return [];
    return accounts.map((acc) => {
      const IconComponent = ACCOUNT_ICON_MAP[acc.icon];
      return {
        value: acc.id,
        label: acc.name,
        icon: IconComponent ? <IconComponent className="h-4 w-4" /> : undefined,
        color: acc.color,
      };
    });
  }, [accounts]);

  return (
    <AppLayout>
      <div className="p-4 md:p-8 space-y-6 pb-24 md:pb-8">
        {/* Filters */}
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-4 space-y-3">
            {/* Top bar */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <IconSearch className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari transaksi..."
                  className="pl-9 h-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <Drawer open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <DrawerTrigger asChild>
                  <Button
                    variant="secondary"
                    size="default"
                    className="gap-2 whitespace-nowrap h-10"
                  >
                    <IconAdjustments className="h-4 w-4" />
                    Filter
                    {activeFiltersCount > 0 && (
                      <span className="ml-1 bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 text-xs font-semibold min-w-5 text-center">
                        {activeFiltersCount}
                      </span>
                    )}
                  </Button>
                </DrawerTrigger>

                <DrawerContent className="px-4 pb-6 pt-3">
                  <div className="mx-auto w-full max-w-md space-y-4">
                    <DrawerHeader className="px-0">
                      <DrawerTitle>Filter Lanjutan</DrawerTitle>
                      <DrawerDescription>
                        Pilih kategori, sumber dana, dan batas jumlah.
                      </DrawerDescription>
                    </DrawerHeader>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">
                          Kategori
                        </label>
                        <MultiSelect
                          options={categoryOptions}
                          value={tempCategories}
                          onChange={setTempCategories}
                          placeholder="Semua kategori"
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">
                          Sumber Dana
                        </label>
                        <MultiSelect
                          options={accountOptions}
                          value={tempAccounts}
                          onChange={setTempAccounts}
                          placeholder="Semua akun"
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">
                          Rentang Jumlah
                        </label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="text"
                            inputMode="decimal"
                            placeholder="Min"
                            value={formatIdDisplay(tempMinAmount)}
                            onChange={(e) =>
                              setTempMinAmount(normalizeDecimal(e.target.value))
                            }
                            className="h-10"
                          />
                          <span className="text-muted-foreground">—</span>
                          <Input
                            type="text"
                            inputMode="decimal"
                            placeholder="Max"
                            value={formatIdDisplay(tempMaxAmount)}
                            onChange={(e) =>
                              setTempMaxAmount(normalizeDecimal(e.target.value))
                            }
                            className="h-10"
                          />
                        </div>
                      </div>
                    </div>

                    <DrawerFooter className="px-0 pt-2">
                      <Button onClick={applyFilters} className="w-full">
                        Terapkan
                      </Button>
                      <DrawerClose asChild>
                        <Button
                          variant="ghost"
                          className="w-full"
                          onClick={resetTempFilters}
                        >
                          Reset
                        </Button>
                      </DrawerClose>
                    </DrawerFooter>
                  </div>
                </DrawerContent>
              </Drawer>
            </div>

            {/* Quick filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="h-10 w-28">
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
                <SelectTrigger className="h-10 w-24">
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
                <SelectTrigger className="h-10 w-32">
                  <SelectValue placeholder="Tipe" />
                </SelectTrigger>
                <SelectContent>
                  {typeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Active Filter Chips */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {selectedCategories.length > 0 && (
                  <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium">
                    <IconFilter className="h-3 w-3" />
                    {selectedCategories.length} Kategori
                    <button
                      onClick={() => setSelectedCategories([])}
                      className="hover:bg-primary/20 rounded-full p-0.5"
                    >
                      <IconX className="h-3 w-3" />
                    </button>
                  </div>
                )}
                {selectedAccounts.length > 0 && (
                  <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium">
                    <IconFilter className="h-3 w-3" />
                    {selectedAccounts.length} Akun
                    <button
                      onClick={() => setSelectedAccounts([])}
                      className="hover:bg-primary/20 rounded-full p-0.5"
                    >
                      <IconX className="h-3 w-3" />
                    </button>
                  </div>
                )}
                {(minAmount !== "" || maxAmount !== "") && (
                  <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-medium">
                    <IconFilter className="h-3 w-3" />
                    Jumlah: {formatIdDisplay(minAmount) || "0"} -{" "}
                    {formatIdDisplay(maxAmount) || "∞"}
                    <button
                      onClick={() => {
                        setMinAmount("");
                        setMaxAmount("");
                      }}
                      className="hover:bg-primary/20 rounded-full p-0.5"
                    >
                      <IconX className="h-3 w-3" />
                    </button>
                  </div>
                )}
                <button
                  onClick={clearAdvancedFilters}
                  className="text-xs text-muted-foreground hover:text-foreground underline decoration-dashed"
                >
                  Hapus semua filter
                </button>
              </div>
            )}
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
                    <TransactionListItem
                      key={transaction.id}
                      transaction={transaction}
                      currency={profile?.currency}
                      onClick={handleTransactionClick}
                    />
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
