import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
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

    // Provider auth scope: a provider can only WITHDRAW their own quotation.
    // Buyers (ACCEPTED/REJECTED) are not subject to this check.
    if (status === "WITHDRAWN") {
      const session = await getServerSession(authOptions);
      if (session?.user?.id) {
        const existingQuotation = await getQuotationById(id);
        if (
          existingQuotation &&
          existingQuotation.providerUserId &&
          existingQuotation.providerUserId !== session.user.id
        ) {
          return NextResponse.json(
            { success: false, error: "Forbidden: you can only withdraw your own quotation." },
            { status: 403 }
          );
        }
      }
    }

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

