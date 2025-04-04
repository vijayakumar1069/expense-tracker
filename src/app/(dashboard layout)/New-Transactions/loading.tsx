import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function TransactionLoadingPage() {
  return (
    <Card className="w-full">
      <CardContent className="p-6 space-y-4">
        {/* Filter Skeleton */}
        <div className="flex flex-col gap-3 md:flex-row md:justify-between">
          <Skeleton className="h-10 w-full md:w-1/3" />
          <div className="flex gap-2 w-full md:w-1/2 justify-end">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>

        {/* Table Header Skeleton */}
        <div className="grid grid-cols-7 gap-4 px-2">
          {[...Array(7)].map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>

        {/* Table Rows Skeleton */}
        <div className="space-y-4">
          {[...Array(5)].map((_, rowIdx) => (
            <div
              key={rowIdx}
              className="grid grid-cols-7 gap-4 items-center px-2 py-2 border rounded-lg dark:border-gray-800"
            >
              {[...Array(7)].map((_, colIdx) => (
                <Skeleton key={colIdx} className="h-5 w-full" />
              ))}
            </div>
          ))}
        </div>

        {/* Footer Skeleton (Summary & Pagination) */}
        <div className="mt-6 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="flex justify-between items-center px-2 py-2 border rounded-lg dark:border-gray-800"
            >
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-20" />
            </div>
          ))}

          <div className="flex justify-between items-center pt-4 border-t">
            <Skeleton className="h-6 w-28" />
            <div className="flex gap-3">
              <Skeleton className="h-8 w-24 rounded-md" />
              <Skeleton className="h-8 w-24 rounded-md" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
