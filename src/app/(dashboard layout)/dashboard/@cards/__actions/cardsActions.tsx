// lib/data.ts
"use server";

import { prisma } from '@/utils/prisma';
import { addDays, format, subDays, subMonths } from 'date-fns';


// Types definitions
// type TransactionType = 'INCOME' | 'EXPENSE';
type InvoiceStatus = 'DRAFT' | 'SENT' | 'OVERDUE' | 'PAID' | 'CANCELLED';

type IncomeData = {
  totalIncome: number;
  incomeChange: number;
};

type ExpenseCategory = {
  name: string;
  amount: number;
  percentage: number;
  color: string;
};

type ExpenseData = {
  totalExpense: number;
  topExpenseCategories: ExpenseCategory[];
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
    dueDate: Date;
  }[];
};

// Helper function to format currency
// export const formatCurrency = (amount: number): string => {
//   return new Intl.NumberFormat('en-US', {
//     style: 'currency',
//     currency: 'USD',
//     minimumFractionDigits: 2,
//     maximumFractionDigits: 2,
//   }).format(amount);
// };

// Income data
export async function fetchIncomeData(): Promise<IncomeData> {
  try {
    // Calculate date ranges
    const today = new Date();
    const lastMonth = subMonths(today, 1);
    
    // Get total income for current month
    const currentMonthIncome = await prisma.transaction.aggregate({
      where: {
        type: 'INCOME',
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
        type: 'INCOME',
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
    const incomeChange = previousIncome > 0 
      ? Number((((totalIncome - previousIncome) / previousIncome) * 100).toFixed(1))
      : 0;
    
    return {
      totalIncome,
      incomeChange,
    };
  } catch (error) {
    console.error('Error fetching income data:', error);
    return {
      totalIncome: 58750.85,
      incomeChange: 12.3,
    };
  }
}

// Expense data
export async function fetchExpenseData(): Promise<ExpenseData> {
  try {
    // Get total expenses
    const totalExpenseResult = await prisma.transaction.aggregate({
      where: {
        type: 'EXPENSE',
      },
      _sum: {
        amount: true,
      },
    });
    
    const totalExpense = Math.abs(totalExpenseResult._sum.amount || 0);
    
    // Get expenses by category
    const expensesByCategory = await prisma.transaction.groupBy({
      by: ['category'],
      where: {
        type: 'EXPENSE',
      },
      _sum: {
        amount: true,
      },
    });
    
    // Map categories to colors and calculate percentages
    const categoryColors: Record<string, string> = {
      'Food': 'var(--color-food)',
      'Bills': 'var(--color-bills)',
      'Transport': 'var(--color-transport)',
      'Shopping': 'var(--color-shopping)',
      'Health': 'var(--color-health)',
      'Housing': 'var(--color-housing)',
      'Entertainment': 'var(--color-entertainment)',
      'Other': 'var(--color-muted)',
    };
    
    const topExpenseCategories = expensesByCategory
      .map(category => ({
        name: category.category,
        amount: Math.abs(category._sum.amount || 0),
        percentage: Math.round((Math.abs(category._sum.amount || 0) / totalExpense) * 100),
        color: categoryColors[category.category] || 'var(--color-muted)',
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3);
    
    return {
      totalExpense,
      topExpenseCategories,
    };
  } catch (error) {
    console.error('Error fetching expense data:', error);
    return {
      totalExpense: 32410.32,
      topExpenseCategories: [
        { name: 'Housing', amount: 12500, percentage: 38, color: 'var(--color-housing)' },
        { name: 'Food', amount: 8200, percentage: 25, color: 'var(--color-food)' },
        { name: 'Transport', amount: 6100, percentage: 19, color: 'var(--color-transport)' },
      ],
    };
  }
}

// Profit data
export async function fetchProfitData(): Promise<ProfitData> {
  try {
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
      
      const monthName = format(startDate, 'MMM');
      
      // Calculate income for month
      const incomeResult = await prisma.transaction.aggregate({
        where: {
          type: 'INCOME',
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
          type: 'EXPENSE',
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
    const currentQuarterProfit = monthlyData.slice(-3).reduce((sum, month) => sum + month.value, 0);
    
    // Previous quarter profit
    const previousQuarterProfit = monthlyData.slice(0, 3).reduce((sum, month) => sum + month.value, 0);
    
    // Calculate profit change
    const profitChange = previousQuarterProfit > 0
      ? Number((((currentQuarterProfit - previousQuarterProfit) / previousQuarterProfit) * 100).toFixed(1))
      : 0;
    
    const netProfit = monthlyData.reduce((sum, month) => sum + month.value, 0);
    
    return {
      netProfit,
      profitChange,
      monthlyData,
    };
  } catch (error) {
    console.error('Error fetching profit data:', error);
    return {
      netProfit: 26340.53,
      profitChange: 15.2,
      monthlyData: [
        { name: 'Jan', value: 3200 },
        { name: 'Feb', value: 3850 },
        { name: 'Mar', value: 4100 },
        { name: 'Apr', value: 4600 },
        { name: 'May', value: 5100 },
        { name: 'Jun', value: 5490 },
      ],
    };
  }
}

// Invoice data
export async function fetchInvoiceData(): Promise<InvoiceData> {
  try {
    // Fetch pending invoices
    const pendingInvoicesCount = await prisma.invoice.count({
      where: {
        status: {
          in: ['DRAFT', 'SENT', 'OVERDUE'],
        },
      },
    });
    
    // Count invoices by status
    const statusCounts = await Promise.all([
      prisma.invoice.count({ where: { status: 'DRAFT' } }),
      prisma.invoice.count({ where: { status: 'SENT' } }),
      prisma.invoice.count({ where: { status: 'OVERDUE' } }),
    ]);
    
    // Total invoices
    const totalInvoices = await prisma.invoice.count();
    
    // Calculate percentage
    const pendingPercentage = (pendingInvoicesCount / (totalInvoices || 1)) * 100;
    
    // Get pending and overdue amounts
    const pendingAmount = await prisma.invoice.aggregate({
      where: {
        status: {
          in: ['DRAFT', 'SENT'],
        },
      },
      _sum: {
        invoiceTotal: true,
      },
    });
    
    const overdueAmount = await prisma.invoice.aggregate({
      where: {
        status: 'OVERDUE',
      },
      _sum: {
        invoiceTotal: true,
      },
    });
    
    // Get recent invoices
    const recentInvoices = await prisma.invoice.findMany({
      select: {
        id: true,
        client: true,
        invoiceTotal: true,
        status: true,
        dueDate: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
    });
    
    return {
      pendingInvoices: {
        count: pendingInvoicesCount,
        percentage: pendingPercentage,
      },
      invoicesByStatus: [
        { name: 'Draft', count: statusCounts[0], color: '#94a3b8' },
        { name: 'Sent', count: statusCounts[1], color: '#eab308' },
        { name: 'Overdue', count: statusCounts[2], color: '#f43f5e' },
      ],
      totalAmount: {
        pending: pendingAmount._sum.invoiceTotal || 0,
        overdue: overdueAmount._sum.invoiceTotal || 0,
      },
      recentInvoices: recentInvoices.map(invoice => ({
        id: invoice.id,
        client: invoice.client.name,
        amount: invoice.invoiceTotal,
        status: invoice.status as InvoiceStatus,
        dueDate: invoice.dueDate,
      })),
    };
  } catch (error) {
    console.error('Error fetching invoice data:', error);
    return {
      pendingInvoices: {
        count: 12,
        percentage: 40,
      },
      invoicesByStatus: [
        { name: 'Draft', count: 5, color: '#94a3b8' },
        { name: 'Sent', count: 4, color: '#eab308' },
        { name: 'Overdue', count: 3, color: '#f43f5e' },
      ],
      totalAmount: {
        pending: 15300.75,
        overdue: 8750.25,
      },
      recentInvoices: [
        { id: 'inv-001', client: 'Acme Corp', amount: 3500, status: 'SENT', dueDate: addDays(new Date(), 7) },
        { id: 'inv-002', client: 'Globex Inc', amount: 2800, status: 'OVERDUE', dueDate: subDays(new Date(), 3) },
        { id: 'inv-003', client: 'Stark Industries', amount: 5200, status: 'DRAFT', dueDate: addDays(new Date(), 14) },
        { id: 'inv-004', client: 'Wayne Enterprises', amount: 1850, status: 'SENT', dueDate: addDays(new Date(), 5) },
        { id: 'inv-005', client: 'Umbrella Corp', amount: 3250, status: 'PAID', dueDate: subDays(new Date(), 10) },
      ],
    };
  }
}

// Get all transactions
export async function fetchAllTransactions() {
    try {
      const today = new Date();
      
      // Recent transactions count (last 30 days)
      const recentCount = await prisma.transaction.count({
        where: {
          date: {
            gte: new Date(today.setDate(today.getDate() - 30))
          }
        }
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
                lte: dayEnd
              }
            }
          });
  
          return {
            count: transactions.length,
            income: transactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + t.amount, 0),
            expense: transactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + t.amount, 0),
            name: day.toLocaleDateString('en-US', { weekday: 'short' }),
            isToday: index === 0
          };
        })
      );
  
      return {
        recentCount,
        weeklyData: weeklyData.reverse() // Reverse to show oldest first
      };
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return {
        recentCount: 0,
        weeklyData: []
      };
    }
  }

  export async function fetchClientData() {
    try {
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
  
      // Active clients (clients with at least one invoice)
      const activeClients = await prisma.client.count({
        where: {
          invoice: { some: {} }
        }
      });
  
      // Recent clients (last 5 created)
      const recentClients = await prisma.client.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { name: true, createdAt: true }
      });
  
      // Monthly comparison
      const [currentMonthClients, lastMonthClients] = await Promise.all([
        prisma.client.count({
          where: { createdAt: { gte: startOfMonth } }
        }),
        prisma.client.count({
          where: { 
            createdAt: { 
              gte: startOfLastMonth,
              lt: endOfLastMonth
            } 
          }
        })
      ]);
  
      // Calculate percentage change
      const changeRate = lastMonthClients > 0 
        ? ((currentMonthClients - lastMonthClients) / lastMonthClients) * 100
        : currentMonthClients > 0 ? 100 : 0;
  
      return {
        activeClients,
        recentClients: recentClients.map(client => ({
          name: client.name,
          // Add avatar if available in your schema
          // createdAt: client.createdAt // Uncomment if needed
        })),
        changeRate: Number(changeRate.toFixed(1))
      };
    } catch (error) {
      console.error('Error fetching client data:', error);
      return {
        activeClients: 0,
        recentClients: [],
        changeRate: 0
      };
    }
  }
