import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import fs from "fs";
import path from "path";
import prisma from "@/lib/prisma";

const DATA_DIR = path.join(process.cwd(), "data");
const PO_FILE = path.join(DATA_DIR, "purchase-orders.json");
const GRN_FILE = path.join(DATA_DIR, "grn-logs.json");

function readJson(file) {
    try {
        if (!fs.existsSync(file)) return [];
        return JSON.parse(fs.readFileSync(file, "utf-8"));
    } catch { return []; }
}

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const pos = readJson(PO_FILE);
        const grns = readJson(GRN_FILE);

        // 1. Stock Availability %
        const allProducts = await prisma.product.findMany({ select: { stock: true } });
        const totalProducts = allProducts.length;
        const inStockProducts = allProducts.filter(p => p.stock > 0).length;
        const availabilityPercent = totalProducts > 0 ? ((inStockProducts / totalProducts) * 100).toFixed(1) : 100;

        // 2. Average Supplier Lead Time (Days from PO creation to GRN creation)
        let totalLeadTimeMs = 0;
        let leadTimeCount = 0;

        grns.forEach(grn => {
            const po = pos.find(p => p.id === grn.poId);
            if (po && po.createdAt && grn.createdAt) {
                const ms = new Date(grn.createdAt) - new Date(po.createdAt);
                if (ms > 0) {
                    totalLeadTimeMs += ms;
                    leadTimeCount++;
                }
            }
        });
        const avgLeadTimeDays = leadTimeCount > 0 ? (totalLeadTimeMs / leadTimeCount / (1000 * 60 * 60 * 24)).toFixed(1) : 0;

        // 3. Procurement Savings (Budget vs Actual on POs)
        // We look at the original Purchase Requisition estimated cost vs the PO final cost
        let totalBudget = 0;
        let totalSpent = 0;
        
        const REQ_FILE = path.join(DATA_DIR, "purchase-requisitions.json");
        const reqs = readJson(REQ_FILE);

        pos.forEach(po => {
            const req = reqs.find(r => r.id === po.reqId);
            if (req && req.estimatedCost) {
                totalBudget += parseFloat(req.estimatedCost);
                totalSpent += parseFloat(po.finalAmount || 0);
            }
        });

        const procurementSavings = totalBudget - totalSpent;
        const savingsPercent = totalBudget > 0 ? ((procurementSavings / totalBudget) * 100).toFixed(1) : 0;

        return NextResponse.json({
            success: true,
            kpis: {
                availabilityPercent,
                totalProducts,
                outOfStock: totalProducts - inStockProducts,
                avgLeadTimeDays,
                procurementSavings,
                savingsPercent,
                totalSpent
            }
        });

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
