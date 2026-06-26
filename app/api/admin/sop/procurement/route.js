import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import fs from "fs";
import path from "path";
import prisma from "@/lib/prisma";

const DATA_DIR = path.join(process.cwd(), "data");
const REQ_FILE = path.join(DATA_DIR, "purchase-requisitions.json");
const PO_FILE = path.join(DATA_DIR, "purchase-orders.json");
const GRN_FILE = path.join(DATA_DIR, "grn-logs.json");

function readJson(file) {
    try {
        if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
        if (!fs.existsSync(file)) return [];
        return JSON.parse(fs.readFileSync(file, "utf-8"));
    } catch { return []; }
}

function writeJson(file, data) {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf-8");
}

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const type = searchParams.get("type"); // rfqs, pos, grns

        if (type === "pos") return NextResponse.json({ success: true, pos: readJson(PO_FILE) });
        if (type === "grns") return NextResponse.json({ success: true, grns: readJson(GRN_FILE) });
        if (type === "rfqs") {
            // RFQs are attached to Purchase Requisitions
            const reqs = readJson(REQ_FILE).filter(r => r.status === "PENDING" || r.status === "QUOTED");
            return NextResponse.json({ success: true, rfqs: reqs });
        }

        return NextResponse.json({ 
            success: true, 
            data: {
                requisitions: readJson(REQ_FILE),
                pos: readJson(PO_FILE),
                grns: readJson(GRN_FILE)
            }
        });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { action } = body;

        // --- ACTION 1: ADD QUOTE TO REQUISITION ---
        if (action === "ADD_QUOTE") {
            const { reqId, vendorName, quoteAmount, leadTimeDays, notes } = body;
            const reqs = readJson(REQ_FILE);
            const rIndex = reqs.findIndex(r => r.id === reqId);
            if (rIndex === -1) return NextResponse.json({ error: "Requisition not found" }, { status: 404 });
            
            if (!reqs[rIndex].quotes) reqs[rIndex].quotes = [];
            reqs[rIndex].quotes.push({
                vendorName, quoteAmount: parseFloat(quoteAmount), leadTimeDays: parseInt(leadTimeDays), notes, addedAt: new Date().toISOString()
            });
            reqs[rIndex].status = "QUOTED";
            writeJson(REQ_FILE, reqs);
            return NextResponse.json({ success: true, requisition: reqs[rIndex] });
        }

        // --- ACTION 2: GENERATE PURCHASE ORDER (Form 04) ---
        if (action === "GENERATE_PO") {
            const { reqId, vendorName, finalAmount, deliveryDate } = body;
            const reqs = readJson(REQ_FILE);
            const rIndex = reqs.findIndex(r => r.id === reqId);
            if (rIndex === -1) return NextResponse.json({ error: "Requisition not found" }, { status: 404 });

            const po = {
                id: `PO-${Date.now()}`,
                reqId,
                vendorName,
                itemName: reqs[rIndex].itemName,
                quantity: reqs[rIndex].quantity,
                unit: reqs[rIndex].unit,
                finalAmount: parseFloat(finalAmount),
                expectedDeliveryDate: deliveryDate,
                status: "ISSUED",
                createdBy: session.user.name || session.user.email,
                createdAt: new Date().toISOString()
            };

            const pos = readJson(PO_FILE);
            pos.unshift(po);
            writeJson(PO_FILE, pos);

            reqs[rIndex].status = "ORDERED";
            writeJson(REQ_FILE, reqs);

            return NextResponse.json({ success: true, po });
        }

        // --- ACTION 3: GOODS RECEIPT NOTE (Form 05) & AUTO-STOCK UPDATE ---
        if (action === "GENERATE_GRN") {
            const { poId, productId, receivedQty, condition, notes, expiryDate, batchNumber } = body;
            const pos = readJson(PO_FILE);
            const poIndex = pos.findIndex(p => p.id === poId);
            if (poIndex === -1) return NextResponse.json({ error: "PO not found" }, { status: 404 });

            const grn = {
                id: `GRN-${Date.now()}`,
                poId,
                vendorName: pos[poIndex].vendorName,
                itemName: pos[poIndex].itemName,
                receivedQty: parseInt(receivedQty),
                condition, // INTACT, DAMAGED
                notes,
                receivedBy: session.user.name || session.user.email,
                createdAt: new Date().toISOString()
            };

            const grns = readJson(GRN_FILE);
            grns.unshift(grn);
            writeJson(GRN_FILE, grns);

            pos[poIndex].status = "DELIVERED";
            writeJson(PO_FILE, pos);

            // Update Prisma Stock immediately
            if (productId && condition === "INTACT") {
                const qty = parseInt(receivedQty);
                // Calculate unit price for stock log
                const buyingPrice = pos[poIndex].finalAmount / (pos[poIndex].quantity || 1);
                
                await prisma.stockLog.create({
                    data: {
                        productId,
                        quantity: qty,
                        buyingPrice,
                        type: "RESTOCK_GRN"
                    }
                });

                const updateData = { stock: { increment: qty } };
                if (expiryDate) updateData.expiryDate = new Date(expiryDate);
                if (batchNumber) updateData.batchNumber = batchNumber;

                await prisma.product.update({
                    where: { id: productId },
                    data: updateData
                });
            }

            return NextResponse.json({ success: true, grn });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    } catch (error) {
        console.error("Procurement API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
