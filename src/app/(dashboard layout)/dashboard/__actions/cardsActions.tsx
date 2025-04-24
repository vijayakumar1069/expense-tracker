// lib/data.ts
"use server";

import { requireAuth } from "@/lib/auth";
import { CATEGORIES } from "@/utils/constants/consts";
import { prisma } from "@/utils/prisma";
import { PaymentMethodType } from "@prisma/client";
import { endOfYear, format, startOfYear, subMonths } from "date-fns";
import { unstable_cache } from "next/cache";

type InvoiceStatus = "DRAFT" | "SENT" | "OVERDUE" | "PAID" | "CANCELLED";

type IncomeData = {
  totalIncome: number;
  incomeChange: number;
};

type MonthlyData = {
  name: string;
  value: number;
};

type ProfitData = {
  netProfit: number;
  profitChange: number;
  monthlyData: MonthlyData[];
};

type InvoiceStatusCount = {
  name: string;
  count: number;
  color: string;
};

type InvoiceData = {
  pendingInvoices: {
    count: number;
    percentage: number;
  };
  invoicesByStatus: InvoiceStatusCount[];
  totalAmount: {
    pending: number;
    overdue: number;
  };
  recentInvoices: {
    id: string;
    client: string;
    amount: number;
    status: InvoiceStatus;
  }[];
};

// Type for payment method expense data
type PaymentMethodExpenses = {
  cash: number;
  bank: number;
  cheque: number;
  total: number;
  percentages: {
    cash: number;
    bank: number;
    cheque: number;
  };
};

// Income data
export async function fetchIncomeData(): Promise<IncomeData> {
  try {
    // Calculate date ranges
    const today = new Date();
    const lastMonth = subMonths(today, 1);
    const { user, authenticated } = await requireAuth();
    if (!authenticated) {
      return {
        totalIncome: 0,
        incomeChange: 0,
      };
    }

    // Get total income for current month
    const currentMonthIncome = await prisma.transaction.aggregate({
      where: {
        type: "INCOME",
        userId: user?.id,
        date: {
          gte: new Date(today.getFullYear(), today.getMonth(), 1),
          lt: new Date(today.getFullYear(), today.getMonth() + 1, 0),
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Get total income for last month
    const lastMonthIncome = await prisma.transaction.aggregate({
      where: {
        type: "INCOME",
        date: {
          gte: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1),
          lt: new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0),
        },
      },
      _sum: {
        amount: true,
      },
    });

    const totalIncome = currentMonthIncome._sum.amount || 0;
    const previousIncome = lastMonthIncome._sum.amount || 0;

    // Calculate change percentage
    const incomeChange =
      previousIncome > 0
        ? Number(
            (((totalIncome - previousIncome) / previousIncome) * 100).toFixed(1)
          )
        : 0;

    return {
      totalIncome,
      incomeChange,
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return {
      totalIncome: 58750.85,
      incomeChange: 12.3,
    };
  }
}
export const fetchExpenseData = unstable_cache(
  async (user: { id: string }): Promise<FinancialYearExpenseData> => {
    const financialYearStart = startOfYear(new Date());
    const financialYearEnd = endOfYear(new Date());

    const [totalExpenseResult, expensesByCategory, monthlyExpenses] =
      await Promise.all([
        prisma.transaction.aggregate({
          where: {
            type: "EXPENSE",
            userId: user.id,
            date: {
              gte: financialYearStart,
              lte: financialYearEnd,
            },
          },
          _sum: {
            amount: true,
          },
        }),

        prisma.transaction.groupBy({
          by: ["category"],
          where: {
            type: "EXPENSE",
            userId: user.id,
            date: {
              gte: financialYearStart,
              lte: financialYearEnd,
            },
          },
          _sum: {
            amount: true,
          },
        }),

        getMonthlyExpensesForFinancialYear(user.id, financialYearStart),
      ]);

    const totalExpense = Math.abs(totalExpenseResult._sum.amount || 0);

    const topExpenseCategories = expensesByCategory
      .map((category) => {
        const categoryAmount = Math.abs(category._sum.amount || 0);
        const categoryPercentage = totalExpense
          ? Math.round((categoryAmount / totalExpense) * 100)
          : 0;

        return {
          name: category.category,
          amount: categoryAmount,
          percentage: categoryPercentage,
          color:
            CATEGORIES.find((c) => c.name === category.category)?.color ||
            "var(--color-muted)",
        };
      })
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3);

    const financialYear = {
      startDate: financialYearStart.toISOString(),
      endDate: financialYearEnd.toISOString(),
      label: `${format(financialYearStart, "MMMM yyyy")} - ${format(
        financialYearEnd,
        "MMMM yyyy"
      )}`,
    };

    return {
      totalExpense,
      topExpenseCategories,
      financialYear,
      monthlyExpenses,
    };
  },
  ["fetch-expense-data"],
  {
    revalidate: 60 * 5, // cache for 5 minutes
    tags: ["expenses"],
  }
);

// Helper function to get monthly expenses for the financial year
async function getMonthlyExpensesForFinancialYear(
  userId: string,
  startDate: Date
  // endDate: Date
): Promise<Array<{ month: string; amount: number }>> {
  // Array of month names for display
  const monthNames = [
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
    "Jan",
    "Feb",
    "Mar",
  ];

  // Array to store the monthly expenses
  const monthlyExpenses: Array<{ month: string; amount: number }> = [];

  // For each month in the financial year
  for (let i = 0; i < 12; i++) {
    // Calculate the start of the month (needs to wrap from December to January)
    const currentMonthStart = new Date(startDate);
    currentMonthStart.setMonth(startDate.getMonth() + i);
    currentMonthStart.setDate(1);
    currentMonthStart.setHours(0, 0, 0, 0);

    // Calculate the end of the month
    const currentMonthEnd = new Date(currentMonthStart);
    currentMonthEnd.setMonth(currentMonthStart.getMonth() + 1);
    currentMonthEnd.setDate(0); // Last day of current month
    currentMonthEnd.setHours(23, 59, 59, 999);

    // Query for expenses in this month
    const monthlyExpenseResult = await prisma.transaction.aggregate({
      where: {
        type: "EXPENSE",
        userId: userId,
        date: {
          gte: currentMonthStart,
          lte: currentMonthEnd,
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Add to the results array
    monthlyExpenses.push({
      month: monthNames[i],
      amount: Math.abs(monthlyExpenseResult._sum.amount || 0),
    });
  }

  return monthlyExpenses;
}

// Define the new return type
interface FinancialYearExpenseData {
  totalExpense: number;
  topExpenseCategories: Array<{
    name: string;
    amount: number;
    percentage: number;
    color: string;
  }>;
  financialYear: {
    startDate: string;
    endDate: string;
    label: string;
  };
  monthlyExpenses: Array<{
    month: string;
    amount: number;
  }>;
}

// Profit data
export async function fetchProfitData(): Promise<ProfitData> {
  try {
    const { user, authenticated } = await requireAuth();
    if (!authenticated) {
      throw new Error("Not authenticated");
    }
    // Calculate net profit
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlyData = [];

    // Get data for last 6 months
    for (let i = 5; i >= 0; i--) {
      const month = (currentMonth - i + 12) % 12;
      const year = currentYear - (month > currentMonth ? 1 : 0);

      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0);

      const monthName = format(startDate, "MMM");

      // Calculate income for month
      const incomeResult = await prisma.transaction.aggregate({
        where: {
          type: "INCOME",
          userId: user?.id,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        _sum: {
          amount: true,
        },
      });

      // Calculate expenses for month
      const expenseResult = await prisma.transaction.aggregate({
        where: {
          type: "EXPENSE",
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        _sum: {
          amount: true,
        },
      });

      const income = incomeResult._sum.amount || 0;
      const expense = Math.abs(expenseResult._sum.amount || 0);
      const profit = income - expense;

      monthlyData.push({
        name: monthName,
        value: profit,
      });
    }

    // Current quarter profit
    const currentQuarterProfit = monthlyData
      .slice(-3)
      .reduce((sum, month) => sum + month.value, 0);

    // Previous quarter profit
    const previousQuarterProfit = monthlyData
      .slice(0, 3)
      .reduce((sum, month) => sum + month.value, 0);

    // Calculate profit change
    const profitChange =
      previousQuarterProfit > 0
        ? Number(
            (
              ((currentQuarterProfit - previousQuarterProfit) /
                previousQuarterProfit) *
              100
            ).toFixed(1)
          )
        : 0;

    const netProfit = monthlyData.reduce((sum, month) => sum + month.value, 0);

    return {
      netProfit,
      profitChange,
      monthlyData,
    };
  } catch (error) {
    console.error("Error fetching profit data:", error);
    return {
      netProfit: 26340.53,
      profitChange: 15.2,
      monthlyData: [
        { name: "Jan", value: 3200 },
        { name: "Feb", value: 3850 },
        { name: "Mar", value: 4100 },
        { name: "Apr", value: 4600 },
        { name: "May", value: 5100 },
        { name: "Jun", value: 5490 },
      ],
    };
  }
}

// Invoice data
export async function fetchInvoiceData(): Promise<InvoiceData> {
  try {
    const { user, authenticated } = await requireAuth();
    if (!authenticated) {
      throw new Error("Not authenticated");
    }

    // Fetch count of invoices for the authenticated user
    const pendingInvoicesCount = await prisma.invoice.count({
      where: {
        userId: user?.id,
        status: { in: ["SENT", "PAID", "OVERDUE"] },
      },
    });

    // Fetch count of each status (SENT, PAID, OVERDUE)
    const [sentCount, paidCount, overdueCount] = await Promise.all([
      prisma.invoice.count({ where: { status: "SENT" } }),
      prisma.invoice.count({ where: { status: "PAID" } }),
      prisma.invoice.count({ where: { status: "OVERDUE" } }),
    ]);

    // Total invoice count
    const totalInvoices = await prisma.invoice.count();
    const pendingPercentage =
      (pendingInvoicesCount / (totalInvoices || 1)) * 100;

    // Aggregate amounts for SENT and OVERDUE
    const [pendingAmount, overdueAmount] = await Promise.all([
      prisma.invoice.aggregate({
        where: { status: "SENT" },
        _sum: { invoiceTotal: true },
      }),
      prisma.invoice.aggregate({
        where: { status: "OVERDUE" },
        _sum: { invoiceTotal: true },
      }),
    ]);

    // Get the 5 most recent invoices
    const recentInvoices = await prisma.invoice.findMany({
      include: { client: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    return {
      pendingInvoices: {
        count: pendingInvoicesCount,
        percentage: pendingPercentage,
      },
      invoicesByStatus: [
        { name: "Sent", count: sentCount, color: "#eab308" }, // Yellow
        { name: "Paid", count: paidCount, color: "#22c55e" }, // Green
        { name: "Overdue", count: overdueCount, color: "#f43f5e" }, // Red
      ],
      totalAmount: {
        pending: pendingAmount._sum.invoiceTotal || 0,
        overdue: overdueAmount._sum.invoiceTotal || 0,
      },
      recentInvoices: recentInvoices.map((invoice) => ({
        id: invoice.id,
        client: invoice.client.name || "",
        amount: invoice.invoiceTotal,
        status: invoice.status as InvoiceStatus,
      })),
    };
  } catch (error) {
    console.error("Error fetching invoice data:", error);

    // Fallback data
    return {
      pendingInvoices: {
        count: 12,
        percentage: 40,
      },
      invoicesByStatus: [
        { name: "Sent", count: 4, color: "#eab308" },
        { name: "Paid", count: 5, color: "#22c55e" },
        { name: "Overdue", count: 3, color: "#f43f5e" },
      ],
      totalAmount: {
        pending: 15300.75,
        overdue: 8750.25,
      },
      recentInvoices: [
        {
          id: "inv-001",
          client: "Acme Corp",
          amount: 3500,
          status: "SENT",
        },
        {
          id: "inv-002",
          client: "Globex Inc",
          amount: 2800,
          status: "OVERDUE",
        },
        {
          id: "inv-003",
          client: "Stark Industries",
          amount: 5200,
          status: "SENT",
        },
        {
          id: "inv-004",
          client: "Wayne Enterprises",
          amount: 1850,
          status: "PAID",
        },
        {
          id: "inv-005",
          client: "Umbrella Corp",
          amount: 3250,
          status: "PAID",
        },
      ],
    };
  }
}

// Get all transactions
export async function fetchAllTransactions() {
  try {
    const { user, authenticated } = await requireAuth();
    if (!authenticated) {
      throw new Error("Not authenticated");
    }
    const today = new Date();

    // Recent transactions count (last 30 days)
    const recentCount = await prisma.transaction.count({
      where: {
        userId: user?.id,
        date: {
          gte: new Date(today.setDate(today.getDate() - 30)),
        },
      },
    });

    // Weekly activity data (last 7 days)
    const weeklyData = await Promise.all(
      Array.from({ length: 7 }).map(async (_, index) => {
        const day = new Date();
        day.setDate(day.getDate() - index);
        const dayStart = new Date(day.setHours(0, 0, 0, 0));
        const dayEnd = new Date(day.setHours(23, 59, 59, 999));

        const transactions = await prisma.transaction.findMany({
          where: {
            date: {
              gte: dayStart,
              lte: dayEnd,
            },
          },
        });

        return {
          count: transactions.length,
          income: transactions
            .filter((t) => t.type === "INCOME")
            .reduce((sum, t) => sum + t.amount, 0),
          expense: transactions
            .filter((t) => t.type === "EXPENSE")
            .reduce((sum, t) => sum + t.amount, 0),
          name: day.toLocaleDateString("en-US", { weekday: "short" }),
          isToday: index === 0,
        };
      })
    );

    return {
      recentCount,
      weeklyData: weeklyData.reverse(), // Reverse to show oldest first
    };
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return {
      recentCount: 0,
      weeklyData: [],
    };
  }
}

export async function fetchClientData() {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfLastMonth = new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      1
    );
    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

    // Active clients (clients with at least one invoice)
    const activeClients = await prisma.client.count({
      where: {
        invoice: { some: {} },
      },
    });

    // Recent clients (last 5 created)
    const recentClients = await prisma.client.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { name: true, createdAt: true },
    });

    // Monthly comparison
    const [currentMonthClients, lastMonthClients] = await Promise.all([
      prisma.client.count({
        where: { createdAt: { gte: startOfMonth } },
      }),
      prisma.client.count({
        where: {
          createdAt: {
            gte: startOfLastMonth,
            lt: endOfLastMonth,
          },
        },
      }),
    ]);

    // Calculate percentage change
    const changeRate =
      lastMonthClients > 0
        ? ((currentMonthClients - lastMonthClients) / lastMonthClients) * 100
        : currentMonthClients > 0
          ? 100
          : 0;

    return {
      activeClients,
      recentClients: recentClients.map((client) => ({
        name: client.name,
        // Add avatar if available in your schema
        // createdAt: client.createdAt // Uncomment if needed
      })),
      changeRate: Number(changeRate.toFixed(1)),
    };
  } catch (error) {
    console.error("Error fetching client data:", error);
    return {
      activeClients: 0,
      recentClients: [],
      changeRate: 0,
    };
  }
}

// lib/data.ts (add this to your existing file)

// Function to fetch expenses by payment method for current month
export async function fetchExpensesByPaymentMethod(): Promise<PaymentMethodExpenses> {
  try {
    // Use the updated requireAuth that returns {user, authenticated}
    const { user, authenticated } = await requireAuth();

    if (!authenticated) {
      // Return default/empty data instead of redirecting
      return {
        cash: 0,
        bank: 0,
        cheque: 0,
        total: 0,
        percentages: {
          cash: 0,
          bank: 0,
          cheque: 0,
        },
      };
    }

    // Calculate current month date range
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    // Fetch all transactions for the current month that are expenses
    const expenses = await prisma.transaction.findMany({
      where: {
        userId: user?.id, // Now using user.id from the returned object
        type: "EXPENSE",
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      include: {
        paymentMethod: true,
      },
    });

    // Initialize amounts for each payment method
    let cashAmount = 0;
    let bankAmount = 0;
    let chequeAmount = 0;

    // Calculate totals for each payment method
    for (const expense of expenses) {
      if (expense.paymentMethod) {
        switch (expense.paymentMethod.type) {
          case PaymentMethodType.CASH:
            cashAmount += expense.total;
            break;
          case PaymentMethodType.BANK:
            bankAmount += expense.total;
            break;
          case PaymentMethodType.CHEQUE:
            chequeAmount += expense.total;
            break;
          // Don't count INVOICE in this component
          default:
            break;
        }
      }
    }

    const totalAmount = cashAmount + bankAmount + chequeAmount;

    // Calculate percentages
    const cashPercentage =
      totalAmount > 0 ? Math.round((cashAmount / totalAmount) * 100) : 0;
    const bankPercentage =
      totalAmount > 0 ? Math.round((bankAmount / totalAmount) * 100) : 0;
    const chequePercentage =
      totalAmount > 0 ? Math.round((chequeAmount / totalAmount) * 100) : 0;

    return {
      cash: cashAmount,
      bank: bankAmount,
      cheque: chequeAmount,
      total: totalAmount,
      percentages: {
        cash: cashPercentage,
        bank: bankPercentage,
        cheque: chequePercentage,
      },
    };
  } catch (error) {
    console.error("Error fetching expenses by payment method:", error);
    // Return default values in case of error
    return {
      cash: 0,
      bank: 0,
      cheque: 0,
      total: 0,
      percentages: {
        cash: 0,
        bank: 0,
        cheque: 0,
      },
    };
  }
}
