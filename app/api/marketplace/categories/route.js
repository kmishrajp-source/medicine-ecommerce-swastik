import { NextResponse } from "next/server";
import { HEALTHMART_CATEGORIES } from "@/lib/healthmart/categories";

export async function GET(req) {
  try {
    return NextResponse.json({
      success: true,
      categories: HEALTHMART_CATEGORIES,
      total: HEALTHMART_CATEGORIES.length
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

