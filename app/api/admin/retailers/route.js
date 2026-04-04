import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const retailers = await prisma.retailer.findMany({
            select: {
                id: true,
                shopName: true,
                address: true,
                isOnline: true,
                priority_score: true,
                user: {
                    select: {
                        phone: true
                    }
                }
            },
            orderBy: { priority_score: 'desc' }
        });

        // Map to the expected UI format
        const formattedRetailers = retailers.map(r => ({
            id: r.id,
            store_name: r.shopName,
            address: r.address,
            is_online: r.isOnline,
            priority_score: r.priority_score,
            users: r.user ? { phone: r.user.phone } : null
        }));

        return NextResponse.json(formattedRetailers);
    } catch (error) {
        console.error("Admin Retailers API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id, priority_score } = await req.json();

        const updated = await prisma.retailer.update({
            where: { id },
            data: { priority_score: parseInt(priority_score) || 0 }
        });

        return NextResponse.json({ success: true, updated });
    } catch (error) {
        console.error("Admin Retailer Update Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
