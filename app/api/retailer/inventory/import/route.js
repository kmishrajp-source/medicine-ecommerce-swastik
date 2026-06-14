import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "RETAILER") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { items } = body;

        if (!items || !Array.isArray(items)) {
            return NextResponse.json({ error: "Invalid data format. Expected an array of items." }, { status: 400 });
        }

        // We need the retailer record to link inventory
        const retailer = await prisma.retailer.findUnique({
            where: { userId: session.user.id }
        });

        if (!retailer) {
            return NextResponse.json({ error: "Retailer profile not found" }, { status: 404 });
        }

        // Fetch existing inventory for this retailer to check for updates vs creates
        const existingInventory = await prisma.retailerInventory.findMany({
            where: { retailerId: retailer.id }
        });

        const existingMap = new Map();
        for (const item of existingInventory) {
            // Use lowercase for case-insensitive matching
            existingMap.set(item.medicineName.toLowerCase(), item.id);
        }

        let addedCount = 0;
        let updatedCount = 0;

        // Process items
        const operations = [];

        for (const row of items) {
            // Validate row structure
            if (!row.medicineName) continue;

            const name = row.medicineName.trim();
            const stock = parseInt(row.stock, 10) || 0;
            const price = parseFloat(row.price) || 0;

            if (!name || price <= 0) continue;

            const nameLower = name.toLowerCase();

            if (existingMap.has(nameLower)) {
                // Update existing
                const existingId = existingMap.get(nameLower);
                operations.push(
                    prisma.retailerInventory.update({
                        where: { id: existingId },
                        data: { stock, price }
                    })
                );
                updatedCount++;
            } else {
                // Create new
                operations.push(
                    prisma.retailerInventory.create({
                        data: {
                            retailerId: retailer.id,
                            medicineName: name,
                            stock: stock,
                            price: price,
                            deliveryArea: retailer.shopAddress || "Local Area"
                        }
                    })
                );
                addedCount++;
            }
        }

        // Execute all database operations in a transaction
        await prisma.$transaction(operations);

        return NextResponse.json({
            success: true,
            message: `Successfully imported inventory. Added: ${addedCount}, Updated: ${updatedCount}`,
            added: addedCount,
            updated: updatedCount
        });

    } catch (error) {
        console.error("Marg CSV Import Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
