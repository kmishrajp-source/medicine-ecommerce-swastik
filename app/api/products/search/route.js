import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request) {
    try {
        const { keywords } = await request.json();

        if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
            return NextResponse.json({ success: false, error: 'No keywords provided' }, { status: 400 });
        }

        // We build an OR query for each keyword to find matching medicines
        const orConditions = keywords.map(kw => ({
            name: {
                contains: kw,
                mode: 'insensitive'
            }
        }));

        const products = await prisma.product.findMany({
            where: {
                OR: orConditions
            },
            take: 20, // limit to 20 suggestions
            select: {
                id: true,
                name: true,
                price: true,
                image: true,
                category: true,
                stock: true
            }
        });

        return NextResponse.json({ success: true, products });
    } catch (error) {
        console.error("Error searching products:", error);
        return NextResponse.json({ success: false, error: 'Failed to search products' }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
