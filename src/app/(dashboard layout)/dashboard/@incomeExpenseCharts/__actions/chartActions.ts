"use server";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/utils/prisma";
import { subDays, startOfDay, endOfDay, formatISO } from "date-fns";

interface returnType {
  date: string;
  income: number;
  expense: number;
}

interface DailyTotal {
  income: number;
  expense: number;
}

export async function getTransactionChartData(
  timeRange: "7d" | "30d" | "90d"
): Promise<returnType[]> {
  try {
    const user = await requireAuth();
    if (!user) {
      throw new Error("Not authenticated");
    }
    // Validate input
    if (!["7d", "30d", "90d"].includes(timeRange)) {
      throw new Error("Invalid time range specified");
    }

    // Calculate date range
    const now = new Date();
    const endDate = endOfDay(now);
    const startDate = startOfDay(
      subDays(now, timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90)
    );

    // Fetch transactions
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: user.id,
        date: { gte: startDate, lte: endDate },
      },
      select: { date: true, type: true, amount: true },
    });

    // Initialize daily totals
    const dailyTotals = new Map<string, DailyTotal>();
    let currentDate = startDate;

    while (currentDate <= endDate) {
      const dateKey = formatISO(currentDate, { representation: "date" });
      dailyTotals.set(dateKey, { income: 0, expense: 0 });
      currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
    }

    // Process transactions
    transactions.forEach(({ date, type, amount }) => {
      const dateKey = formatISO(date, { representation: "date" });
      const totals = dailyTotals.get(dateKey) || { income: 0, expense: 0 };

      if (type === "INCOME") {
        totals.income += amount;
      } else {
        totals.expense += Math.abs(amount);
      }

      dailyTotals.set(dateKey, totals);
    });
    // Convert to sorted array
    return Array.from(dailyTotals)
      .map(([date, totals]) => ({
        date,
        income: Number(totals.income.toFixed(2)),
        expense: Number(totals.expense.toFixed(2)),
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  } catch (error) {
    if (error instanceof Error) {
      console.error(`ChartData Error: ${error.message}`, error.stack);
    } else {
      console.error("Unexpected chart data error:", error);
    }
    return [];
  }
}