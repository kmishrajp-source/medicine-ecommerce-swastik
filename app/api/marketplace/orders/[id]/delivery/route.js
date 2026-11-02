/**
 * PATCH /api/marketplace/orders/[id]/delivery
 * Update delivery status for a HealthMart confirmed order.
 *
 * Valid delivery statuses:
 *   PENDING_DISPATCH → DISPATCHED → IN_TRANSIT → OUT_FOR_DELIVERY → DELIVERED
 *   (or CANCELLED at any point)
 */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { updateDeliveryStatus } from "@/lib/healthmart/store";

const VALID_STATUSES = ["PENDING_DISPATCH", "DISPATCHED", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"];

export async function PATCH(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;
    const body = await req.json();
    const deliveryStatus = body.deliveryStatus || body.status;
    const notes = body.notes || body.deliveryNotes || "";

    if (!deliveryStatus || !VALID_STATUSES.includes(deliveryStatus)) {
      return NextResponse.json(
        { success: false, error: `deliveryStatus must be one of: ${VALID_STATUSES.join(", ")}` },
        { status: 400 }
      );
    }

    const result = await updateDeliveryStatus(id, deliveryStatus, notes);

    return NextResponse.json({
      success: true,
      order: result,
      message: `Delivery status updated to ${deliveryStatus}`,
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
