import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function ClientTableLoading() {
  return (
    <div>
      {/* Filters */}
      <div className="mb-4">
        <Skeleton className="h-10 w-full sm:w-1/3 mb-2" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-full sm:w-1/4" />
          <Skeleton className="h-8 w-full sm:w-1/4" />
          <Skeleton className="h-8 w-full sm:w-1/4" />
        </div>
      </div>

      {/* Header and Add Button */}
      <div className="flex justify-between items-center mb-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-9 w-36 rounded-md" />
      </div>

      {/* Table Loading */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <th key={i} className="px-4 py-3 text-left">
                      <Skeleton className="h-4 w-24" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 5 }).map((_, rowIndex) => (
                  <tr key={rowIndex} className="border-b hover:bg-muted/20">
                    {Array.from({ length: 5 }).map((_, colIndex) => (
                      <td key={colIndex} className="px-4 py-4">
                        <Skeleton className="h-4 w-full" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination Loading */}
      <div className="flex justify-between mt-6 px-2">
        <Skeleton className="h-8 w-28" />
        <div className="flex gap-3">
          <Skeleton className="h-8 w-24 rounded-md" />
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>
      </div>
    </div>
  );
}
