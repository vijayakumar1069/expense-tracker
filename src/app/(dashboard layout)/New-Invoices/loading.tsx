import { Skeleton } from "@/components/ui/skeleton";

export default function NewInvoicesLoadingPage() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Loading Invoices...</h1>
      <div className="space-y-3">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-5/6" />
        <Skeleton className="h-8 w-2/3" />
      </div>
    </div>
  );
}
