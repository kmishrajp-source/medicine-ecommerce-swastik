import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user?.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const url = new URL(req.url);
        const search = url.searchParams.get('search') || '';

        const customers = await prisma.user.findMany({
            where: {
                role: 'CUSTOMER',
                OR: search ? [
                    { name: { contains: search, mode: 'insensitive' } },
                    { deviceId: { contains: search } },
                    { email: { contains: search, mode: 'insensitive' } },
                    { referredBy: { contains: search, mode: 'insensitive' } }
                ] : undefined
            },
            select: {
                id: true,
                name: true,
                email: true,
                deviceId: true, // phone number
                createdAt: true,
                referredBy: true,
                walletBalance: true
            },
            orderBy: { createdAt: 'desc' },
            take: 200 // Limit for performance, search to find more
        });

        return NextResponse.json({ success: true, customers });
    } catch (error) {
        console.error('[CRM Customers Fetch Error]:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
