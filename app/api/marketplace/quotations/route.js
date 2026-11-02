import { NextResponse } from "next/server";
import { submitProviderQuotation } from "@/lib/healthmart/store";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();

    if (!body.enquiryId || !body.providerId || !body.providerBusinessName) {
      return NextResponse.json({
        success: false,
        error: "Enquiry ID, provider details, and business name are required."
      }, { status: 400 });
    }

    if (!body.totalAmount || body.totalAmount <= 0) {
      return NextResponse.json({
        success: false,
        error: "Quotation must specify a valid non-zero total amount."
      }, { status: 400 });
    }

    const quotation = await submitProviderQuotation({
      ...body,
      providerUserId: session?.user?.id || null
    });

    return NextResponse.json({
      success: true,
      message: quotation.isRevised ? "Quotation revised successfully." : "Quotation submitted successfully to buyer.",
      quoteNumber: quotation.quoteNumber,
      quotation
    });
  } catch (error) {
    console.error("Quotation submission error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

