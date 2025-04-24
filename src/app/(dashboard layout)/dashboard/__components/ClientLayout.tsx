// app/dashboard/layout.tsx
"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { TabSelector } from "./TabSelector";

export default function ClientLayout({
  children,
  financial,
  payment_methods,
  transactions_invoices,
  income_expense,
  category_distribution,
}: {
  children: React.ReactNode;
  financial: React.ReactNode;
  payment_methods: React.ReactNode;
  transactions_invoices: React.ReactNode;
  income_expense: React.ReactNode;
  category_distribution: React.ReactNode;
}) {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<string | null>(null);

  // Determine which tab is active based on URL
  useEffect(() => {
    if (pathname === "/dashboard") {
      setActiveTab(null);
    } else if (pathname === "/dashboard/financial") {
      setActiveTab("financial");
    } else if (pathname === "/dashboard/payment_methods") {
      setActiveTab("payment_methods");
    } else if (pathname === "/dashboard/transactions_invoices") {
      setActiveTab("transactions_invoices");
    } else if (pathname === "/dashboard/income_expense") {
      setActiveTab("income_expense");
    } else if (pathname === "/dashboard/category_distribution") {
      setActiveTab("category_distribution");
    }
  }, [pathname]);

  // Function to render the active content
  const renderActiveContent = () => {
    if (!activeTab) {
      return children; // Default dashboard view
    }

    // Return the appropriate content based on the active tab
    switch (activeTab) {
      case "financial":
        return (
          <Suspense
            fallback={<div className="p-4">Loading financial data...</div>}
          >
            {financial}
          </Suspense>
        );
      case "payment_methods":
        return (
          <Suspense
            fallback={<div className="p-4">Loading payment methods...</div>}
          >
            {payment_methods}
          </Suspense>
        );
      case "transactions_invoices":
        return (
          <Suspense
            fallback={<div className="p-4">Loading transactions...</div>}
          >
            {transactions_invoices}
          </Suspense>
        );
      case "income_expense":
        return (
          <Suspense
            fallback={<div className="p-4">Loading income vs expense...</div>}
          >
            {income_expense}
          </Suspense>
        );
      case "category_distribution":
        return (
          <Suspense
            fallback={
              <div className="p-4">Loading category distribution...</div>
            }
          >
            {category_distribution}
          </Suspense>
        );
      default:
        return children;
    }
  };

  return (
    <div className="p-6 bg-background/10 rounded-lg max-w-7xl mx-auto">
      <TabSelector activeTab={activeTab} />

      {/* Only render the active content */}
      <div className="mt-2">{renderActiveContent()}</div>
    </div>
  );
}
