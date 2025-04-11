import { fetchExpenseData } from "../__actions/cardsActions";
import { TrendingDown, Calendar } from "lucide-react";
import TopCategories from "./TopCategories";

export default async function ExpenseCard() {
  const { totalExpense, topExpenseCategories, financialYear, monthlyExpenses } =
    await fetchExpenseData();

  // Array of 12 unique color gradients for each month
  const monthColors = [
    { from: "#FF6B6B", to: "#FF8787" }, // April - Red
    { from: "#F59E0B", to: "#FBBF24" }, // May - Amber
    { from: "#10B981", to: "#34D399" }, // June - Emerald
    { from: "#3B82F6", to: "#60A5FA" }, // July - Blue
    { from: "#8B5CF6", to: "#A78BFA" }, // August - Violet
    { from: "#EC4899", to: "#F472B6" }, // September - Pink
    { from: "#06B6D4", to: "#22D3EE" }, // October - Cyan
    { from: "#16A34A", to: "#4ADE80" }, // November - Green
    { from: "#7C3AED", to: "#A78BFA" }, // December - Purple
    { from: "#EF4444", to: "#FCA5A5" }, // January - Red
    { from: "#0EA5E9", to: "#7DD3FC" }, // February - Sky Blue
    { from: "#F97316", to: "#FB923C" }, // March - Orange
  ];

  // Calculate the highest monthly expense for relative scaling
  const maxMonthlyExpense = Math.max(...monthlyExpenses.map((m) => m.amount));

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100">
      {/* Header with financial year indicator */}
      <div className="p-2 bg-gradient-to-r from-rose-50 to-indigo-50 flex items-center justify-between relative">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Expense Overview
          </h3>
          <div className="flex items-center mt-1 text-sm text-gray-500">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{financialYear.label}</span>
          </div>
        </div>
        <div className="h-12 w-12 rounded-full bg-rose-100 flex items-center justify-center">
          <TrendingDown className="h-6 w-6 text-rose-500" />
        </div>
      </div>

      {/* Main content */}
      <div className="p-5 relative">
        {/* Total amount with decoration */}
        <div className="relative">
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 h-14 w-1 bg-gradient-to-b from-rose-400 to-rose-600 rounded-full"></div>
          <div className="ml-4 relative">
            <p className="text-sm text-gray-500 font-medium">Total Expenses</p>
            <p className="text-xl font-bold text-gray-800">
              ${totalExpense.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Top Categories Button - Fixed Position */}
        <div className="w-full ">
          <TopCategories categories={topExpenseCategories} />
        </div>

        {/* Monthly Chart - Always in the same position */}
        <div className="mt-10 p-3">
          <div className="flex h-40 items-end justify-between space-x-1.5">
            {monthlyExpenses.map((month, index) => {
              const heightPercentage = (month.amount / maxMonthlyExpense) * 100;
              const colorGradient = monthColors[index];

              return (
                <div
                  key={index}
                  className="flex flex-col items-center h-full justify-end"
                >
                  <div
                    className="w-8 rounded-t-md transition-all duration-500 group relative"
                    style={{
                      height: `${Math.max(heightPercentage, 5)}%`,
                      backgroundImage: `linear-gradient(to top, ${colorGradient.from}, ${colorGradient.to})`,
                      backgroundColor: colorGradient.from,
                      boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                    }}
                  >
                    {/* Tooltip */}
                    <div
                      className={`absolute ${month.amount > 0 ? "opacity-100" : "opacity-0"} 
              group-hover:opacity-100 -top-10 left-1/2 -translate-x-1/2 text-white text-xs 
              rounded py-1 px-2 min-w-[70px] text-center pointer-events-none transition-opacity`}
                      style={{
                        background: `linear-gradient(to right, ${colorGradient.from}, ${colorGradient.to})`,
                      }}
                    >
                      ${month.amount.toLocaleString()}
                    </div>
                  </div>
                  <span className="text-xs mt-1 text-gray-500">
                    {month.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
