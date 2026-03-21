import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user.role !== 'MANUFACTURER' && session.user.role !== 'ADMIN')) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const manufacturer = await prisma.manufacturer.findUnique({
            where: { userId: session.user.id }
        });

        if (!manufacturer) {
            return NextResponse.json({ error: "Manufacturer profile not found" }, { status: 404 });
        }

        // Fetch Products
        const products = await prisma.product.findMany({
            where: { manufacturerId: manufacturer.id },
            orderBy: { createdAt: 'desc' },
            take: 50
        });

        // Filter: Recent SubOrders involving this manufacturer's products
        // (This is a complex query, we'll simulate for now using orders)
        const recentOrders = await prisma.orderItem.findMany({
            where: { product: { manufacturerId: manufacturer.id } },
            include: { order: true, product: true },
            orderBy: { order: { createdAt: 'desc' } },
            take: 10
        });

        // Calculate Stats
        const totalProducts = await prisma.product.count({ where: { manufacturerId: manufacturer.id } });
        const lowStockCount = await prisma.product.count({ 
            where: { manufacturerId: manufacturer.id, stock: { lt: 20 } } 
        });

        // Revenue Simulation: Sum of OrderItems * Price
        const totalRevenue = recentOrders.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const platformComm = totalRevenue * 0.10;
        const netPayout = totalRevenue - platformComm;

        return NextResponse.json({
            success: true,
            stats: {
                totalProducts,
                lowStockCount,
                totalRevenue,
                platformDeduction: platformComm,
                netPayout
            },
            products,
            recentOrders
        });

    } catch (error) {
        console.error("Manufacturer Dashboard API Error:", error);
        return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
    }
}
