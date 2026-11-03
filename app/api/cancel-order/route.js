import { NextResponse } from "next/server";
import { POST as cancelByIdHandler } from "@/app/api/orders/[id]/cancel/route";

export async function POST(req) {
    try {
        const body = await req.json();
        const { orderId } = body;
        if (!orderId) {
            return NextResponse.json({ success: false, error: "orderId is required" }, { status: 400 });
        }

        // Delegate to canonical cancellation route
        const syntheticReq = new Request(req.url, {
            method: "POST",
            headers: req.headers,
            body: JSON.stringify(body)
        });

        return cancelByIdHandler(syntheticReq, { params: Promise.resolve({ id: orderId }) });
    } catch (err) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}

