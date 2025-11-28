"use client";

import { AppLayout } from "@/components/app-layout";
import { Skeleton } from "@/components/ui/skeleton";

export default function AccountsLoading() {
  return (
    <AppLayout>
      <div className="p-4 md:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-9 w-24" />
        </div>

        <Skeleton className="h-28 w-full rounded-2xl" />

        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((key) => (
            <div key={key} className="rounded-xl border p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 w-full">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="h-5 w-24" />
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}

