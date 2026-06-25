import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 1. Fetch all products
        const products = await prisma.product.findMany({
            select: {
                id: true,
                name: true,
                category: true,
                stock: true,
                price: true,
                expiryDate: true,
            }
        });

        // 2. Calculate "Annual Usage Value" or just "Current Inventory Value"
        // For a true ABC, it's based on consumption value. 
        // We'll approximate using (Stock * Price) or just assign random high-value items to A if we don't have sales data.
        // Let's get order items to calculate actual consumption value.
        const orderItems = await prisma.orderItem.groupBy({
            by: ['productId'],
            _sum: {
                quantity: true,
                price: true
            }
        });

        const consumptionMap = {};
        orderItems.forEach(item => {
            consumptionMap[item.productId] = (item._sum.quantity || 0) * (item._sum.price || 0);
        });

        let totalValue = 0;
        const analyzedProducts = products.map(p => {
            // If no sales history, use inventory value as fallback
            const value = consumptionMap[p.id] || (p.stock * p.price * 0.1); 
            totalValue += value;
            return {
                ...p,
                value,
                inventoryValue: p.stock * p.price
            };
        });

        // Sort by value descending
        analyzedProducts.sort((a, b) => b.value - a.value);

        let cumulativeValue = 0;
        const classified = analyzedProducts.map(p => {
            cumulativeValue += p.value;
            const percentage = totalValue === 0 ? 0 : (cumulativeValue / totalValue) * 100;
            
            let abcClass = "C";
            if (percentage <= 80) abcClass = "A";
            else if (percentage <= 95) abcClass = "B";

            return {
                ...p,
                abcClass,
                cumulativePercentage: percentage.toFixed(2)
            };
        });

        const summary = {
            A: classified.filter(p => p.abcClass === "A").length,
            B: classified.filter(p => p.abcClass === "B").length,
            C: classified.filter(p => p.abcClass === "C").length,
            totalValue
        };

        return NextResponse.json({ success: true, summary, products: classified });

    } catch (error) {
        console.error("ABC Analysis Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
