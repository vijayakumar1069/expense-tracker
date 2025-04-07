import { requireAuth } from "@/lib/auth";
import { prisma } from "@/utils/prisma";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Zod schema for query parameters
const querySchema = z.object({
    name: z.string().optional(),
    email: z.string().optional(),
    limit: z.string().transform(val => parseInt(val)).optional(),
    page: z.string().transform(val => parseInt(val)).optional(),
    companyName: z.string().optional(),
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
            name: searchParams.get("name") || undefined,
            email: searchParams.get("email") || undefined,
            companyName: searchParams.get("companyName") || undefined,
        });

        const {
            page = 1,
            limit = 10,
            name,
            email,
            companyName,
        } = validatedParams;

        // Build where clause for filtering
        const where: Prisma.ClientWhereInput = {
            userId: user.id,
        };

        // Add name filter if provided
        if (name) {
            where.name = {
                contains: name,
                mode: "insensitive",
            };
        }

        // Add email filter if provided
        if (email) {
            where.email = {
                contains: email,
                mode: "insensitive",
            };
        }
        if (companyName) {
            where.companyName = {
                contains: companyName,
                mode: "insensitive",
            };
        }

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Get clients from database with pagination
        const [clients, total] = await Promise.all([
            prisma.client.findMany({
                where,
                skip,
                take: limit,
                orderBy:
                {
                    createdAt: "desc"
                }
            }),
            prisma.client.count({ where }),
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