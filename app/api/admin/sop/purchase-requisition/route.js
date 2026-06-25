import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { sendSMS } from "@/lib/sms";
import fs from "fs";
import path from "path";

const LOG_FILE = path.join(process.cwd(), "data", "purchase-requisitions.json");

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

// POST — Create new Purchase Requisition
export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { itemName, quantity, unit, urgency, supplier, estimatedCost, notes, requestedBy } = body;

        if (!itemName || !quantity || !urgency) {
            return NextResponse.json({ error: "Item name, quantity and urgency are required." }, { status: 400 });
        }

        const requisition = {
            id: `PR-${Date.now()}`,
            itemName,
            quantity,
            unit: unit || "units",
            urgency, // LOW / MEDIUM / HIGH / CRITICAL
            supplier: supplier || "TBD",
            estimatedCost: estimatedCost || 0,
            notes: notes || "",
            requestedBy: requestedBy || session.user.name || session.user.email,
            status: "PENDING",
            createdAt: new Date().toISOString(),
        };

        // Save to JSON log
        const existing = readLog();
        existing.unshift(requisition);
        writeLog(existing);

        // Send WhatsApp alert to admin
        const adminPhone = "917992122974";
        const urgencyEmoji = urgency === "CRITICAL" ? "🚨" : urgency === "HIGH" ? "🔴" : urgency === "MEDIUM" ? "🟡" : "🟢";
        const waMessage = `${urgencyEmoji} *PURCHASE REQUISITION - ${requisition.id}*\n\nItem: *${itemName}*\nQty: ${quantity} ${unit || "units"}\nUrgency: ${urgency}\nSupplier: ${supplier || "TBD"}\nEst. Cost: ₹${estimatedCost || "TBD"}\nRequested By: ${requisition.requestedBy}\n\nNotes: ${notes || "None"}\n\nPlease review at: https://medicine-ecommerce-swastik.vercel.app/en/admin/sop/purchase-requisition`;

        await sendSMS(adminPhone, waMessage).catch(() => {});

        return NextResponse.json({ success: true, requisition }, { status: 201 });
    } catch (error) {
        console.error("Purchase Requisition Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// GET — List all Purchase Requisitions
export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status");
        let data = readLog();
        if (status) data = data.filter(r => r.status === status);

        return NextResponse.json({ success: true, requisitions: data, total: data.length });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// PATCH — Update requisition status
export async function PATCH(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id, status } = await req.json();
        const data = readLog();
        const idx = data.findIndex(r => r.id === id);
        if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

        data[idx].status = status;
        data[idx].updatedAt = new Date().toISOString();
        writeLog(data);

        return NextResponse.json({ success: true, requisition: data[idx] });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
