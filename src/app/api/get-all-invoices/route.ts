import { requireAuth } from "@/lib/auth";
import { prisma } from "@/utils/prisma";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Zod schema for query parameters
const querySchema = z.object({
    clientName: z.string().optional(),
    invoiceNumber: z.string().optional(),
    limit: z.string().transform(val => parseInt(val)).optional(),
    page: z.string().transform(val => parseInt(val)).optional(),
});

// type QueryParams = z.infer<typeof querySchema>;

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

        const validatedParams = querySchema.parse({
            page: searchParams.get("page") || "1",
            limit: searchParams.get("limit") || "10",
            clientName: searchParams.get("clientName") || undefined,
            invoiceNumber: searchParams.get("invoiceNumber") || undefined,
        });

        const {
            page = 1,
            limit = 10,
            clientName,
            invoiceNumber,
        } = validatedParams;

        // Build where clause for filtering
        const where: Prisma.InvoiceWhereInput = {
            userId: user.id,
        };

        // Add clientName filter if provided
        if (clientName) {
            where.clientName = {
                contains: clientName,
            };
        }

        // Add invoiceNumber filter if provided
        if (invoiceNumber) {
            where.invoiceNumber = {
                contains: invoiceNumber,
            };
        }

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Get clients from database with pagination
        const [clients, total] = await Promise.all([
            prisma.invoice.findMany({
                where,
                skip,
                take: limit,
                orderBy:
                {
                    createdAt: "desc"
                }
            }),
            prisma.invoice.count({ where }),
        ]);

        // Return successful response with pagination metadata
        return NextResponse.json({
            data: clients,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Error fetching clients:", error);

        // Handle Zod validation errors
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid query parameters", details: error.errors },
                { status: 400 }
            );
        }

        // Handle other errors
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to fetch clients" },
            { status: 500 }
        );
    }
}