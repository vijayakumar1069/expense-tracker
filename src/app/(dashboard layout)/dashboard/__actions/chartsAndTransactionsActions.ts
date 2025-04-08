// app/actions/chartActions.ts
"use server"

import { requireAuth } from "@/lib/auth"
import { prisma } from "@/utils/prisma"
import { PaymentMethodType } from "@/utils/types"
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
    const user = await requireAuth()
    if (!user) {
      throw new Error("Not authenticated")
    }
    const now = new Date()
    const endDate = endOfDay(now)
    const startDate = startOfDay(
      subDays(now, timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90)
    )

    const transactions = await prisma.transaction.groupBy({
      by: ["category"],
      where: {
        type,
        userId: user.id,
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
interface TransactionWithRelations {
  id: string;

  type: TransactionType;
  name: string;
  description?: string;
  amount: number;
  tax?: string;
  total: number;
  date: Date;
  category: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;

  paymentMethod?: {
    type: PaymentMethodType;
    receivedBy?: string;
    bankName?: string;
    chequeNo?: string;
    chequeDate?: Date;
    invoiceNo?: string;
  };
  attachments?: Array<{
    id: string;
    url: string;
  }>;
}

type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export async function recentTransactionsData(): Promise<ApiResponse<TransactionWithRelations[]>> {
  try {
    const user = await requireAuth()
    if (!user) {
      throw new Error("Not authenticated")
    }
    const transactions = await prisma.transaction.findMany({
      where: { userId: user.id },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        paymentMethod: true
      }
    });

    const mappedTransactions = transactions.map(t => ({
      id: t.id,
      type: t.type as TransactionType,
      name: t.name,
      description: t.description ?? undefined,
      amount: t.amount,
      tax: t.tax ?? undefined,
      total: t.total,
      date: t.date,
      category: t.category,
      userId: t.userId,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
      paymentMethod: t.paymentMethod ? {
        type: t.paymentMethod.type as PaymentMethodType,
        receivedBy: t.paymentMethod.receivedBy ?? undefined,
        bankName: t.paymentMethod.bankName ?? undefined,
        chequeNo: t.paymentMethod.chequeNo ?? undefined,
        chequeDate: t.paymentMethod.chequeDate ?? undefined,
        invoiceNo: t.paymentMethod.invoiceNo ?? undefined
      } : undefined,
      attachments: []
    }));

    return { success: true, data: mappedTransactions };

  } catch (error) {
    console.error("Error fetching recent transactions:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}