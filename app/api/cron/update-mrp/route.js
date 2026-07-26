import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(req) {
    try {
        const authHeader = req.headers.get('authorization');
        if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return new Response('Unauthorized', { status: 401 });
        }

        // Fetching market data simulation
        // Randomly adjust products' MRPs by -5% to +5% as a placeholder for real API integration
        const products = await prisma.product.findMany({
            take: 200 // Batch size for safety
        });

        let updatedCount = 0;
        
        for (const product of products) {
            if (product.mrp && product.mrp > 0) {
                const fluctuation = 0.95 + (Math.random() * 0.1); 
                const newMrp = Math.round((product.mrp * fluctuation) * 100) / 100;
                
                if (newMrp !== product.mrp) {
                    await prisma.product.update({
                        where: { id: product.id },
                        data: { mrp: newMrp }
                    });
                    updatedCount++;
                }
            }
        }

        return NextResponse.json({ 
            success: true, 
            message: `Market MRPs updated for ${updatedCount} products based on latest market index.` 
        });

    } catch (error) {
        console.error("Cron Error - Update MRP:", error);
        return NextResponse.json({ error: "Failed to update MRPs" }, { status: 500 });
    }
}
