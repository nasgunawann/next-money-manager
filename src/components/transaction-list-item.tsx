"use client";

import { formatCurrency, cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { IconArrowsLeftRight } from "@tabler/icons-react";
import { getCategoryIconComponent } from "@/constants/category-icons";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import type { Transaction } from "@/hooks/use-transactions";

interface TransactionListItemProps {
  transaction: Transaction;
  currency?: string;
  onClick?: (transaction: Transaction) => void;
  showTime?: boolean;
}

export function TransactionListItem({
  transaction,
  currency,
  onClick,
  showTime = true,
}: TransactionListItemProps) {
  const CatIcon = getCategoryIconComponent(transaction.category?.icon);

  return (
    <Card
      className={cn(
        "border-none shadow-sm hover:bg-accent/50 transition-colors",
        onClick && "cursor-pointer"
      )}
      onClick={() => onClick?.(transaction)}
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
            {transaction.type === "transfer" ? (
              <IconArrowsLeftRight className="h-4.5 w-4.5" />
            ) : (
              <CatIcon className="h-4.5 w-4.5" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-foreground text-sm leading-tight truncate">
              {transaction.description ||
                transaction.category?.name ||
                "Transaksi"}
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
              {showTime &&
                format(new Date(transaction.date), "HH:mm", {
                  locale: id,
                }) + " • "}
              {transaction.account?.name}
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
          {formatCurrency(transaction.amount, currency)}
        </p>
      </CardContent>
    </Card>
  );
}
