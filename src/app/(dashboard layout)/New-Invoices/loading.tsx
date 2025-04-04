"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { FileDigit } from "lucide-react";

const InvoiceTableLoading = () => {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Invoice List</h2>
        <Skeleton className="h-9 w-[150px] rounded-md" />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Client Name</TableHead>
                <TableHead>Issue Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 6 }).map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                  {Array.from({ length: 5 }).map((_, cellIndex) => (
                    <TableCell key={cellIndex}>
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between px-2 mt-6">
        <div className="text-sm font-medium bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-md text-gray-700 dark:text-gray-300 flex items-center gap-1">
          <FileDigit className="h-3.5 w-3.5 text-indigo-500" />
          Loading pagination...
        </div>

        <div className="flex items-center space-x-3">
          <Skeleton className="h-8 w-[100px] rounded-md" />
          <Skeleton className="h-8 w-[100px] rounded-md" />
        </div>
      </div>
    </div>
  );
};
export default InvoiceTableLoading;
