"use client";

import { AppLayout } from "@/components/app-layout";
import { Skeleton } from "@/components/ui/skeleton";

export default function TransactionsLoading() {
  return (
    <AppLayout>
      <div className="p-4 md:p-8 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <Skeleton className="h-11 w-full md:flex-1 rounded-full" />
          <Skeleton className="h-11 w-full md:w-40 rounded-full" />
          <Skeleton className="h-11 w-full md:w-32 rounded-full" />
        </div>

        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((key) => (
            <div
              key={key}
              className="flex items-center justify-between rounded-xl border p-4"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}

