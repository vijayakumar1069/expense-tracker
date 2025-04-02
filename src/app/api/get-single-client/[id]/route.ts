import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/utils/prisma";


export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {

    ;
    try {
        const { id } = await params;
        if (!id) {
            return NextResponse.json(
                { error: "Client ID is required" },
                { status: 400 }
            );
        }

        // Authenticate user
        const user = await requireAuth();
        if (!user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Get client from database
        const client = await prisma.client.findUnique({
            where: { id },
        });

        // Check if client exists
        if (!client) {
            return NextResponse.json(
                { error: "Client not found" },
                { status: 404 }
            );
        }

        // Check if client belongs to user
        if (client.userId !== user.id) {
            return NextResponse.json(
                { error: "You don't have permission to access this client" },
                { status: 403 }
            );
        }

        // Return successful response
        return NextResponse.json({ data: client });
    } catch (error) {


        // Handle error
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to fetch client" },
            { status: 500 }
        );
    }
}