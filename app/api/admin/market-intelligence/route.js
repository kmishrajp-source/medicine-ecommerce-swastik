import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user?.role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const query = searchParams.get('q');

        if (!query || query.length < 2) {
            return NextResponse.json({ success: true, results: null });
        }

        // 1. Find Product matches in Catalog
        const products = await prisma.product.findMany({
            where: {
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { composition: { contains: query, mode: 'insensitive' } },
                    { salt: { contains: query, mode: 'insensitive' } },
                ]
            },
            take: 5
        });

        if (products.length === 0) {
            return NextResponse.json({ success: true, message: "No matching medicines found in catalog.", results: null });
        }

        const primaryProduct = products[0];

        // 2. Find Retailer Inventory (String matching on medicineName)
        const retailerInventory = await prisma.retailerInventory.findMany({
            where: {
                medicineName: { contains: primaryProduct.name, mode: 'insensitive' }
            },
            include: {
                retailer: true
            }
        });

        // 3. Find Pharmacy Inventory (Strict relational matching)
        const pharmacyInventory = await prisma.pharmacyInventory.findMany({
            where: {
                productId: primaryProduct.id
            },
            // Assuming we might need to join it to a retailer if pharmacy inventory belongs to a retailer.
            // Wait, PharmacyInventory doesn't have retailerId in the schema we saw, it's a global/central stock.
        });

        // 4. Find Alternatives (same composition or salt)
        let alternatives = [];
        if (primaryProduct.composition || primaryProduct.salt) {
            alternatives = await prisma.product.findMany({
                where: {
                    id: { not: primaryProduct.id },
                    OR: [
                        { composition: primaryProduct.composition || undefined },
                        { salt: primaryProduct.salt || undefined }
                    ]
                },
                take: 5
            });
        }

        // 5. Find Vendors / Stockists for quick purchase (who supply this category)
        const vendors = await prisma.stockist.findMany({
            take: 5
        });

        return NextResponse.json({
            success: true,
            results: {
                primaryProduct,
                retailerAvailability: retailerInventory,
                centralAvailability: pharmacyInventory,
                alternatives,
                vendors
            }
        });

    } catch (error) {
        console.error("Market Intelligence API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
