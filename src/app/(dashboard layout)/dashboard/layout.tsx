import React, { ReactNode } from "react";
import "../../../app/globals.css";

export default function LayoutForDashboard({
  children,
  cards,
  incomeExpenseCharts,
  chartsAndTransactions,
}: {
  children: ReactNode;
  cards: ReactNode;
  incomeExpenseCharts: ReactNode;
  chartsAndTransactions: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Main content container with proper spacing */}
        <div className="space-y-6">
          {/* Hero section with subtle animation */}
          <div className="animate-fade-in-up">{children}</div>

          {/* Cards section with grid layout for responsiveness */}
          <div className="transition-all duration-300 ease-in-out rounded-xl backdrop-blur-sm bg-white/50 dark:bg-slate-800/50 shadow-sm hover:shadow-md p-5">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
              Overview
            </h2>
            {cards}
          </div>

          {/* Income/Expense section with subtle hover effects */}
          <div className="grid gap-6 md:gap-8 grid-cols-1">
            <div className="lg:col-span-2 transition-all duration-300 rounded-xl bg-white dark:bg-slate-800 shadow-sm hover:shadow-md p-5 border border-slate-100 dark:border-slate-700">
              {incomeExpenseCharts}
            </div>
          </div>
        </div>
        <div className="transition-all mt-5 duration-300 rounded-xl bg-white dark:bg-slate-800 shadow-sm hover:shadow-md p-5 border border-slate-100 dark:border-slate-700">
          {/* Sidebar charts/stats */}
          <div className="h-full flex flex-col">
            <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-4 pb-2 border-b border-slate-100 dark:border-slate-700">
              Quick Stats
            </h3>
            {chartsAndTransactions}
          </div>
        </div>

        {/* Footer with subtle attribution */}
        <div className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-700 text-center text-sm text-slate-500 dark:text-slate-400">
          <p>Expense Tracker Dashboard • {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  );
}
