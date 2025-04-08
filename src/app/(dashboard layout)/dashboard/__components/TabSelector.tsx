// app/dashboard/__components/TabSelector.tsx
"use client";

import { useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMemo } from "react";

export function TabSelector({ activeTab }: { activeTab: string | null }) {
  const router = useRouter();

  // Define tab configurations
  const tabs = useMemo(
    () => [
      {
        path: "/dashboard/financial",
        label: "Financial Overview",
        value: "financial",
      },
      {
        path: "/dashboard/payment_methods",
        label: "Payment Methods",
        value: "payment_methods",
      },
      {
        path: "/dashboard/transactions_invoices",
        label: "Transactions & Invoices",
        value: "transactions_invoices",
      },
      {
        path: "/dashboard/income_expense",
        label: "Income vs Expense",
        value: "income_expense",
      },
      {
        path: "/dashboard/category_distribution",
        label: "Category Distribution",
        value: "category_distribution",
      },
    ],
    []
  );

  // Handle tab click
  const handleTabClick = (value: string) => {
    // Find the tab with matching value
    const tab = tabs.find((t) => t.value === value);

    if (tab) {
      // If the clicked tab is already active, navigate back to dashboard (empty state)
      if (activeTab === value) {
        router.push("/dashboard");
      } else {
        // Otherwise, navigate to the tab's path
        router.push(tab.path);
      }
    }
  };

  return (
    <Tabs value={activeTab || ""} className="w-full rounded-xl">
      <TabsList className="flex w-full overflow-x-auto px-1 py-2 bg-white border-b gap-1 h-auto md:h-12 rounded-xl">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            onClick={() => handleTabClick(tab.value)}
            className="rounded-lg px-4 py-2 text-sm font-medium text-black data-[state=active]:text-primary data-[state=active]:bg-blue-100 data-[state=active]:border-b-2 data-[state=active]:border-primary whitespace-nowrap"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
