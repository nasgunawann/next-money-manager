"use client";

import { AppLayout } from "@/components/app-layout";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <AppLayout>
      <div className="p-4 md:p-8 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((key) => (
            <div key={key} className="rounded-xl border p-4 space-y-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}

