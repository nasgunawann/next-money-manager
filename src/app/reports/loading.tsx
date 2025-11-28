"use client";

import { AppLayout } from "@/components/app-layout";
import { Skeleton } from "@/components/ui/skeleton";

export default function ReportsLoading() {
  return (
    <AppLayout>
      <div className="p-4 md:p-8 space-y-6">
        <Skeleton className="h-8 w-44" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((key) => (
            <Skeleton key={key} className="h-48 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    </AppLayout>
  );
}

