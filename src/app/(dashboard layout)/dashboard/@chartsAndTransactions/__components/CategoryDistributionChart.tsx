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

// Enhanced Color Palettes
const COLOR_PALETTES = {
  INCOME: [
    "#10b981",   // Emerald Green
    "#34d399",   // Mint Green
    "#6ee7b7",   // Seafoam Green
    "#a7f3d0",   // Light Mint
    "#d1fae5",   // Pale Mint
    "#14533c",   // Dark Emerald
    "#052e16",   // Forest Green
    "#064e3b",   // Teal Deep
  ],
  EXPENSE: [
    "#ef4444",   // Vibrant Red
    "#f87171",   // Soft Red
    "#fca5a5",   // Pastel Red
    "#fee2e2",   // Light Red
    "#7f1d1d",   // Dark Maroon
    "#991b1b",   // Deep Red
    "#dc2626",   // Crimson
    "#b91c1c",   // Robust Red
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
      
      // Dynamically assign colors based on transaction type
      const colorPalette = COLOR_PALETTES[transactionType]
      const coloredData = data.map((item, index) => ({
        ...item,
        fill: colorPalette[index % colorPalette.length]
      }))

      setChartData(coloredData)
    }

    fetchData()
  }, [timeRange, transactionType])

  // Dynamic background gradient based on transaction type
  const getBackgroundGradient = () => {
    return transactionType === 'INCOME'
      ? 'from-green-900 to-green-950'
      : 'from-red-900 to-red-950'
  }

  // Dynamic tooltip formatting
  const tooltipFormatter = (value: any, name: boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | React.Key | null | undefined) => {
    const categoryColor = chartData.find(d => d.category === name)?.fill
    return [
      <span
        key={name}
        className="font-semibold"
        style={{ color: categoryColor }}
      >
        ₹{Number(value).toFixed(2)}
      </span>,
      <span key="category" className="text-sm text-white/80">
        {name}
      </span>
    ]
  }

  return (
    <Card 
      className={`
        flex flex-col 
        bg-gradient-to-br 
        ${getBackgroundGradient()} 
        border-none 
        shadow-2xl 
        transform 
        transition-all 
        duration-300 
        hover:scale-[1.02]
      `}
    >
      <CardHeader className="items-center pb-0 space-y-2">
        <div className="flex gap-4 w-full justify-between">
          {/* Transaction Type Selector */}
          <Select 
            value={transactionType} 
            onValueChange={(v) => setTransactionType(v as TransactionType)}
          >
            <SelectTrigger className="w-[140px] bg-white/10 border-white/20 text-white hover:bg-white/20">
              <SelectValue placeholder="Transaction Type" />
            </SelectTrigger>
            <SelectContent className="rounded-xl bg-gray-800 border-white/10">
              <SelectItem 
                value="INCOME" 
                className="hover:bg-green-900/30 text-white focus:bg-green-900/50"
              >
                Income
              </SelectItem>
              <SelectItem 
                value="EXPENSE" 
                className="hover:bg-red-900/30 text-white focus:bg-red-900/50"
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
            <SelectTrigger className="w-[140px] bg-white/10 border-white/20 text-white hover:bg-white/20">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent className="rounded-xl bg-gray-800 border-white/10">
              {[
                { value: "7d", label: "7 Days" },
                { value: "30d", label: "30 Days" },
                { value: "90d", label: "90 Days" }
              ].map(range => (
                <SelectItem 
                  key={range.value} 
                  value={range.value} 
                  className="hover:bg-white/10 text-white"
                >
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <CardTitle className="text-white pt-4 text-2xl font-bold">
          Category Breakdown
        </CardTitle>
        <CardDescription className="text-white/70 capitalize">
          {transactionType.toLowerCase()} distribution
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 pb-0">
        <ChartContainer 
          config={chartConfig} 
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={{ fill: 'rgba(255,255,255,0.1)' }}
              content={(
                <ChartTooltipContent
                  className="bg-gray-900 border border-white/10 rounded-lg shadow-xl text-white"
                  formatter={tooltipFormatter}
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
                  fill="white"
                  className="text-xs font-medium"
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

      <CardFooter className="flex-col gap-2 text-sm pt-4">
        <div className="flex items-center gap-2 font-medium leading-none text-white/80">
          <TrendingUp className="h-4 w-4" />
          Real-time category analysis
        </div>
        <div className="leading-none text-white/60">
          Hover segments for detailed breakdown
        </div>
      </CardFooter>
    </Card>
  )
}
