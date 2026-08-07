import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const PACK_FILE = path.join(DATA_DIR, "packing-logs.json");

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

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { orderId, checklist, packedBy } = body;

        if (!orderId) return NextResponse.json({ error: "Order ID required" }, { status: 400 });

        const logs = readJson(PACK_FILE);
        const log = {
            id: `PACK-${Date.now()}`,
            orderId,
            checklist,
            packedBy,
            completedAt: new Date().toISOString(),
        };
        logs.unshift(log);
        writeJson(PACK_FILE, logs);

        return NextResponse.json({ success: true, log });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const logs = readJson(PACK_FILE);
        return NextResponse.json({ success: true, logs });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
