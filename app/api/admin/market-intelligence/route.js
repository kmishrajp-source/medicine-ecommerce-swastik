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

        const generateSimulation = (q) => {
            const basePrice = (q.length * 15) % 800 + 50; 
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const marketMovement = months.map((m, i) => {
                const trend = Math.sin(i + q.length) * 20;
                return {
                    month: m,
                    demand: Math.floor(100 + trend + (q.length % 10)),
                    supply: Math.floor(120 - trend),
                    price: Math.floor(basePrice + (trend / 2))
                };
            });

            return { basePrice, marketMovement };
        };

        const { basePrice, marketMovement } = generateSimulation(query);

        if (products.length === 0) {
            // SIMULATED EXTERNAL RESPONSE
            const simulatedProduct = {
                id: "ext-" + query.replace(/\s+/g, '-').toLowerCase(),
                name: query.toUpperCase(),
                composition: "Simulated Market Average",
                price: basePrice,
                category: "External Data",
                image: "https://images.unsplash.com/photo-1584308666744-24d59b298f0d?auto=format&fit=crop&w=400&q=80"
            };

            const simulatedAnalytics = {
                totalStock: 0, // Not in local stock
                averagePrice: basePrice.toFixed(2),
                lowestPrice: (basePrice * 0.8).toFixed(2),
                lowestPriceRetailer: "External B2B Channels",
                marketMovement,
                isExternal: true,
                shortageRisk: marketMovement[11].demand > marketMovement[11].supply ? "High" : "Low",
                globalDemand: "Surging"
            };

            const simulatedAlternatives = [
                { id: "alt-1", name: "Generic " + query.split(" ")[0], price: basePrice * 0.6 },
                { id: "alt-2", name: "Competitor " + query.split(" ")[0], price: basePrice * 0.9 }
            ];

            return NextResponse.json({
                success: true,
                results: {
                    primaryProduct: simulatedProduct,
                    retailerAvailability: [],
                    centralAvailability: [],
                    alternatives: simulatedAlternatives,
                    vendors: [],
                    analytics: simulatedAnalytics
                }
            });
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
            }
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
            lowestPriceRetailer: null,
            marketMovement,
            isExternal: false
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
