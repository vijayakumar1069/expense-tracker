import React, { ReactNode } from "react";
import "../../../app/globals.css";

export default function LayoutForDashboard({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-0">
        {/* Main content container with proper spacing */}

        {/* Hero section with subtle animation */}
        <div className="animate-fade-in-up">{children}</div>
      </div>

      {/* Footer with subtle attribution */}
      <div className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-700 text-center text-sm text-slate-500 dark:text-slate-400">
        <p>Expense Tracker Dashboard • {new Date().getFullYear()}</p>
      </div>
    </div>
  );
}
