"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
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
import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { getTransactionChartData } from "../__actions/chartActions";

const chartConfig = {
  income: {
    label: "Income",
    color: "hsl(142, 76%, 36%)", // Rich green
  },
  expense: {
    label: "Expense",
    color: "hsl(354, 70%, 54%)", // Vibrant red
  },
} satisfies ChartConfig;

interface chartDataType {
  date: string;
  income: number;
  expense: number;
}

export function IncomeExpenseChartComponent() {
  const [timeRange, setTimeRange] = React.useState<"7d" | "30d" | "90d">("7d");
  const [chartData, setChartData] = React.useState<chartDataType[]>([]);

  React.useEffect(() => {
    const fetchData = async () => {
      const data = await getTransactionChartData(timeRange);
      setChartData(data);
    };
    fetchData();
  }, [timeRange]);

  return (
    <Card className="bg-gradient-to-br from-white to-gray-50 border border-gray-100 shadow-lg">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b border-gray-100 py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle className="text-gray-800 font-bold">
            Income vs Expense
          </CardTitle>
          <CardDescription className="text-gray-500">
            Financial overview for the selected period
          </CardDescription>
        </div>
        <Select
          value={timeRange}
          onValueChange={(v) => setTimeRange(v as typeof timeRange)}
        >
          <SelectTrigger className="w-[160px] rounded-lg bg-white border-gray-200 text-gray-700 shadow-sm hover:bg-gray-50 transition-colors">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent className="rounded-xl bg-white border-gray-200">
            <SelectItem value="7d" className="hover:bg-gray-50 text-gray-700">
              Last 7 days
            </SelectItem>
            <SelectItem value="30d" className="hover:bg-gray-50 text-gray-700">
              Last 30 days
            </SelectItem>
            <SelectItem value="90d" className="hover:bg-gray-50 text-gray-700">
              Last 3 months
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[280px] w-full"
        >
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            barGap={4}
            barCategoryGap={16} // tighter for long-range
          >
            <defs>
              <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="hsl(142, 76%, 36%)"
                  stopOpacity={0.9}
                />
                <stop
                  offset="100%"
                  stopColor="hsl(142, 76%, 30%)"
                  stopOpacity={0.7}
                />
              </linearGradient>
              <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor="hsl(354, 70%, 54%)"
                  stopOpacity={0.9}
                />
                <stop
                  offset="100%"
                  stopColor="hsl(354, 70%, 45%)"
                  stopOpacity={0.7}
                />
              </linearGradient>
              <filter id="shadow" height="130%">
                <feDropShadow
                  dx="0"
                  dy="3"
                  stdDeviation="3"
                  floodOpacity="0.1"
                />
              </filter>
            </defs>

            <CartesianGrid
              vertical={false}
              stroke="rgba(0,0,0,0.06)"
              strokeDasharray="5 5"
            />

            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) =>
                new Date(value).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }
              tick={{
                fill: "rgba(75,85,99,0.8)",
                fontSize: 12,
                fontFamily: "var(--font-sans)",
              }}
            />

            <ChartTooltip
              cursor={{
                fill: "rgba(243,244,246,0.8)",
                radius: 4,
              }}
              content={
                <ChartTooltipContent
                  className="bg-white border border-gray-100 rounded-lg shadow-xl"
                  labelClassName="text-gray-600 border-b border-gray-100 pb-2 mb-1"
                  labelFormatter={(value) => (
                    <span className="text-sm font-medium">
                      {new Date(value).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  )}
                  formatter={(value, name) => [
                    <span
                      key={name}
                      className="font-semibold"
                      style={{
                        color:
                          name === "income"
                            ? "hsl(142, 76%, 36%)"
                            : "hsl(354, 70%, 54%)",
                      }}
                    >
                      ${Number(value).toFixed(2)}
                    </span>,
                    <span key={`${name}-label`} className="text-gray-600">
                      {name === "income" ? "Income" : "Expense"}
                    </span>,
                  ]}
                  itemStyle={{
                    color: "#4b5563",
                    padding: "4px 0",
                  }}
                />
              }
            />

            <Bar
              dataKey="income"
              fill={chartConfig.income.color}
              radius={[6, 6, 0, 0]}
              barSize={28}
              opacity={1}
              filter="url(#shadow)"
              animationDuration={1000}
            />

            <Bar
              dataKey="expense"
              fill={chartConfig.expense.color}
              radius={[6, 6, 0, 0]}
              barSize={28}
              opacity={1}
              filter="url(#shadow)"
              animationDuration={1000}
            />

            <ChartLegend
              verticalAlign="top"
              align="right"
              iconSize={12}
              iconType="circle"
              content={
                <ChartLegendContent
                  className="font-medium text-gray-700 flex items-center justify-end gap-6 mb-2"
                  // wrapperClassName="flex items-center gap-2"
                  // iconSize={8}
                  // iconClassName="rounded-full"
                />
              }
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
