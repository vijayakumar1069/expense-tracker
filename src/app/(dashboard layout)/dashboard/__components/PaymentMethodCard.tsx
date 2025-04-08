// components/payment-method-card.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BanknoteIcon, CreditCardIcon, ScrollTextIcon } from "lucide-react";

interface PaymentMethodCardProps {
  type: "cash" | "bank" | "cheque";
  amount: number;
  percentage: number;
  className?: string;
}

// Configuration for each payment method
const methodConfig = {
  cash: {
    title: "Cash Payments",
    icon: BanknoteIcon,
    color: "text-green-500",
    bgColor: "bg-green-50",
  },
  bank: {
    title: "Bank Transfers",
    icon: CreditCardIcon,
    color: "text-blue-500",
    bgColor: "bg-blue-50",
  },
  cheque: {
    title: "Cheque Payments",
    icon: ScrollTextIcon,
    color: "text-amber-500",
    bgColor: "bg-amber-50",
  },
};

// Format currency function
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export function PaymentMethodCard({
  type,
  amount,
  percentage,
  className,
}: PaymentMethodCardProps) {
  const config = methodConfig[type];
  const Icon = config.icon;

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{config.title}</CardTitle>
          <div className={`p-2 rounded-full ${config.bgColor}`}>
            <Icon className={`h-4 w-4 ${config.color}`} />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">Current month</p>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatCurrency(amount)}</div>
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">of total expenses</span>
            <span className="font-medium">{percentage}%</span>
          </div>
          {/* <Progress value={percentage} className="h-1" /> */}
        </div>
      </CardContent>
    </Card>
  );
}
