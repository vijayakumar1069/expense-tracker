// app/dashboard/layout.tsx

import { getAuthUser } from "@/lib/auth";
import ClientLayout from "./__components/ClientLayout";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
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
  // Server-side auth check
  const user = await getAuthUser();

  // Single redirect point for the entire dashboard
  if (!user) {
    redirect("/login");
  }
  return (
    <ClientLayout
      financial={financial}
      payment_methods={payment_methods}
      transactions_invoices={transactions_invoices}
      income_expense={income_expense}
      category_distribution={category_distribution}
    >
      {children}
    </ClientLayout>
  );
}
