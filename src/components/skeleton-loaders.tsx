import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function TransactionListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="border-none shadow-sm">
          <CardContent className="p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <Skeleton className="h-9 w-9 rounded-full shrink-0" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-4 w-20 shrink-0" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function AccountCardSkeleton({ count = 2 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="overflow-hidden border-none shadow-sm">
          <CardContent>
            <div className="flex items-center gap-3 mb-3">
              <Skeleton className="h-12 w-12 rounded-full shrink-0" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <Skeleton className="h-6 w-32" />
          </CardContent>
        </Card>
      ))}
    </>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="p-4 md:p-8 space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Left Column */}
        <div className="md:col-span-2 space-y-5">
          {/* Hero Card */}
          <Card className="relative overflow-hidden border-none bg-linear-to-br from-[#4663f1] via-[#3552d8] to-[#1f37a7] text-white shadow-2xl">
            <CardContent className="p-5 md:p-7 space-y-4">
              <div className="flex flex-col gap-1">
                <Skeleton className="h-3 w-20 bg-white/20" />
                <Skeleton className="h-10 w-48 bg-white/20" />
                <Skeleton className="h-3 w-40 bg-white/20" />
              </div>
              <div className="rounded-3xl bg-white/15 backdrop-blur grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-9 w-9 rounded-full bg-white/20" />
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-16 bg-white/20" />
                    <Skeleton className="h-4 w-20 bg-white/20" />
                  </div>
                </div>
                <div className="h-10 w-px bg-white/20" />
                <div className="flex items-center gap-2 justify-self-end">
                  <Skeleton className="h-9 w-9 rounded-full bg-white/20" />
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-16 bg-white/20" />
                    <Skeleton className="h-4 w-20 bg-white/20" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Accounts Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="hidden md:grid grid-cols-2 gap-4">
              <AccountCardSkeleton count={2} />
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <section>
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-3 w-16" />
                <TransactionListSkeleton count={2} />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export function ReportsSkeleton() {
  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      {/* Month Navigation */}
      <div className="flex items-center justify-center gap-6 py-4 mb-6">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="text-center min-w-[200px] space-y-2">
          <Skeleton className="h-10 w-32 mx-auto" />
          <Skeleton className="h-5 w-16 mx-auto" />
        </div>
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>

      <div className="space-y-6">
        {/* Donut Chart */}
        <div className="flex justify-center">
          <Skeleton className="w-full max-w-[400px] aspect-square rounded-full" />
        </div>

        {/* Category List */}
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="border-none shadow-sm p-2">
              <CardContent className="p-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 flex-1">
                    <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                    <div className="flex-1 min-w-0 space-y-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="w-full h-1.5 rounded-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AccountsPageSkeleton() {
  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AccountCardSkeleton count={6} />
      </div>
    </div>
  );
}
