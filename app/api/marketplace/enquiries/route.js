import { NextResponse } from "next/server";
import { createBuyerEnquiry, getBuyerEnquiries } from "@/lib/healthmart/store";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get("category");
    const status = searchParams.get("status");
    const buyerId = searchParams.get("buyerId");

    const enquiries = await getBuyerEnquiries({ categorySlug, status, buyerId });
    return NextResponse.json({ success: true, count: enquiries.length, enquiries });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();

    // 1. Validation
    if (!body.title || !body.description || !body.categorySlug) {
      return NextResponse.json({
        success: false,
        error: "Title, description, and healthcare category are required."
      }, { status: 400 });
    }

    if (!body.buyerName || !body.buyerPhone) {
      return NextResponse.json({
        success: false,
        error: "Buyer contact name and phone number are required."
      }, { status: 400 });
    }

    // Phone validation
    const cleanPhone = body.buyerPhone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      return NextResponse.json({
        success: false,
        error: "Please enter a valid 10-digit mobile number."
      }, { status: 400 });
    }

    // Healthcare Emergency Safeguard
    if (body.categorySlug === "ambulance-and-medical-transport" && body.categorySpecificData?.urgencyTier?.includes("EMERGENCY")) {
      return NextResponse.json({
        success: false,
        isEmergency: true,
        error: "CRITICAL: For immediate life-threatening medical emergencies, please dial 108 or 102 directly. Do not wait for marketplace quotation workflows.",
        emergencyNumbers: ["108 (State Emergency Ambulance)", "102 (Pregnancy / Child Emergency)"]
      }, { status: 400 });
    }

    // Regulated Medicine Safeguard
    if (body.categorySlug === "pharmacy-and-medicines" && body.categorySpecificData?.prescriptionAvailable?.includes("No")) {
      if (body.categorySpecificData?.medicineType?.includes("Schedule") || body.description?.toLowerCase().includes("antibiotic")) {
        return NextResponse.json({
          success: false,
          error: "Under Indian Drugs and Cosmetics Rules, Schedule H/H1 prescription medicines cannot be requested without a valid Doctor's prescription. Please select OTC products or upload your prescription."
        }, { status: 400 });
      }
    }

    // 2. Submit RFQ through store
    const enquiry = await createBuyerEnquiry({
      ...body,
      buyerId: session?.user?.id || null,
      source: "marketplace_web"
    });

    return NextResponse.json({
      success: true,
      message: "Enquiry submitted successfully. Matched providers have been notified.",
      enquiryNumber: enquiry.enquiryNumber,
      enquiryId: enquiry.id,
      matchedProvidersCount: enquiry.matches?.length || 0,
      enquiry
    });
  } catch (error) {
    console.error("Enquiry submission error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

