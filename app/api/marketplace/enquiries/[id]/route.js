import { NextResponse } from "next/server";
import { getEnquiryByIdOrNumber } from "@/lib/healthmart/store";

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const enquiry = await getEnquiryByIdOrNumber(id);

    if (!enquiry) {
      return NextResponse.json({ success: false, error: "Enquiry not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, enquiry });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

