"use client";

import * as React from "react";
import { Cell, Pie, PieChart } from "recharts";
import { TrendingUp } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { TransactionType } from "@prisma/client";
import { getCategoryDistribution } from "../__actions/chartsAndTransactionsActions";

// Keeping the original color palettes as requested
const COLOR_PALETTES = {
  INCOME: [
    "#4ade80", // Soft Green
    "#22c55e", // Emerald
    "#16a34a", // Green
    "#15803d", // Dark Green
    "#14532d", // Deep Green
  ],
  EXPENSE: [
    "#f87171", // Soft Red
    "#ef4444", // Red
    "#dc2626", // Crimson
    "#b91c1c", // Dark Red
    "#7f1d1d", // Deep Red
  ],
};

interface CategoryData {
  category: string;
  value: number;
  fill: string;
}

const chartConfig = {
  categories: {
    label: "Categories",
  },
} satisfies ChartConfig;

export function CategoryDistributionChart() {
  const [timeRange, setTimeRange] = React.useState<"7d" | "30d" | "90d">("30d");
  const [transactionType, setTransactionType] =
    React.useState<TransactionType>("EXPENSE");
  const [chartData, setChartData] = React.useState<CategoryData[]>([]);

  React.useEffect(() => {
    const fetchData = async () => {
      const data = await getCategoryDistribution(transactionType, timeRange);

      const colorPalette = COLOR_PALETTES[transactionType];
      const coloredData = data.map((item, index) => ({
        ...item,
        fill: colorPalette[index % colorPalette.length],
      }));

      setChartData(coloredData);
    };

    fetchData();
  }, [timeRange, transactionType]);

  // Accent color based on transaction type
  const getAccentColor = () => {
    return transactionType === "INCOME" ? "border-green-500" : "border-red-500";
  };

  const getSelectStyles = () => {
    return transactionType === "INCOME"
      ? "hover:border-green-300 focus:border-green-500 focus:ring-green-200"
      : "hover:border-red-300 focus:border-red-500 focus:ring-red-200";
  };

  return (
    <Card className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-md rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg">
      <CardHeader className="pb-0 space-y-2 border-b border-gray-100 dark:border-gray-700">
        <div className="flex justify-end items-center">
          <div className="flex space-x-4">
            {/* Transaction Type Selector */}
            <Select
              value={transactionType}
              onValueChange={(v) => setTransactionType(v as TransactionType)}
            >
              <SelectTrigger
                className={`w-[140px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 ${getSelectStyles()} transition-colors`}
              >
                <SelectValue placeholder="Transaction Type" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <SelectItem
                  value="INCOME"
                  className="hover:bg-green-50 dark:hover:bg-green-900/20"
                >
                  Income
                </SelectItem>
                <SelectItem
                  value="EXPENSE"
                  className="hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  Expense
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Time Range Selector */}
            <Select
              value={timeRange}
              onValueChange={(v) => setTimeRange(v as typeof timeRange)}
            >
              <SelectTrigger
                className={`w-[140px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 ${getSelectStyles()} transition-colors`}
              >
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                {[
                  { value: "7d", label: "7 Days" },
                  { value: "30d", label: "30 Days" },
                  { value: "90d", label: "90 Days" },
                ].map((range) => (
                  <SelectItem
                    key={range.value}
                    value={range.value}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="pt-4">
          <CardTitle
            className={`text-2xl font-bold text-gray-800 dark:text-gray-100 border-l-4 pl-3 ${getAccentColor()}`}
          >
            Category Breakdown
          </CardTitle>
          <CardDescription className="capitalize text-gray-500 dark:text-gray-400 pl-4">
            {transactionType.toLowerCase()} distribution
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="flex-1 pt-6 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[200px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={{ fill: "rgba(0,0,0,0.05)" }}
              content={
                <ChartTooltipContent
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg"
                  labelClassName="font-medium text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700 pb-1 mb-1"
                  formatter={(value, name) => [
                    <span
                      key={name}
                      className="font-semibold"
                      style={{
                        color: chartData.find((d) => d.category === name)?.fill,
                      }}
                    >
                      ₹{Number(value).toFixed(2)}
                    </span>,
                    <span
                      key="category"
                      className="text-sm text-gray-600 dark:text-gray-400"
                    >
                      {name}
                    </span>,
                  ]}
                />
              }
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="category"
              cx="50%"
              cy="50%"
              innerRadius="40%"
              outerRadius="70%"
              paddingAngle={2}
              stroke="none"
              labelLine={false}
            >
              {chartData.map((d, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={d.fill}
                  stroke="#fff"
                  strokeWidth={1}
                />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex items-center justify-between pt-4 pb-5 text-sm border-t border-gray-100 dark:border-gray-700 mt-4">
        <div className="flex items-center gap-2 font-medium text-gray-600 dark:text-gray-300">
          <TrendingUp
            className={`h-4 w-4 ${transactionType === "INCOME" ? "text-green-500" : "text-red-500"}`}
          />
          Real-time category analysis
        </div>
        <div className="text-gray-500 dark:text-gray-400 text-xs">
          Hover segments for detailed breakdown
        </div>
      </CardFooter>
    </Card>
  );
}
