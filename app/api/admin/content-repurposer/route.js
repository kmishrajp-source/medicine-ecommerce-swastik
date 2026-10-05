import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user?.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Fetch tracking metrics for SocialContentCampaigns
    const campaigns = await prisma.socialContentCampaign.findMany({
      orderBy: { createdAt: 'desc' }
    });

    // Group tracking metrics by Campaign Name
    const trackedCampaigns = {};
    for (const c of campaigns) {
      if (!trackedCampaigns[c.campaignName]) {
        trackedCampaigns[c.campaignName] = {
          name: c.campaignName,
          platforms: [],
          totalReach: 0,
          totalClicks: 0,
          totalWaInqs: 0,
          totalLeads: 0,
          totalCustomers: 0,
          totalOrders: 0,
          totalRevenue: 0
        };
      }
      
      trackedCampaigns[c.campaignName].platforms.push({
        platform: c.platform,
        reach: c.reach,
        clicks: c.clicks,
        waInqs: c.whatsappInqs,
        leads: c.leadsGenerated,
        customers: c.customersAcquired,
        orders: c.ordersGenerated,
        revenue: c.revenueGenerated
      });

      trackedCampaigns[c.campaignName].totalReach += c.reach;
      trackedCampaigns[c.campaignName].totalClicks += c.clicks;
      trackedCampaigns[c.campaignName].totalWaInqs += c.whatsappInqs;
      trackedCampaigns[c.campaignName].totalLeads += c.leadsGenerated;
      trackedCampaigns[c.campaignName].totalCustomers += c.customersAcquired;
      trackedCampaigns[c.campaignName].totalOrders += c.ordersGenerated;
      trackedCampaigns[c.campaignName].totalRevenue += c.revenueGenerated;
    }

    return NextResponse.json({
      success: true,
      data: Object.values(trackedCampaigns)
    });

  } catch (error) {
    console.error("Content Repurposer API Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

// Generate the repurposed content logic
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user?.role)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { articleTopic } = await req.json();

    if (!articleTopic) {
      return NextResponse.json({ success: false, error: "Article topic is required" }, { status: 400 });
    }

    // In a real system, we would prompt OpenAI/Gemini here.
    // For this demonstration, we map out exactly the repurposed structures.
    const repurposed = {
      article: `[SEO Optimized Blog Article] Understanding ${articleTopic}. Comprehensive guide on symptoms, prevention, and Swastik Medicare's fast delivery of related generic and branded solutions.`,
      facebook: `Did you know? ${articleTopic} affects thousands locally in Gorakhpur. Read our latest guide on how to stay ahead, and get your medicines delivered in 3 hours with Swastik Medicare! 👉 [Link]`,
      instagram: `[Carousel Image Idea: 3 Tips for ${articleTopic}]\nStay healthy with Swastik Medicare. Fast delivery, genuine medicines. Link in bio to read our new guide! #GorakhpurHealth #SwastikMedicare`,
      whatsapp: `*Swastik Health Update* ⚕️\nWe just published a new guide on *${articleTopic}*.\n\nReply 'ORDER' if you need any related prescription refills delivered today, or click here to read the guide: [Link]\n\n- Your Swastik Medicare Team`,
      gbp: `New Health Guide: ${articleTopic}. Visit Swastik Medicare online or call us for authentic medicines delivered directly to your home in Gorakhpur.`,
      videoScript: `[Hook]: 3 things you didn't know about ${articleTopic}.\n[Body]: Point 1, Point 2, Point 3.\n[CTA]: Need authentic medicines fast? Download the Swastik Medicare app today for 3-hour local delivery!`
    };

    // Initialize tracking rows for this new campaign
    const platforms = ["ARTICLE", "FACEBOOK", "INSTAGRAM", "WHATSAPP", "GBP", "VIDEO_SCRIPT"];
    for (const p of platforms) {
      await prisma.socialContentCampaign.create({
        data: {
          campaignName: articleTopic,
          platform: p
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: repurposed
    });

  } catch (error) {
    console.error("Content Generation API Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
