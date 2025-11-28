"use client";

import { AppLayout } from "@/components/app-layout";
import { Skeleton } from "@/components/ui/skeleton";

function StatSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="w-full space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  );
}

export default function DashboardLoading() {
  return (
    <AppLayout>
      <div className="p-4 md:p-8 space-y-6">
        <Skeleton className="h-10 w-32" />

        <Skeleton className="h-48 w-full rounded-3xl" />

        <div className="grid gap-4 md:grid-cols-2">
          <StatSkeleton />
          <StatSkeleton />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((key) => (
            <Skeleton key={key} className="h-32 w-full rounded-2xl" />
          ))}
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
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}

