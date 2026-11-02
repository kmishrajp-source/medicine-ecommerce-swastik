import { NextResponse } from "next/server";
import { updateQuotationStatus, getQuotationById } from "@/lib/healthmart/store";

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const quotation = await getQuotationById(id);

    if (!quotation) {
      return NextResponse.json({ success: false, error: "Quotation not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, quotation });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, rejectionReason } = body;

    if (!status || !["ACCEPTED", "REJECTED", "WITHDRAWN"].includes(status)) {
      return NextResponse.json({
        success: false,
        error: "Valid status (ACCEPTED, REJECTED, WITHDRAWN) is required."
      }, { status: 400 });
    }

    const updated = await updateQuotationStatus(id, status, rejectionReason);
    return NextResponse.json({
      success: true,
      message: `Quotation ${status.toLowerCase()} successfully.`,
      quotation: updated
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

