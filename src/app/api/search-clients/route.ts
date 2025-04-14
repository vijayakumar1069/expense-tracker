// app/api/search-client/route.ts

import { requireAuth } from '@/lib/auth';
import { prisma } from '@/utils/prisma';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
    // Get search query from URL
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get('query')?.toLowerCase() || '';

    // Authenticate user
    const user = await requireAuth();
    if (!user) {
        return new Response('Unauthorized', { status: 401 });
    }

    // Fetch clients from the database
    const clients = await prisma.client.findMany({
        where: {
            userId: user.id,
            ...(query !== "" && {
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { email: { contains: query, mode: 'insensitive' } },
                    { companyName: { contains: query, mode: 'insensitive' } },
                ],
            }),
        },
        skip: 0,
        take: 10,
    });

    // Return matching clients as JSON
    return new Response(JSON.stringify(clients), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
}
