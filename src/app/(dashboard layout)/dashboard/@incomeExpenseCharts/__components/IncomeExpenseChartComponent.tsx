"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { getTransactionChartData } from "../__actions/chartActions"

// ... other imports remain the same

const chartConfig = {
  income: {
    label: "Income",
    color: "hsl(145, 63%, 49%)", // Vibrant green
  },
  expense: {
    label: "Expense",
    color: "hsl(356, 75%, 57%)", // Bold red
  },
} satisfies ChartConfig
interface chartDataType{
  date: string;
  income: number;
  expense: number;
}

export function IncomeExpenseChartComponent() {
  const [timeRange, setTimeRange] = React.useState<"7d" | "30d" | "90d">("7d")
  const [chartData, setChartData] = React.useState<chartDataType[]>([])

  React.useEffect(() => {
    const fetchData = async () => {
      const data = await getTransactionChartData(timeRange)
      setChartData(data)
    }
    fetchData()
  }, [timeRange])

  return (
    <Card className="bg-gradient-to-br from-[#0f172a] to-[#1e293b] border-none shadow-xl">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b border-white/10 py-5 sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle className="text-white">Income vs Expense</CardTitle>
          <CardDescription className="text-white/70">
            Financial overview for the selected period
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={(v) => setTimeRange(v as typeof timeRange)}>
          <SelectTrigger className="w-[160px] rounded-lg bg-white/5 border-white/10 text-white">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent className="rounded-xl bg-[#1e293b] border-white/10">
            <SelectItem value="90d" className="hover:bg-white/5 text-white">
              Last 3 months
            </SelectItem>
            <SelectItem value="30d" className="hover:bg-white/5 text-white">
              Last 30 days
            </SelectItem>
            <SelectItem value="7d" className="hover:bg-white/5 text-white">
              Last 7 days
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer 
          config={chartConfig} 
          className="aspect-auto h-[250px] w-full"
        >
          <BarChart 
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <defs>
              <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(145, 63%, 49%)" />
                <stop offset="100%" stopColor="hsl(145, 63%, 30%)" />
              </linearGradient>
              <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(356, 75%, 57%)" />
                <stop offset="100%" stopColor="hsl(356, 75%, 40%)" />
              </linearGradient>
            </defs>

            <CartesianGrid 
              vertical={false} 
              stroke="rgba(255,255,255,0.1)" 
              strokeDasharray="3 3"
            />

            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => new Date(value).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
              tick={{ 
                fill: "rgba(255,255,255,0.7)", 
                fontSize: 12,
                fontFamily: "var(--font-sans)"
              }}
            />

            <ChartTooltip
              cursor={{ 
                fill: 'rgba(255,255,255,0.05)', 
                stroke: "hsl(145, 63%, 49%)",
                strokeWidth: 2
              }}
              content={(
                <ChartTooltipContent 
                  className="bg-[#0f172a] border border-white/10 rounded-lg shadow-xl"
                  labelFormatter={(value) => (
                    <span className="text-sm font-medium text-white/80">
                      {new Date(value).toLocaleDateString("en-US", {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  )}
                  formatter={(value, name) => [
                    <span 
                      key={name} 
                      className="font-semibold"
                      style={{ color: name === 'income' ? 'hsl(145, 63%, 49%)' : 'hsl(356, 75%, 57%)' }}
                    >
                      ${Number(value).toFixed(2)}
                    </span>,
                    name === 'income' ? 'Income' : 'Expense'
                  ]}
                  itemStyle={{ 
                    color: '#fff',
                    padding: '4px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.05)'
                  }}
                />
              )}
            />

            <Bar
              dataKey="income"
              fill="#056517"
              radius={[6, 6, 0, 0]}
              barSize={24}
              opacity={0.9}
            />

            <Bar
              dataKey="expense"
              fill="url(#expenseGradient)"
              radius={[6, 6, 0, 0]}
              barSize={24}
              opacity={0.9}
            />

            <ChartLegend 
              content={<ChartLegendContent 
                className="font-medium text-white/80"
                // itemStyle={{ padding: '0 16px' }}
              />} 
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}