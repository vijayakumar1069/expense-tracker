import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 px-4 sm:px-6 lg:px-8 py-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Hero Section Loading */}
        <div className="space-y-3 animate-pulse">
          <Skeleton className="h-8 w-1/3 rounded-xl" />
          <Skeleton className="h-4 w-1/2 rounded-xl" />
        </div>

        {/* Cards Section Loading */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>

        {/* Income/Expense Charts Loading */}
        <div className="grid gap-6 md:gap-8 grid-cols-1">
          <Skeleton className="h-64 rounded-xl" />
        </div>

        {/* Sidebar / Stats Loading */}
        <div className="mt-5">
          <Skeleton className="h-10 w-32 mb-4 rounded-md" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        </div>

        {/* Footer Loading */}
        <div className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-700 text-center">
          <Skeleton className="h-4 w-1/4 mx-auto rounded-md" />
        </div>
      </div>
    </div>
  );
}
