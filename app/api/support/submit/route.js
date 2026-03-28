import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req) {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    try {
        const body = await req.json();
        const { type } = body; // "complaint", "suggestion", "experience"

        if (type === "complaint") {
            const { subject, description, orderId, priority } = body;
            if (!userId) return NextResponse.json({ error: "Must be logged in to file a complaint." }, { status: 401 });

            const complaint = await prisma.complaint.create({
                data: {
                    userId,
                    subject,
                    description,
                    orderId: orderId || null,
                    priority: priority || "Medium"
                }
            });
            return NextResponse.json({ success: true, complaint });
        }

        else if (type === "suggestion") {
            const { title, description, category, guestName, guestEmail } = body;
            // Suggestions can be anonymous/guest
            const suggestion = await prisma.suggestion.create({
                data: {
                    userId: userId || null,
                    guestName: guestName || null,
                    guestEmail: guestEmail || null,
                    title,
                    description,
                    category: category || "General"
                }
            });
            return NextResponse.json({ success: true, suggestion });
        }

        else if (type === "experience") {
            const { rating, feedback, orderId, category } = body;

            const experience = await prisma.customerExperience.create({
                data: {
                    userId: userId || null,
                    orderId: orderId || null,
                    rating: parseInt(rating),
                    feedback,
                    category: category || "General"
                }
            });
            return NextResponse.json({ success: true, experience });
        }

        return NextResponse.json({ error: "Invalid submission type" }, { status: 400 });

    } catch (error) {
        console.error("Support Submission Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
