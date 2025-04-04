"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, DollarSign, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryBadge } from "./CategoryBadge";
import {
  TransactionResponse,
  TransactionWithPaymentMethod,
} from "@/utils/types";
import DeleteTransactionButton from "./DeleteTransactionButton";
import { TransActionEditButton } from "./transaction dialog/TransActionEditButton";
import {
  ArrowUp,
  ArrowDown,
  Banknote,
  Building,
  FileCheck,
  TrendingUp,
  TrendingDown,
  CircleDollarSign,
  FileDigit,
} from "lucide-react";
import TransactionFilter from "./TransactionFilter";
import TransactionHeader from "./TransactionHeader";

// Helper function to format payment method names
export const formatPaymentMethodName = (method: string) => {
  switch (method) {
    case "BANK":
      return "Bank Transfer";
    case "CHEQUE":
      return "Cheque";
    case "CASH":
      return "Cash";
    default:
      return method;
  }
};

// Define the filter state type
interface FilterState {
  type?: string;
  category?: string;
  paymentMethodType?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: string;
  maxAmount?: string;
  search?: string;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}
const limit = 10;

const ExpenseTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  // const isInitialMount = useRef(true);

  const [filters, setFilters] = useState<FilterState>({
    sortBy: "createdAt",
    sortDirection: "desc",
  });

  // Fetch transactions with React Query
  const { data, isLoading, isError } = useQuery<TransactionResponse>({
    queryKey: ["transactions", currentPage, limit, filters],
    queryFn: async () => {
      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
      });

      // Add filter parameters if they exist
      if (filters.type) params.append("type", filters.type);
      if (filters.category) params.append("category", filters.category);
      if (filters.paymentMethodType)
        params.append("paymentMethodType", filters.paymentMethodType);
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      if (filters.minAmount) params.append("minAmount", filters.minAmount);
      if (filters.maxAmount) params.append("maxAmount", filters.maxAmount);
      if (filters.search) params.append("search", filters.search);
      if (filters.sortBy) params.append("sortBy", filters.sortBy);
      if (filters.sortDirection)
        params.append("sortDirection", filters.sortDirection);

      const response = await fetch(
        `/api/get-all-transactions?${params.toString()}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch transactions");
      }
      return response.json();
    },
    refetchOnWindowFocus: false,
    staleTime: 30000, // 30 seconds
    // cacheTime: 300000, // 5 minutes
  });

  // Handler for filter changes // Modified handler for filter changes
  // const handleFilterChange = (newFilters: FilterState) => {
  //   // Skip unnecessary updates
  //   setFilters((prev) => {
  //     const isSame = JSON.stringify(prev) === JSON.stringify(newFilters);

  //     // When the component first mounts, we don't want to trigger updates for the same values
  //     if (isSame && isInitialMount.current) {
  //       isInitialMount.current = false;
  //       return prev;
  //     }

  //     // Otherwise, process normally
  //     if (isSame) return prev;

  //     // We're no longer on initial mount
  //     isInitialMount.current = false;
  //     return { ...prev, ...newFilters };
  //   });
  // };

  const handleApplyFilters = (newFilters: FilterState) => {
    setFilters(newFilters);
    // Reset to first page when filters change
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          {[...Array(5)].map((_, idx) => (
            <div key={idx} className="flex items-center space-x-4 mb-4">
              <Skeleton className="h-12 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-center text-red-500">
            Error loading transactions. Please try again.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
      <TransactionFilter
        // onFilterChange={handleFilterChange}
        initialFilters={filters}
        onApplyFilters={handleApplyFilters}
      />
      <TransactionHeader currentFilters={filters} />

      <CardContent className="p-6">
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
          <Table>
            <TableHeader className="bg-gray-50 dark:bg-gray-900/60">
              <TableRow className="border-b border-gray-200 dark:border-gray-800">
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-gray-600 dark:text-gray-400 py-4">
                  Transaction
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-gray-600 dark:text-gray-400">
                  Category
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-gray-600 dark:text-gray-400">
                  Date
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-gray-600 dark:text-gray-400">
                  Type
                </TableHead>
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-gray-600 dark:text-gray-400">
                  Payment Method
                </TableHead>
                <TableHead className="text-right font-semibold text-xs uppercase tracking-wider text-gray-600 dark:text-gray-400">
                  Amount
                </TableHead>
                <TableHead className="text-right font-semibold text-xs uppercase tracking-wider text-gray-600 dark:text-gray-400">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {data?.transactions && data.transactions.length > 0 ? (
                data.transactions.map(
                  (transaction: TransactionWithPaymentMethod) => (
                    <TableRow
                      key={transaction.id}
                      className="group hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-all duration-200"
                    >
                      <TableCell className="font-medium max-w-60 text-wrap py-4">
                        <div className="flex flex-col">
                          {transaction.name}
                          {/* {transaction.description && (
                            <span className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1  transition-all duration-300 ">
                              {transaction.description}
                            </span>
                          )} */}
                        </div>
                      </TableCell>

                      <TableCell>
                        <CategoryBadge categoryName={transaction.category} />
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                          <Calendar className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
                          <span className="font-medium">
                            {format(new Date(transaction.date), "MMM dd, yyyy")}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`px-2.5 py-1 font-medium text-xs ${
                            transaction.type === "INCOME"
                              ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-800"
                              : "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800"
                          } rounded-full shadow-sm`}
                        >
                          {transaction.type === "INCOME" ? (
                            <span className="flex items-center gap-1">
                              <ArrowUp className="h-3 w-3" />
                              Income
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <ArrowDown className="h-3 w-3" />
                              Expense
                            </span>
                          )}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800">
                            {transaction?.paymentMethod.type === "CASH" && (
                              <Banknote className="h-3 w-3 text-amber-600" />
                            )}

                            {transaction?.paymentMethod.type === "BANK" && (
                              <Building className="h-3 w-3 text-indigo-600" />
                            )}
                            {transaction?.paymentMethod.type === "CHEQUE" && (
                              <FileCheck className="h-3 w-3 text-teal-600" />
                            )}
                            {transaction?.paymentMethod.type === "INVOICE" && (
                              <FileDigit className="h-3 w-3 text-blue-600" />
                              // <FileCheck className="h-3 w-3 text-teal-600" />
                            )}
                          </span>
                          <span className="font-medium text-gray-700 dark:text-gray-300 text-sm">
                            {formatPaymentMethodName(
                              transaction?.paymentMethod.type
                            )}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="text-right">
                        <div
                          className={`flex items-center justify-end gap-1 font-medium text-base ${
                            transaction.type === "INCOME"
                              ? "text-green-600 dark:text-green-500"
                              : "text-red-600 dark:text-red-500"
                          }`}
                        >
                          <span className="text-lg font-bold">
                            {transaction.type === "INCOME" ? "+" : "-"}
                          </span>
                          <DollarSign className="h-3.5 w-3.5" />
                          <span className="font-bold">
                            {transaction?.total.toFixed(2)}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2 opacity-80 group-hover:opacity-100 transition-opacity">
                          <TransActionEditButton
                            transactionId={transaction.id}
                          />
                          <DeleteTransactionButton
                            transactionId={transaction.id}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                )
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No transactions found. Try adjusting your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>

            <TableFooter className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
              <TableRow className="border-t-2 border-gray-200 dark:border-gray-800 hover:bg-transparent">
                <TableCell
                  colSpan={3}
                  className="font-bold text-gray-800 dark:text-gray-200"
                >
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    Total Income
                  </div>
                </TableCell>
                <TableCell
                  className="text-right font-bold text-green-600 dark:text-green-500"
                  colSpan={4}
                >
                  <div className="flex items-center justify-end gap-1">
                    <DollarSign className="h-4 w-4" />
                    <span className="text-lg">
                      {data?.summary?.totalIncome.toFixed(2) || "0.00"}
                    </span>
                  </div>
                </TableCell>
              </TableRow>

              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={3}
                  className="font-bold text-gray-800 dark:text-gray-200"
                >
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-red-500" />
                    Total Expense
                  </div>
                </TableCell>
                <TableCell
                  className="text-right font-bold text-red-600 dark:text-red-500"
                  colSpan={4}
                >
                  <div className="flex items-center justify-end gap-1">
                    <DollarSign className="h-4 w-4" />
                    <span className="text-lg">
                      {data?.summary?.totalExpenses.toFixed(2) || "0.00"}
                    </span>
                  </div>
                </TableCell>
              </TableRow>

              <TableRow className="hover:bg-transparent border-t-2 border-gray-200 dark:border-gray-800">
                <TableCell
                  colSpan={3}
                  className="font-extrabold text-gray-900 dark:text-white"
                >
                  <div className="flex items-center gap-2">
                    <CircleDollarSign className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    Net Amount
                  </div>
                </TableCell>
                <TableCell className="text-right font-extrabold" colSpan={4}>
                  <div
                    className={`flex items-center justify-end gap-1 ${
                      data?.summary?.netAmount !== undefined &&
                      data?.summary?.netAmount >= 0
                        ? "text-green-600 dark:text-green-500"
                        : "text-red-600 dark:text-red-500"
                    }`}
                  >
                    <DollarSign className="h-5 w-5" />
                    <span className="text-xl">
                      {(data?.summary?.netAmount || 0).toFixed(2)}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between px-2 mt-6">
          <div className="text-sm font-medium bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-md text-gray-700 dark:text-gray-300 flex items-center gap-1">
            <FileDigit className="h-3.5 w-3.5 text-indigo-500" />
            Page {currentPage} of {data?.pagination?.totalPages || 1}
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1 || isLoading}
              className="group border-gray-300 dark:border-gray-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all"
            >
              <ChevronLeft className="h-4 w-4 mr-1 text-indigo-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
              <span className="group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Previous
              </span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => prev + 1)}
              disabled={
                !data?.pagination?.totalPages ||
                currentPage === data.pagination.totalPages ||
                isLoading
              }
              className="group border-gray-300 dark:border-gray-700 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all"
            >
              <span className="group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Next
              </span>
              <ChevronRight className="h-4 w-4 ml-1 text-indigo-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExpenseTable;
