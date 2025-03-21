import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { z } from "zod";
import { prisma } from "@/utils/prisma";
import { Prisma } from "@prisma/client";
import * as XLSX from 'xlsx';

// Updated validation schema with only CSV format
const QuerySchema = z.object({
    type: z.enum(['INCOME', 'EXPENSE']).optional(),
    category: z.string().optional(),
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
            type: searchParams.get("type") || undefined,
            category: searchParams.get("category") || undefined,
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
            type,
            category,
            paymentMethodType,
            startDate,
            endDate,
            minAmount,
            maxAmount,
            search,
            sortBy,
            sortDirection,
        } = validatedParams;




        // Build the where condition for Prisma
        const where: Prisma.TransactionWhereInput = {
            userId: user.id,
        };

        // Add filters (same as in your GET endpoint)
        if (type) {
            where.type = type as Prisma.EnumTransactionTypeFilter;
        }

        if (category) {
            where.category = category;
        }

        if (paymentMethodType) {
            where.paymentMethod = {
                type: paymentMethodType
            };
        }

        if (startDate || endDate) {
            where.date = {};
            if (startDate) {
                where.date.gte = new Date(startDate);
            }
            if (endDate) {
                where.date.lte = new Date(endDate);
            }
        }

        if (minAmount !== undefined || maxAmount !== undefined) {
            where.amount = {};
            if (minAmount !== undefined) {
                where.amount.gte = minAmount;
            }
            if (maxAmount !== undefined) {
                where.amount.lte = maxAmount;
            }
        }

        if (search) {
            where.OR = [
                { name: { contains: search } },
                { description: { contains: search } }
            ];
        }

        // Build the orderBy parameter
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

        // Get all transactions (no pagination for export)
        const transactions = await prisma.transaction.findMany({
            where,
            orderBy,
            include: {
                paymentMethod: true,
            },
        });

        // Transform data for export (remaining the same)
        const formattedData = transactions.map(transaction => ({
            ID: transaction.id,
            Name: transaction.name,
            Type: transaction.type,
            Amount: transaction.amount,
            Tax: transaction.tax || 'N/A',
            Total: transaction.total,
            Category: transaction.category || 'N/A',
            "Transaction Date": transaction.date.toISOString().split('T')[0],
            Description: transaction.description || '',
            'Payment Method': transaction.paymentMethod?.type || 'N/A',
            'Invoice No': transaction.paymentMethod?.invoiceNo || '',
            'Received By': transaction.paymentMethod?.receivedBy || '',
            'Bank Name': transaction.paymentMethod?.bankName || '',
            'Cheque No': transaction.paymentMethod?.chequeNo || '',
            "Cheque Date": transaction.paymentMethod?.chequeDate?.toISOString().split('T')[0] || null,
            'Created At': transaction.createdAt.toISOString().split('T')[0] || "N/A",
        }));

        // Create CSV data directly
        const worksheet = XLSX.utils.json_to_sheet(formattedData);
        const csvData = XLSX.utils.sheet_to_csv(worksheet);

        // Create filename with date
        const date = new Date().toISOString().split('T')[0];
        const filename = `transactions_report_${date}.csv`;

        return new NextResponse(csvData, {
            headers: {
                'Content-Disposition': `attachment; filename="${filename}"`,
                'Content-Type': 'text/csv',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });

    } catch (error) {
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



