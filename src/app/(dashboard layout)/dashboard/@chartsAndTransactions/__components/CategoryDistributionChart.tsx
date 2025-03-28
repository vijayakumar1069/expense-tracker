"use client"

import * as React from "react"
import { Cell, Pie, PieChart, Label } from "recharts"
import { TrendingUp } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"

import { TransactionType } from "@prisma/client"
import { getCategoryDistribution } from "../__actions/chartsAndTransactionsActions"

// Sophisticated Color Palette
const COLOR_PALETTES = {
  INCOME: [
    "#4ade80",   // Soft Green
    "#22c55e",   // Emerald
    "#16a34a",   // Green
    "#15803d",   // Dark Green
    "#14532d",   // Deep Green
  ],
  EXPENSE: [
    "#f87171",   // Soft Red
    "#ef4444",   // Red
    "#dc2626",   // Crimson
    "#b91c1c",   // Dark Red
    "#7f1d1d",   // Deep Red
  ]
}

interface CategoryData {
  category: string
  value: number
  fill: string
}

const chartConfig = {
  categories: {
    label: "Categories",
  },
} satisfies ChartConfig

export function CategoryDistributionChart() {
  const [timeRange, setTimeRange] = React.useState<"7d" | "30d" | "90d">("30d")
  const [transactionType, setTransactionType] = React.useState<TransactionType>("EXPENSE")
  const [chartData, setChartData] = React.useState<CategoryData[]>([])

  React.useEffect(() => {
    const fetchData = async () => {
      const data = await getCategoryDistribution(transactionType, timeRange)
      
      const colorPalette = COLOR_PALETTES[transactionType]
      const coloredData = data.map((item, index) => ({
        ...item,
        fill: colorPalette[index % colorPalette.length]
      }))

      setChartData(coloredData)
    }

    fetchData()
  }, [timeRange, transactionType])

  // Dynamic background and text colors
  const getBackgroundClasses = () => {
    return transactionType === 'INCOME'
      ? "bg-gradient-to-br from-green-50 to-green-100 text-green-900"
      : "bg-gradient-to-br from-red-50 to-red-100 text-red-900"
  }

  const tooltipFormatter = (value: number, name: string) => {
    const categoryColor = chartData.find(d => d.category === name)?.fill
    return [
      <span
        key={name}
        className="font-semibold"
        style={{ color: categoryColor }}
      >
        ₹{Number(value).toFixed(2)}
      </span>,
      <span key="category" className="text-sm text-gray-600">
        {name}
      </span>
    ]
  }

  return (
    <Card 
      className={`
        flex flex-col 
        ${getBackgroundClasses()}
        border-none 
        shadow-lg 
        rounded-xl 
        overflow-hidden 
        transition-all 
        duration-300 
        hover:shadow-xl
      `}
    >
      <CardHeader className="pb-0 space-y-2 border-b border-gray-200/50">
        <div className="flex justify-end items-center">
          <div className="flex space-x-4 ">
            {/* Transaction Type Selector */}
            <Select 
              value={transactionType} 
              onValueChange={(v) => setTransactionType(v as TransactionType)}
            >
              <SelectTrigger className="w-[140px] bg-white/60 border border-gray-200">
                <SelectValue placeholder="Transaction Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INCOME" className="hover:bg-green-100">
                  Income
                </SelectItem>
                <SelectItem value="EXPENSE" className="hover:bg-red-100">
                  Expense
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Time Range Selector */}
            <Select 
              value={timeRange} 
              onValueChange={(v) => setTimeRange(v as typeof timeRange)}
            >
              <SelectTrigger className="w-[140px] bg-white/60 border border-gray-200">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                {[
                  { value: "7d", label: "7 Days" },
                  { value: "30d", label: "30 Days" },
                  { value: "90d", label: "90 Days" }
                ].map(range => (
                  <SelectItem 
                    key={range.value} 
                    value={range.value}
                    className="hover:bg-gray-100"
                  >
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="pt-4">
          <CardTitle className="text-2xl font-bold">
            Category Breakdown
          </CardTitle>
          <CardDescription className="capitalize">
            {transactionType.toLowerCase()} distribution
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="flex-1 pt-6 pb-0">
        <ChartContainer 
          config={chartConfig} 
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={{ fill: 'rgba(0,0,0,0.05)' }}
              content={(
                <ChartTooltipContent
                  className="bg-white border border-gray-200 rounded-lg shadow-lg"
                  
                />
              )}
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
              label={({ category, percent }) => (
                <Label
                  position="outside"
                  className="text-xs font-medium text-gray-700"
                  offset={20}
                >
                  {`${category} (${(percent * 100).toFixed(0)}%)`}
                </Label>
              )}
            >
              {chartData.map((d, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={d.fill}
                  stroke="none"
                />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex-col gap-2 pt-4 pb-6 text-sm border-t border-gray-200/50">
        <div className="flex items-center gap-2 font-medium text-gray-600">
          <TrendingUp className="h-4 w-4" />
          Real-time category analysis
        </div>
        <div className="text-gray-500">
          Hover segments for detailed breakdown
        </div>
      </CardFooter>
    </Card>
  )
}
