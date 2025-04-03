// components/expense-payment-methods.tsx
import { Suspense } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchExpensesByPaymentMethod } from "../__actions/cardsActions";
import { PaymentMethodCard } from "./PaymentMethodCard";

function PaymentMethodSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
        <Skeleton className="h-3 w-24 mt-1" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-28 mb-4" />
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-8" />
          </div>
          <Skeleton className="h-1 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}

async function ExpensePaymentMethodsContent() {
  const expenseData = await fetchExpensesByPaymentMethod();

  // Format currency function
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 w-full gap-4">
      <PaymentMethodCard
        type="cash"
        amount={expenseData.cash}
        percentage={expenseData.percentages.cash}
      />
      <PaymentMethodCard
        type="bank"
        amount={expenseData.bank}
        percentage={expenseData.percentages.bank}
      />
      <PaymentMethodCard
        type="cheque"
        amount={expenseData.cheque}
        percentage={expenseData.percentages.cheque}
      />

      <Card className="">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          <p className="text-xs text-muted-foreground">
            Payment method summary
          </p>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(expenseData.total)}
          </div>

          <div className="mt-4 space-y-2">
            <div className="grid grid-cols-3 lg:grid-cols-2 gap-1 text-xs">
              <div>
                <span className="inline-block h-2 w-2 rounded bg-green-500 mr-1"></span>
                <span className="text-muted-foreground">Cash</span>
              </div>
              <div>
                <span className="inline-block h-2 w-2 rounded bg-blue-500 mr-1"></span>
                <span className="text-muted-foreground">Bank</span>
              </div>
              <div>
                <span className="inline-block h-2 w-2 rounded bg-amber-500 mr-1"></span>
                <span className="text-muted-foreground">Cheque</span>
              </div>
            </div>

            <div className="flex h-2 w-full overflow-hidden rounded bg-gray-100">
              {expenseData.percentages.cash > 0 && (
                <div
                  className="bg-green-500"
                  style={{ width: `${expenseData.percentages.cash}%` }}
                />
              )}
              {expenseData.percentages.bank > 0 && (
                <div
                  className="bg-blue-500"
                  style={{ width: `${expenseData.percentages.bank}%` }}
                />
              )}
              {expenseData.percentages.cheque > 0 && (
                <div
                  className="bg-amber-500"
                  style={{ width: `${expenseData.percentages.cheque}%` }}
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function ExpensePaymentMethods() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Expenses by Payment Method
        </h2>
        <p className="text-muted-foreground">
          Track and analyze your current month expenses across different payment
          methods.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <PaymentMethodSkeleton />
            <PaymentMethodSkeleton />
            <PaymentMethodSkeleton />
            <PaymentMethodSkeleton />
          </div>
        }
      >
        <ExpensePaymentMethodsContent />
      </Suspense>
    </div>
  );
}
