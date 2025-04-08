"use client";
import { ChartContainer } from "@/components/ui/chart";
import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const MonthlyExpenseVisualization = () => {
  // Sample data - replace with your actual data
  const [monthlyExpenses] = useState([
    { month: "Apr", amount: 2500, fill: "hsl(var(--chart-1))" },
    { month: "May", amount: 2800, fill: "hsl(var(--chart-1))" },
    { month: "Jun", amount: 2600, fill: "hsl(var(--chart-1))" },
    { month: "Jul", amount: 2700, fill: "hsl(var(--chart-1))" },
    { month: "Aug", amount: 2900, fill: "hsl(var(--chart-1))" },
    { month: "Sep", amount: 2750, fill: "hsl(var(--chart-1))" },
    { month: "Oct", amount: 2650, fill: "hsl(var(--chart-1))" },
    { month: "Nov", amount: 2950, fill: "hsl(var(--chart-1))" },
    { month: "Dec", amount: 3500, fill: "hsl(var(--chart-1))" },
    { month: "Jan", amount: 2100, fill: "hsl(var(--chart-1))" },
    { month: "Feb", amount: 2300, fill: "hsl(var(--chart-1))" },
    { month: "Mar", amount: 2400, fill: "hsl(var(--chart-1))" },
  ]);

  // Filter out months with zero amount
  const filteredExpenses = monthlyExpenses.filter((month) => month.amount > 0);

  // Custom visualization without recharts option
  const CustomVisualization = () => {
    // Calculate the maximum expense for relative scaling
    const maxMonthlyExpense = Math.max(...monthlyExpenses.map((m) => m.amount));

    return (
      <div className="w-full">
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          Monthly Trend
        </h4>
        <div className="flex h-60 items-end justify-between space-x-1 px-1">
          {monthlyExpenses.map((month, index) => {
            // Calculate height percentage with a minimum visible height if amount > 0
            const heightPercentage =
              month.amount > 0
                ? Math.max((month.amount / maxMonthlyExpense) * 100, 5)
                : 0;

            return (
              <div key={index} className="flex flex-col items-center flex-1">
                {month.amount > 0 ? (
                  <>
                    <div className="relative w-full max-w-[30px] min-w-[20px] group">
                      <div
                        className="w-full bg-gradient-to-t from-rose-500 to-rose-300 rounded-t-md transition-all duration-300 hover:from-rose-600 hover:to-rose-400 shadow-sm"
                        style={{ height: `${heightPercentage}%` }}
                      />

                      {/* Improved tooltip */}
                      <div className="absolute opacity-0 group-hover:opacity-100 -top-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 min-w-[80px] text-center pointer-events-none transition-opacity z-10">
                        ${month.amount.toLocaleString()}
                      </div>
                    </div>
                    <span className="text-xs mt-2 text-gray-600 font-medium">
                      {month.month}
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-full max-w-[30px] min-w-[20px] h-0 bg-transparent" />
                    <span className="text-xs mt-2 text-gray-400">
                      {month.month}
                    </span>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Recharts visualization option
  const RechartsVisualization = () => {
    return (
      <div className="w-full">
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          Monthly Expense Trend
        </h4>
        <div className="h-60 w-full">
          <ChartContainer config={{}}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={filteredExpenses}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                barGap={2}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  opacity={0.2}
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tickMargin={8}
                  fontSize={12}
                  stroke="#94a3b8"
                />
                <Tooltip
                  content={(props) => {
                    const { active, payload } = props;
                    if (active && payload?.[0]?.value) {
                      return (
                        <div className="bg-white p-2 shadow-md rounded-lg border">
                          <div className="text-sm font-medium">
                            ${payload[0].value.toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {payload[0].payload.month}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="amount"
                  radius={[4, 4, 0, 0]}
                  className="fill-primary"
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </div>
    );
  };

  // Toggle between visualization types
  const [useRecharts, setUseRecharts] = useState(false);

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800">
          Monthly Expenses
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setUseRecharts(false)}
            className={`px-3 py-1 text-xs rounded-md transition-all ${
              !useRecharts
                ? "bg-rose-100 text-rose-600 font-medium"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            Bar Chart
          </button>
          <button
            onClick={() => setUseRecharts(true)}
            className={`px-3 py-1 text-xs rounded-md transition-all ${
              useRecharts
                ? "bg-rose-100 text-rose-600 font-medium"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            Recharts
          </button>
        </div>
      </div>

      {useRecharts ? <RechartsVisualization /> : <CustomVisualization />}

      <div className="mt-4 pt-4 border-t text-sm text-gray-500">
        <p>Showing financial year expenses by month</p>
      </div>
    </div>
  );
};

export default MonthlyExpenseVisualization;
