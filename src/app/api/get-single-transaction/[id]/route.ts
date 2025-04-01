import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/utils/prisma";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params || {};

        if (!id) {
            return NextResponse.json(
                { error: "Transaction ID is required" },
                { status: 400 }
            );
        }

        const transaction = await prisma.transaction.findUnique({
            where: { id },
            include: {
                paymentMethod: true,
                attachments: true,
            }
        });

        if (!transaction) {
            return NextResponse.json(
                { error: "Transaction not found" },
                { status: 404 }
            );
        }


        return NextResponse.json(transaction);
    } catch (error) {
        console.error("Error fetching transaction:", error);
        return NextResponse.json(
            { error: "Failed to fetch transaction" },
            { status: 500 }
        );
    }
}
