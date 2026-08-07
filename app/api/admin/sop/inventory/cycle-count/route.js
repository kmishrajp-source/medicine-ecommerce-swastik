import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import fs from "fs";
import path from "path";
import prisma from "@/lib/prisma";

const LOG_FILE = path.join(process.cwd(), "data", "cycle-counts.json");

function readLog() {
    try {
        if (!fs.existsSync(path.dirname(LOG_FILE))) {
            fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });
        }
        if (!fs.existsSync(LOG_FILE)) return [];
        return JSON.parse(fs.readFileSync(LOG_FILE, "utf-8"));
    } catch { return []; }
}

function writeLog(data) {
    fs.writeFileSync(LOG_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        return NextResponse.json({ success: true, cycleCounts: readLog() });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { type, counts, notes } = body; // counts = [{productId, systemStock, physicalCount, variance}]

        if (!type || !counts || !Array.isArray(counts)) {
            return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
        }

        const cycleCount = {
            id: `CC-${Date.now()}`,
            type, // DAILY, WEEKLY, MONTHLY
            countedBy: session.user.name || session.user.email,
            notes,
            itemsCounted: counts.length,
            variancesFound: counts.filter(c => c.variance !== 0).length,
            counts,
            createdAt: new Date().toISOString()
        };

        const existing = readLog();
        existing.unshift(cycleCount);
        writeLog(existing);

        // Auto-create Stock Adjustments for variances
        for (const count of counts) {
            if (count.variance !== 0) {
                await prisma.stockLog.create({
                    data: {
                        productId: count.productId,
                        quantity: count.variance, // e.g. -5 means 5 missing
                        buyingPrice: 0,
                        type: "ADJUSTMENT"
                    }
                });

                await prisma.product.update({
                    where: { id: count.productId },
                    data: { stock: { increment: count.variance } }
                });
            }
        }

        return NextResponse.json({ success: true, cycleCount });
    } catch (error) {
        console.error("Cycle Count Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
