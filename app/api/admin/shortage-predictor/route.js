import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req) {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // 1. Fetch all products with inventory
        const products = await prisma.product.findMany({
            include: {
                inventory: true
            }
        });

        // 2. Fetch sales from the last 30 days
        const recentOrders = await prisma.orderItem.groupBy({
            by: ['productId'],
            where: {
                order: {
                    createdAt: {
                        gte: thirtyDaysAgo
                    },
                    status: {
                        notIn: ["Cancelled", "Rejected"]
                    }
                }
            },
            _sum: {
                quantity: true
            }
        });

        // Map sales to product ID for O(1) lookup
        const salesMap = {};
        recentOrders.forEach(order => {
            salesMap[order.productId] = order._sum.quantity || 0;
        });

        // 3. Process Products and calculate risk
        let intelligenceData = products.map(product => {
            const currentStock = product.inventory?.stock ?? product.stock; // fallback to legacy stock
            const salesLast30Days = salesMap[product.id] || 0;
            const dailyVelocity = salesLast30Days / 30;
            
            let daysLeft = 999; // Assume infinite if no sales
            if (dailyVelocity > 0) {
                daysLeft = Math.floor(currentStock / dailyVelocity);
            }

            let riskLevel = "LOW";
            if (daysLeft < 14) riskLevel = "HIGH";
            else if (daysLeft < 30) riskLevel = "MEDIUM";

            // If stock is literally 0, it's CRITICAL
            if (currentStock === 0) riskLevel = "CRITICAL";

            return {
                id: product.id,
                name: product.name,
                category: product.category,
                salt: product.salt,
                currentStock,
                salesLast30Days,
                dailyVelocity: dailyVelocity.toFixed(2),
                daysLeft,
                riskLevel
            };
        });

        // Sort by risk (CRITICAL -> HIGH -> MEDIUM -> LOW)
        const riskWeights = { "CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3 };
        intelligenceData.sort((a, b) => {
            if (riskWeights[a.riskLevel] !== riskWeights[b.riskLevel]) {
                return riskWeights[a.riskLevel] - riskWeights[b.riskLevel];
            }
            return a.daysLeft - b.daysLeft; // Secondary sort by lowest days left
        });

        // 4. Find alternatives for CRITICAL and HIGH risk items
        for (let item of intelligenceData) {
            if (item.riskLevel === "HIGH" || item.riskLevel === "CRITICAL") {
                if (item.salt) {
                    // Find other medicines with the SAME salt, that are NOT this medicine, and have GOOD stock
                    const alternatives = intelligenceData.filter(alt => 
                        alt.salt && 
                        alt.salt.toLowerCase() === item.salt.toLowerCase() && 
                        alt.id !== item.id &&
                        alt.riskLevel === "LOW" // Only recommend stable stock
                    );
                    item.alternatives = alternatives.map(a => ({ name: a.name, stock: a.currentStock }));
                } else {
                    item.alternatives = []; // Can't find alternatives without salt info
                }
            }
        }

        return NextResponse.json({ success: true, data: intelligenceData });
    } catch (error) {
        console.error("Shortage Predictor Error:", error);
        return NextResponse.json({ success: false, error: "Failed to generate shortage intelligence" }, { status: 500 });
    }
}
