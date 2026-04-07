import { NextResponse } from "next/server";
import { logAuditEntry } from "@/lib/audit";

export async function POST(req) {
    try {
        const body = await req.json();
        const { event, params } = body;

        // Secure Audit Logging
        const result = await logAuditEntry(event, params);

        return NextResponse.json({ success: result.success });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
