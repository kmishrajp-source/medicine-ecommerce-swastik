import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET: Fetch inventory for logged-in retailer
export async function GET(req) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'RETAILER') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Find retailer profile for this user
        const retailer = await prisma.retailer.findUnique({
            where: { userId: session.user.id }
        });

        if (!retailer) {
            return NextResponse.json({ error: "Retailer profile not found" }, { status: 404 });
        }

        const inventory = await prisma.retailerInventory.findMany({
            where: { retailerId: retailer.id },
            orderBy: { updatedAt: 'desc' }
        });

        return NextResponse.json({ success: true, inventory });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// POST: Add new inventory item
export async function POST(req) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'RETAILER') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { medicineName, stock, price, deliveryArea } = await req.json();

        // Find retailer profile
        const retailer = await prisma.retailer.findUnique({
            where: { userId: session.user.id }
        });

        if (!retailer) {
            return NextResponse.json({ error: "Retailer profile not found" }, { status: 404 });
        }

        const newItem = await prisma.retailerInventory.create({
            data: {
                retailerId: retailer.id,
                medicineName,
                stock: parseInt(stock),
                price: parseFloat(price),
                deliveryArea
            }
        });

        return NextResponse.json({ success: true, item: newItem });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
