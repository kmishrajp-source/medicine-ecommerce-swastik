import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const count = await prisma.product.count();
        const products = await prisma.product.findMany({
            take: 200
        });
        return NextResponse.json({ success: true, count, products });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message });
    }
}
