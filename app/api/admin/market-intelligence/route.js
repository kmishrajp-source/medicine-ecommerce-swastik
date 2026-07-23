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
        // Split the query into keywords to support complex searches like "drugA and drugB"
        const keywords = query.toLowerCase().split(/[\s\+]+/).filter(w => !['and', 'with', 'mg', 'ml'].includes(w) && w.length > 2);
        
        let whereClause = {};
        if (keywords.length > 0) {
            whereClause = {
                AND: keywords.map(kw => ({
                    OR: [
                        { name: { contains: kw, mode: 'insensitive' } },
                        { composition: { contains: kw, mode: 'insensitive' } },
                        { salt: { contains: kw, mode: 'insensitive' } },
                    ]
                }))
            };
        } else {
            whereClause = {
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { composition: { contains: query, mode: 'insensitive' } },
                    { salt: { contains: query, mode: 'insensitive' } },
                ]
            };
        }

        const products = await prisma.product.findMany({
            where: whereClause,
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

        // Calculate Analytics
        let analytics = {
            totalStock: 0,
            averagePrice: 0,
            lowestPrice: null,
            lowestPriceRetailer: null
        };

        if (retailerInventory.length > 0) {
            let sumPrice = 0;
            let minPrice = Infinity;
            
            retailerInventory.forEach(inv => {
                analytics.totalStock += (inv.stock || 0);
                sumPrice += (inv.price || 0);
                if (inv.price < minPrice) {
                    minPrice = inv.price;
                    analytics.lowestPriceRetailer = inv.retailer?.shopName || "Unknown Shop";
                }
            });

            analytics.averagePrice = (sumPrice / retailerInventory.length).toFixed(2);
            analytics.lowestPrice = minPrice;
        }

        return NextResponse.json({
            success: true,
            results: {
                primaryProduct,
                retailerAvailability: retailerInventory,
                centralAvailability: pharmacyInventory,
                alternatives,
                vendors,
                analytics
            }
        });

    } catch (error) {
        console.error("Market Intelligence API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
