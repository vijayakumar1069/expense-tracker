import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const Loading = () => {
  return (
    <div className="p-6 space-y-4">
      {/* Header skeleton */}
      <Skeleton className="h-8 w-1/3" />

      {/* Subheader skeleton */}
      <Skeleton className="h-6 w-1/4" />

      {/* Content cards skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>

      {/* Table or section placeholder */}
      <div className="space-y-2">
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-11/12" />
        <Skeleton className="h-6 w-10/12" />
      </div>
    </div>
  );
};

export default Loading;
