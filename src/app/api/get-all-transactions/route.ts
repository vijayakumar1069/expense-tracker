import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { z } from "zod";
import { prisma } from "@/utils/prisma";
import { Prisma } from "@prisma/client";

// Input validation schema - extended to include all filter parameters
const QuerySchema = z.object({
  page: z.string().transform(Number).default("1"),
  limit: z.string().transform(Number).default("10"),
  type: z.enum(['INCOME', 'EXPENSE', 'ALL']).optional(),
  category: z.string().optional(),
  transactionNumber: z.string().optional(),

  paymentMethodType: z.enum(['CASH', 'BANK', 'CHEQUE', 'INVOICE']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  minAmount: z.string().transform(val => val ? parseFloat(val) : undefined).optional(),
  maxAmount: z.string().transform(val => val ? parseFloat(val) : undefined).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['date', 'amount', 'name', 'createdAt']).default('createdAt'),
  sortDirection: z.enum(['asc', 'desc']).default('desc'),
});

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = await requireAuth();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(request.url);

    const validatedParams = QuerySchema.parse({
      page: searchParams.get("page") || undefined,
      limit: searchParams.get("limit") || undefined,
      type: searchParams.get("type") || undefined,
      category: searchParams.get("category") || undefined,
      transactionNumber: searchParams.get("transactionNumber") || undefined,
      paymentMethodType: searchParams.get("paymentMethodType") || undefined,
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
      minAmount: searchParams.get("minAmount") || undefined,
      maxAmount: searchParams.get("maxAmount") || undefined,
      search: searchParams.get("search") || undefined,
      sortBy: searchParams.get("sortBy") || "createdAt",
      sortDirection: searchParams.get("sortDirection") || "desc",
    });




    const {
      page,
      limit,
      type,
      category,
      transactionNumber,
      paymentMethodType,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      search,
      sortBy,
      sortDirection
    } = validatedParams;

    // Build the where condition for Prisma
    const where: Prisma.TransactionWhereInput = {
      userId: user.id,
    };

    // Add type filter
    if (type) {
      where.type = type as Prisma.EnumTransactionTypeFilter;
    }

    // Add category filter    
    if (category) {
      where.category = category;
    }

    // Add payment method filter (by ID)


    // Add payment method type filter
    if (paymentMethodType) {
      where.paymentMethod = {
        type: paymentMethodType
      };
    }

    // // Add transaction number filter
    // if (transactionNumber) {
    //   where.transactionNumber = transactionNumber;
    // }

    // Add date range filters
    if (startDate || endDate) {


      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }

    // Add amount range filters
    if (minAmount !== undefined || maxAmount !== undefined) {
      where.amount = {};
      if (minAmount !== undefined) {
        where.amount.gte = minAmount;
      }
      if (maxAmount !== undefined) {
        where.amount.lte = maxAmount;
      }
    }

    // Add search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { transactionNumber: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (transactionNumber) {
      where.transactionNumber = {
        contains: transactionNumber,
        mode: 'insensitive',
      };
    }

    // Build the orderBy parameter based on sortBy and sortDirection
    let orderBy: Prisma.TransactionOrderByWithRelationInput = { createdAt: 'desc' };

    if (sortBy === 'date') {
      orderBy = { date: sortDirection };
    } else if (sortBy === 'amount') {
      orderBy = { amount: sortDirection };
    } else if (sortBy === 'name') {
      orderBy = { name: sortDirection };
    } else {
      orderBy = { createdAt: sortDirection };
    }

    const skip = (page - 1) * limit;


    // Execute queries in parallel for better performance
    const [transactions, totalItems, aggregates] = await Promise.all([
      // Get filtered and paginated transactions
      prisma.transaction.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          paymentMethod: true,
          attachments: true,
        },
      }),

      // Get total count for user's filtered transactions
      prisma.transaction.count({
        where,
      }),

      // Get aggregated amounts by type with the same filters
      prisma.transaction.groupBy({
        by: ["type"],
        where,
        _sum: {
          amount: true,
        },
      }),
    ]);


    // Calculate total income and expenses
    const totalIncome = aggregates.find(agg => agg.type === "INCOME")?._sum.amount ?? 0;
    const totalExpenses = aggregates.find(agg => agg.type === "EXPENSE")?._sum.amount ?? 0;

    return NextResponse.json({
      transactions,
      pagination: {
        totalPages: Math.ceil(totalItems / limit),
        totalItems,
        currentPage: page,
        itemsPerPage: limit,
      },
      summary: {
        totalIncome,
        totalExpenses,
        netAmount: totalIncome - totalExpenses,
      },
    });

  } catch (error) {
    console.error("Transaction fetch error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }

}