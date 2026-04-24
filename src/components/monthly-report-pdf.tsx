"use client";

import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";
import { format } from "date-fns";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Helvetica",
    backgroundColor: "#FFFFFF",
  },
  logo: {
    width: 150,
    height: "auto",
    marginBottom: 10,
  },
  header: {
    marginBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: "#4663f1",
    paddingBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
  },
  subtitle: {
    fontSize: 9,
    color: "#6b7280",
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#4b5563",
    marginTop: 15,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  summaryContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 15,
  },
  summaryCard: {
    flex: 1,
    padding: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
  },
  summaryLabel: {
    fontSize: 6,
    color: "#6b7280",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#111827",
  },
  // Table styles
  table: {
    width: "100%",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#e5e7eb",
    paddingVertical: 5,
    alignItems: "center",
  },
  tableHeader: {
    backgroundColor: "#f3f4f6",
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
  },
  // Column Widths
  colDate: { width: "10%", fontSize: 7 },
  colDesc: { width: "35%", fontSize: 7 },
  colDebit: { width: "18%", fontSize: 7, textAlign: "right" }, // Pengeluaran
  colCredit: { width: "18%", fontSize: 7, textAlign: "right" }, // Pemasukan
  colBal: { width: "19%", fontSize: 7, textAlign: "right", fontWeight: "bold" }, // Saldo Berjalan

  // Category Analysis
  catRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
    borderBottomWidth: 0.5,
    borderBottomColor: "#f3f4f6",
  },
  catName: { fontSize: 8, color: "#374151" },
  catValue: { fontSize: 8, fontWeight: "bold" },

  income: { color: "#059669" },
  expense: { color: "#dc2626" },
  transfer: { color: "#2563eb" },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 30,
    right: 30,
    textAlign: "center",
    fontSize: 6,
    color: "#9ca3af",
    borderTopWidth: 0.5,
    borderTopColor: "#e5e7eb",
    paddingTop: 8,
  },
});

interface CategoryStat {
  name: string;
  value: number;
  color: string;
}

interface Transaction {
  id: string;
  date: string;
  description: string | null;
  amount: number;
  type: "income" | "expense" | "transfer";
  category?: { name: string };
}

interface MonthlyReportPDFProps {
  transactions: Transaction[];
  profileName: string;
  period: string;
  stats: {
    totalIncome: number;
    totalExpense: number;
    totalTransfer: number;
    balance: number;
    initialBalance: number;
  };
  categories: CategoryStat[];
  currency?: string;
}

const formatCurrency = (val: number, symbol: string = "") => {
  return `${symbol}${Math.abs(val).toLocaleString("id-ID")}`;
};

export function MonthlyReportPDF({
  transactions,
  profileName,
  period,
  stats,
  categories,
  currency = "Rp",
}: MonthlyReportPDFProps) {
  // Sort transaksi dari yang terlama ke terbaru untuk perhitungan saldo berjalan
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  let runningBalance = stats.initialBalance;

  return (
    <Document title={`E-Statement - ${period}`}>
      <Page size="A4" style={styles.page}>
        {/* Logo Section */}
        <View style={{ marginBottom: 10 }}>
          <Image src="/logolight.svg" style={styles.logo} />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>E-STATEMENT</Text>
            <Text style={styles.subtitle}>Account Holder: {profileName}</Text>
          </View>
          <View style={{ textAlign: "right" }}>
            <Text style={[styles.subtitle, { color: "#4663f1", fontWeight: "bold", fontSize: 10 }]}>
              Periode: {period}
            </Text>
          </View>
        </View>

        {/* Executive Summary */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Saldo Awal</Text>
            <Text style={styles.summaryValue}>{formatCurrency(stats.initialBalance, currency + " ")}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Pemasukan (+)</Text>
            <Text style={[styles.summaryValue, styles.income]}>{formatCurrency(stats.totalIncome, "+ " + currency + " ")}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Pengeluaran (-)</Text>
            <Text style={[styles.summaryValue, styles.expense]}>{formatCurrency(stats.totalExpense, "- " + currency + " ")}</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: stats.balance >= 0 ? "#f0fdf4" : "#fef2f2" }]}>
            <Text style={styles.summaryLabel}>Selisih (Net)</Text>
            <Text style={[styles.summaryValue, stats.balance >= 0 ? styles.income : styles.expense]}>
              {stats.balance >= 0 ? "+" : "-"} {formatCurrency(stats.balance, currency + " ")}
            </Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: "#eef2ff" }]}>
            <Text style={styles.summaryLabel}>Saldo Akhir</Text>
            <Text style={styles.summaryValue}>{formatCurrency(stats.initialBalance + stats.balance, currency + " ")}</Text>
          </View>
        </View>

        {/* Analysis */}
        <View wrap={false} style={{ marginBottom: 10 }}>
          <Text style={styles.sectionTitle}>Ringkasan Pengeluaran</Text>
          <View style={{ paddingLeft: 5, paddingRight: 30 }}>
            {categories.slice(0, 5).map((cat, i) => {
              const percent = stats.totalExpense > 0 ? (cat.value / stats.totalExpense) * 100 : 0;
              return (
                <View key={i} style={styles.catRow}>
                  <Text style={styles.catName}>{cat.name} ({percent.toFixed(0)}%)</Text>
                  <Text style={styles.catValue}>{formatCurrency(cat.value, currency + " ")}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Transactions Table */}
        <Text style={styles.sectionTitle}>Mutasi Rekening</Text>
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.colDate, { fontWeight: "bold" }]}>Tanggal</Text>
            <Text style={[styles.colDesc, { fontWeight: "bold" }]}>Keterangan</Text>
            <Text style={[styles.colDebit, { fontWeight: "bold" }]}>Pengeluaran</Text>
            <Text style={[styles.colCredit, { fontWeight: "bold" }]}>Pemasukan</Text>
            <Text style={[styles.colBal, { fontWeight: "bold" }]}>Saldo</Text>
          </View>

          {sortedTransactions.map((tx) => {
            const isIncome = tx.type === "income";
            const isExpense = tx.type === "expense";
            const isTransfer = tx.type === "transfer";

            if (isIncome) runningBalance += tx.amount;
            if (isExpense) runningBalance -= tx.amount;
            // Note: Transfer is net 0 in a global statement, but we show the amount in both/either?
            // To keep it simple & consistent with bank statements:
            // We treat it as neutral or we can pick a side. Let's keep it neutral for global.

            return (
              <View key={tx.id} style={styles.tableRow} wrap={false}>
                <Text style={styles.colDate}>{format(new Date(tx.date), "dd/MM")}</Text>
                <Text style={styles.colDesc}>
                  <Text style={{ fontWeight: 'bold' }}>{tx.category?.name || "Lainnya"}</Text>
                  {"\n"}<Text style={{ fontSize: 6, color: '#6b7280' }}>{tx.description || "-"}</Text>
                </Text>
                <Text style={[styles.colDebit, styles.expense]}>
                  {isExpense ? formatCurrency(tx.amount) : ""}
                </Text>
                <Text style={[styles.colCredit, styles.income]}>
                  {isIncome ? formatCurrency(tx.amount) : ""}
                </Text>
                <Text style={[styles.colBal, isTransfer ? styles.transfer : {}]}>
                  {isTransfer ? "TRF " : ""}{formatCurrency(runningBalance)}
                </Text>
              </View>
            );
          })}
        </View>

        {/* Footer */}
        <Text style={styles.footer} fixed>
          Halaman ini adalah dokumen resmi dari Kaslo - Financial Tracker • Dicetak pada {format(new Date(), "dd/MM/yyyy HH:mm")}
        </Text>
      </Page>
    </Document>
  );
}
