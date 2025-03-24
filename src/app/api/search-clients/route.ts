// app/api/search-client/route.ts
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/utils/prisma';
import { NextRequest } from 'next/server';




export async function GET(req: NextRequest) {
    // Get search query from URL
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get('query')?.toLowerCase() || '';

    //authenticate
    const user = await requireAuth();
    if (!user) {
        return new Response('Unauthorized', { status: 401 });
    }
    // Fetch all clients from the database
    const clients = await prisma.client.findMany({
        where: {
            userId: user.id,
            OR: [
                { name: { contains: query } },
                { email: { contains: query } },
                { phone: { contains: query } },
                { address: { contains: query } },
            ],
        },
    });
    // Filter clients based on the query



    // Return filtered clients as JSON
    return new Response(JSON.stringify(clients), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    });
}
