// app/actions/chartActions.ts
"use server"

import { prisma } from "@/utils/prisma"
import { TransactionType } from "@prisma/client"
import { subDays, startOfDay, endOfDay } from "date-fns"

interface CategoryData {
  category: string
  value: number
  fill: string
}

const CATEGORY_COLORS = [
  "#3f8f29", // Green
  "#de1a24", // Red
  "#FFA500", // Orange
  "#800080", // Purple
  "#00BFFF", // Blue
  "#FFD700", // Gold
]

export async function getCategoryDistribution(
  type: TransactionType,
  timeRange: "7d" | "30d" | "90d"
): Promise<CategoryData[]> {
  try {
    const now = new Date()
    const endDate = endOfDay(now)
    const startDate = startOfDay(
      subDays(now, timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90)
    )

    const transactions = await prisma.transaction.groupBy({
      by: ["category"],
      where: {
        type,
        date: { gte: startDate, lte: endDate }
      },
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } }
    })

    return transactions.map((transaction, index) => ({
      category: transaction.category,
      value: Math.abs(transaction._sum.amount || 0),
      fill: CATEGORY_COLORS[index % CATEGORY_COLORS.length]
    }))

  } catch (error) {
    console.error("Error fetching category distribution:", error)
    return []
  }
}

export async function recentTransactionsData()
{
    try {
        const transactions = await prisma.transaction.findMany({
          take: 10,
          orderBy: {
            date: 'desc'
          },
          include: {
           
            paymentMethod: true
          }
        })
    
       return transactions
    
      } catch (error) {
        console.error("Error fetching recent transactions:", error)
        return {
            success:false,
            error:error.message
        }
       
      }
}