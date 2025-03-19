"use client";
import { useState } from "react";
// import { Transaction } from "@prisma/client";
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

const ITEMS_PER_PAGE = 5;

const ExpenseTable = () => {
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading } = useQuery<TransactionResponse>({
    queryKey: ["transactions", currentPage],
    queryFn: async () => {
      const res = await fetch(
        `/api/get-all-transactions?page=${currentPage}&limit=${ITEMS_PER_PAGE}`
      );
      return await res.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
    // cacheTime: 30 * 60 * 1000, // Keep cache for 30 minutes
  });

  const getTransactionStatusColor = (type: string) => {
    return type === "INCOME"
      ? "bg-green-500/10 text-green-500"
      : "bg-red-500/10 text-red-500";
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

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.transactions.map(
                (transaction: TransactionWithPaymentMethod) => (
                  <TableRow
                    key={transaction.id}
                    className="group hover:bg-muted/50 transition-colors"
                  >
                    <TableCell className="font-medium max-w-40 text-wrap">
                      <div className="flex flex-col">
                        <span className="text-black">{transaction.name}</span>
                        {transaction.description && (
                          <span className="text-sm text-muted-foreground truncate text-wrap">
                            {transaction.description}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    <CategoryBadge categoryName={transaction.category} />
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(transaction.date), "MMM dd, yyyy")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={getTransactionStatusColor(transaction.type)}
                      >
                        {transaction.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{transaction?.paymentMethod.type}</TableCell>
                    <TableCell className="text-right">
                      <div
                        className={`flex items-center justify-end gap-1 font-medium ${
                          transaction.type === "INCOME"
                            ? "text-green-500"
                            : "text-red-500"
                        }`}
                      >
                        {transaction.type === "INCOME" ? "+" : "-"}
                        <DollarSign className="h-3 w-3" />
                        {transaction?.amount.toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {/* <Button size="sm" variant="outline">
                      Edit
                    </Button> */}
                      <TransActionEditButton transactionId={transaction.id} />
                      <DeleteTransactionButton transactionId={transaction.id} />
                    </TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
            <TableFooter>
              <TableRow className="bg-gray-100 w-full">
                <TableCell colSpan={3}>Total Amount</TableCell>
                <TableCell className="text-right" colSpan={3}>
                  <div className="flex items-center justify-end gap-1">
                    <DollarSign className="h-4 w-4" />
                    {data?.summary?.netAmount.toFixed(2)}
                  </div>
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between px-2 mt-4">
          <div className="text-sm text-muted-foreground">
            Page {currentPage} of {data?.pagination.totalPages || 1}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1 || isLoading}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => prev + 1)}
              disabled={
                currentPage === data?.pagination.totalPages || isLoading
              }
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExpenseTable;
