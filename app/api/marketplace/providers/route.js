import { NextResponse } from "next/server";
import { getUnifiedProviders } from "@/lib/healthmart/provider-adapter";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get("category");
    const city = searchParams.get("city") || "Gorakhpur";
    const query = searchParams.get("q") || "";

    const providers = await getUnifiedProviders({
      categorySlug: categorySlug || undefined,
      city,
      query
    });

    return NextResponse.json({
      success: true,
      count: providers.length,
      providers
    });
  } catch (error) {
    console.error("HealthMart Providers API error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

