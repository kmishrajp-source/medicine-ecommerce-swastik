/**
 * GET /api/marketplace/orders
 * List HealthMart confirmed orders (for buyer history / admin tracking)
 */
import { NextResponse } from "next/server";
import { getHealthMartOrders } from "@/lib/healthmart/store";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const enquiryId = searchParams.get("enquiryId");
    const buyerId = searchParams.get("buyerId");

    const orders = await getHealthMartOrders({ enquiryId, buyerId });

    return NextResponse.json({ success: true, count: orders.length, orders });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

