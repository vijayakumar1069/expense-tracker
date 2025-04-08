import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { z } from "zod";
import { prisma } from "@/utils/prisma";
import { Prisma } from "@prisma/client";
// Make sure you're using the correct package
import * as XLSX from 'xlsx-js-style';

// Define TypeScript interfaces for styling
interface CellStyle {
    font?: {
        name?: string;
        sz?: number;
        bold?: boolean;
        color?: { rgb: string };
    };
    fill?: {
        fgColor: { rgb: string };
    };
    alignment?: {
        horizontal?: string;
        vertical?: string;
        wrapText?: boolean;
    };
    border?: {
        top?: { style: string; color: { rgb: string } };
        bottom?: { style: string; color: { rgb: string } };
        left?: { style: string; color: { rgb: string } };
        right?: { style: string; color: { rgb: string } };
    };
    numFmt?: string;
}

interface StyledCell {
    v: string | number; // value
    t?: string;         // type
    s: CellStyle;       // style
}

interface FormattedRow {
    "S.No": StyledCell;
    "Date": StyledCell;
    "Particulars": StyledCell;
    "Amount": StyledCell;
    "Remarks": StyledCell;
}

// Updated validation schema
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
    byMonth: z.enum(['ThisMonth', 'LastMonth', 'Last2Months', 'Last3Months', 'Last6Months', 'LastYear']).optional(),
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
            byMonth: searchParams.get("byMonth") || undefined,
        });

        const {
            type,
            category,
            paymentMethodType,
            startDate: queryStartDate,
            endDate: queryEndDate,
            minAmount,
            maxAmount,
            search,
            sortBy,
            sortDirection,
            byMonth,
        } = validatedParams;

        // Build the where condition for Prisma
        const where: Prisma.TransactionWhereInput = {
            userId: user.id,
        };

        // Add filters
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
        if (byMonth) {
            const now = new Date();
            const currentYear = now.getUTCFullYear();
            const currentMonth = now.getUTCMonth();

            let computedStartDate: Date;
            let computedEndDate: Date;

            switch (byMonth) {
                case 'ThisMonth':
                    computedStartDate = new Date(Date.UTC(currentYear, currentMonth, 1));
                    computedEndDate = new Date(Date.UTC(currentYear, currentMonth + 1, 0, 23, 59, 59, 999));
                    break;
                case 'LastMonth':
                    computedStartDate = new Date(Date.UTC(currentYear, currentMonth - 1, 1));
                    computedEndDate = new Date(Date.UTC(currentYear, currentMonth, 0, 23, 59, 59, 999));
                    break;
                case 'Last2Months':
                    computedStartDate = new Date(Date.UTC(currentYear, currentMonth - 2, 1));
                    computedEndDate = new Date(Date.UTC(currentYear, currentMonth, 0, 23, 59, 59, 999));
                    break;
                case 'Last3Months':
                    computedStartDate = new Date(Date.UTC(currentYear, currentMonth - 3, 1));
                    computedEndDate = new Date(Date.UTC(currentYear, currentMonth, 0, 23, 59, 59, 999));
                    break;
                case 'Last6Months':
                    computedStartDate = new Date(Date.UTC(currentYear, currentMonth - 6, 1));
                    computedEndDate = new Date(Date.UTC(currentYear, currentMonth, 0, 23, 59, 59, 999));
                    break;
                case 'LastYear':
                    computedStartDate = new Date(Date.UTC(currentYear - 1, 0, 1));
                    computedEndDate = new Date(Date.UTC(currentYear - 1, 11, 31, 23, 59, 59, 999));
                    break;
                default:
                    throw new Error('Invalid byMonth value');
            }

            where.date = {
                gte: computedStartDate,
                lte: computedEndDate,
            };
        } else {
            // Handle manual date range only if byMonth is not set
            if (queryStartDate || queryEndDate) {
                where.date = {};
                if (queryStartDate) where.date.gte = new Date(queryStartDate);
                if (queryEndDate) where.date.lte = new Date(queryEndDate);
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

        // Get all transactions
        const transactions = await prisma.transaction.findMany({
            where,
            orderBy,
            include: {
                paymentMethod: true,
            },
        });

        // Calculate total sum of all transaction totals
        const grandTotal = transactions.reduce((sum, transaction) => sum + transaction.total, 0);

        // Transform data for export with styles
        const formattedData: FormattedRow[] = transactions.map((transaction, index) => {
            // Determine color based on whether amount is positive or negative
            const amountColor = transaction.total >= 0 ? "0000FF" : "FF0000"; // Blue for positive, Red for negative

            return {
                "S.No": {
                    v: (index + 1).toString(),
                    s: {
                        alignment: { horizontal: "center" }
                    }
                },
                "Date": {
                    v: transaction.date.toISOString().split('T')[0],
                    s: {
                        alignment: { horizontal: "center" }
                    }
                },
                "Particulars": {
                    v: transaction.name,
                    s: {
                        alignment: { horizontal: "left" }
                    }
                },
                "Amount": {
                    v: transaction.total.toFixed(2),
                    s: {
                        font: { color: { rgb: amountColor } },
                        alignment: { horizontal: "right" },
                        numFmt: "#,##0.00"
                    }
                },
                "Remarks": {
                    v: transaction.description || '',
                    s: {
                        alignment: { horizontal: "left" }
                    }
                }
            };
        });
        for (let i = 0; i < 3; i++) {
            formattedData.push({
                "S.No": { v: "", s: {} },
                "Date": { v: "", s: {} },
                "Particulars": { v: "", s: {} },
                "Amount": { v: "", s: {} },
                "Remarks": { v: "", s: {} }
            });
        }
        // Add header row with styles
        const headerStyle: CellStyle = {
            font: { bold: true, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "4472C4" } }, // Blue background
            alignment: { horizontal: "center", vertical: "center" },
            border: {
                top: { style: "thin", color: { rgb: "000000" } },
                bottom: { style: "thin", color: { rgb: "000000" } },
                left: { style: "thin", color: { rgb: "000000" } },
                right: { style: "thin", color: { rgb: "000000" } }
            }
        };

        // Append the Grand Total row with special formatting
        formattedData.push({
            "S.No": {
                v: "",
                s: {
                    // fill: { fgColor: { rgb: "FFC000" } } // Yellow background
                }
            },
            "Date": {
                v: "",
                s: {
                    // fill: { fgColor: { rgb: "FFC000" } } // Yellow background
                }
            },
            "Particulars": {
                v: "Grand Total",
                s: {
                    font: { bold: true, color: { rgb: "000000" } }, // Black bold text
                    fill: { fgColor: { rgb: "FFC000" } }, // Yellow background
                    alignment: { horizontal: "center" }
                }
            },
            "Amount": {
                v: grandTotal.toFixed(2),
                s: {
                    font: { bold: true, color: { rgb: "000000" } }, // Black bold text
                    fill: { fgColor: { rgb: "FFC000" } }, // Yellow background
                    alignment: { horizontal: "center" },
                    numFmt: "#,##0.00"
                }
            },
            "Remarks": {
                v: "",
                s: {
                    // fill: { fgColor: { rgb: "FFC000" } } // Yellow background
                }
            }
        });

        // Convert the formatted data to an array that XLSX can work with
        const wbData = formattedData.map(row => [
            row["S.No"],
            row["Date"],
            row["Particulars"],
            row["Amount"],
            row["Remarks"]
        ]);

        // Add the header row
        const headers = [
            { v: "S.No", s: headerStyle },
            { v: "Date", s: headerStyle },
            { v: "Particulars", s: headerStyle },
            { v: "Amount", s: headerStyle },
            { v: "Remarks", s: headerStyle }
        ];
        wbData.unshift(headers);

        // Create a worksheet with the styled data
        const worksheet = XLSX.utils.aoa_to_sheet(wbData);

        // Create a workbook and add the worksheet
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");

        // Get the Excel file as a buffer
        const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        // Create filename
        const date = new Date().toISOString().split('T')[0];
        const filename = `transactions_${date}.xlsx`;

        return new NextResponse(excelBuffer, {
            headers: {
                'Content-Disposition': `attachment; filename="${filename}"`,
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
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

        console.error("Export error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}