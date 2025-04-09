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
import { ChevronLeft, ChevronRight, Calendar, IndianRupee } from "lucide-react";
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
  FileDigit,
} from "lucide-react";
import TransactionFilter from "./TransactionFilter";
import TransactionHeader from "./TransactionHeader";
import TransActionDialog from "./TransActionDialog";
import DownloadProofButton from "./DownloadProofButton";

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
  byMonth?: string;
}
const limit = 7;

const ExpenseTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
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
      if (filters.byMonth) params.append("byMonth", filters.byMonth);

      const response = await fetch(
        `/api/get-all-transactions?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch transactions");
      }
      return response.json();
    },
    refetchOnWindowFocus: false,

    staleTime: 30000,
  });

  const handleApplyFilters = (newFilters: FilterState) => {
    setFilters(newFilters);
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
    <Card className="w-full flex flex-col relative overflow-hidden border-0 space-y-0 gap-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 mb-0">
      <div className="w-full mb-4 px-6">
        <div className="flex flex-wrap md:flex-nowrap gap-4 items-center justify-end w-full">
          <div className="w-full md:w-auto">
            <TransActionDialog mode="add" />
          </div>
          {Object.values(filters).some(
            (value) =>
              value && value !== "" && value !== "createdAt" && value !== "desc"
          ) && (
            <div className="">
              <TransactionHeader currentFilters={filters} />
            </div>
          )}
          <div className="flex w-full md:w-auto items-center gap-4 justify-center">
            <TransactionFilter
              initialFilters={filters}
              onApplyFilters={handleApplyFilters}
            />
          </div>
        </div>
      </div>
      <CardContent className="px-6 mt-0 m-0 py-0">
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
          <Table>
            <TableHeader className="bg-gray-50 dark:bg-gray-900/60 p-0">
              <TableRow className="border-b border-gray-200 dark:border-gray-800">
                <TableHead className="font-semibold text-xs uppercase tracking-wider text-gray-600 dark:text-gray-400 ">
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

            <TableBody className="divide-y p-0 divide-gray-100 dark:divide-gray-800">
              {data?.transactions && data.transactions.length > 0 ? (
                data.transactions.map(
                  (transaction: TransactionWithPaymentMethod) => (
                    <TableRow
                      key={transaction.id}
                      className="group p-0 hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-all duration-200"
                    >
                      <TableCell className="font-medium max-w-60 text-wrap ">
                        <div className="flex flex-col">
                          {transaction.name}
                          {/* {transaction.description && (
                            <span className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1  transition-all duration-300 ">
                              {transaction.description}
                            </span>
                          )} */}
                        </div>
                      </TableCell>

                      <TableCell className="p-0">
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
                          className={` font-medium text-xs ${
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
                        <div className="flex items-center gap-1">
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
                          <IndianRupee className="h-3.5 w-3.5" />
                          <span className="font-bold">
                            {transaction?.total.toFixed(2)}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2 opacity-80 group-hover:opacity-100 transition-opacity">
                          <TransActionEditButton
                            transactionId={transaction.id}
                            viewTransaction={true}
                          />
                          <DeleteTransactionButton
                            transactionId={transaction.id}
                          />

                          {Array.isArray(transaction?.attachments) &&
                            transaction.attachments.length > 0 && (
                              <DownloadProofButton id={transaction.id} />
                            )}
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
              {data?.summary?.totalIncome !== undefined &&
                data?.summary?.totalIncome > 0 && (
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
                        <IndianRupee className="h-4 w-4" />
                        <span className="text-lg">
                          {data?.summary?.totalIncome.toFixed(2) || "0.00"}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              {data?.summary?.totalExpenses !== undefined &&
                data?.summary?.totalExpenses > 0 && (
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
                        <IndianRupee className="h-4 w-4" />
                        <span className="text-lg">
                          {data?.summary?.totalExpenses.toFixed(2) || "0.00"}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                )}

              <TableRow className="hover:bg-transparent border-t-2 border-gray-200 dark:border-gray-800">
                <TableCell
                  colSpan={3}
                  className="font-extrabold text-gray-900 dark:text-white"
                >
                  <div className="flex items-center gap-2">
                    <IndianRupee className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
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
                    <IndianRupee className="h-5 w-5" />
                    <span className="text-xl">
                      {Math.abs(data?.summary?.netAmount || 0).toFixed(2)}
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
              <ChevronLeft className="h-4 w-4 mr-1 text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
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
              <ChevronRight className="h-4 w-4 ml-1 text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
export default ExpenseTable;
