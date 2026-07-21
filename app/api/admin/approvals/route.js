import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { sendWhatsAppNotification } from "@/lib/whatsapp";

export async function GET(req) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const [doctors, labs, pharmas, mrs, hospitals, retailers, stockists, distributors] = await Promise.all([
            prisma.doctor.findMany({ where: { verified: false }, include: { user: true } }).catch(() => []),
            prisma.lab.findMany({ where: { verified: false }, include: { user: true } }).catch(() => []),
            prisma.pharmaCompany.findMany({ where: { verified: false }, include: { user: true } }).catch(() => []),
            prisma.medicalRep.findMany({ where: { verified: false }, include: { user: true } }).catch(() => []),
            prisma.hospital.findMany({ where: { verified: false } }).catch(() => []),
            prisma.retailer.findMany({ where: { verified: false } }).catch(() => []),
            prisma.stockist.findMany({ where: { verified: false } }).catch(() => []),
            prisma.distributor.findMany({ where: { verified: false } }).catch(() => [])
        ]);

        return NextResponse.json({
            success: true,
            pending: { doctors, labs, pharmas, mrs, hospitals, retailers, stockists, distributors }
        });
    } catch (error) {
        console.error("Admin Approvals GET Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { type, id, action } = await req.json(); // action: 'approve' or 'reject'
    const verified = action === 'approve';

    try {
        let phoneToNotify = null;
        let partnerName = "";

        if (type === 'doctor') {
            const doc = await prisma.doctor.update({ where: { id }, data: { verified, status: verified ? 'verified' : 'rejected' } });
            phoneToNotify = doc.phone; partnerName = doc.name;
        } else if (type === 'lab') {
            const lab = await prisma.lab.update({ where: { id }, data: { verified, status: verified ? 'verified' : 'rejected' } });
            phoneToNotify = lab.phone; partnerName = lab.name;
        } else if (type === 'pharma') {
            const pc = await prisma.pharmaCompany.update({ where: { id }, data: { verified } });
            phoneToNotify = pc.phone; partnerName = pc.companyName;
        } else if (type === 'mr') {
            const mr = await prisma.medicalRep.update({ where: { id }, data: { verified, status: verified ? 'Active' : 'Rejected' } });
            phoneToNotify = mr.phone; partnerName = mr.name;
        } else if (type === 'hospital') {
            const hosp = await prisma.hospital.update({ where: { id }, data: { verified } });
            phoneToNotify = hosp.phone; partnerName = hosp.name;
        } else if (type === 'retailer') {
            const ret = await prisma.retailer.update({ where: { id }, data: { verified, status: verified ? 'verified' : 'rejected' } });
            phoneToNotify = ret.phone; partnerName = ret.shopName;
        } else if (type === 'stockist') {
            const stk = await prisma.stockist.update({ where: { id }, data: { verified } });
            phoneToNotify = stk.phone; partnerName = stk.agencyName;
        } else if (type === 'distributor') {
            const dist = await prisma.distributor.update({ where: { id }, data: { verified } });
            phoneToNotify = dist.phone; partnerName = dist.companyName;
        }

        // WhatsApp notification if verified
        if (verified && phoneToNotify) {
            try {
                await sendWhatsAppNotification(
                    phoneToNotify,
                    `🎉 CONGRATULATIONS ${partnerName || ''}!\n\nYour partner verification application on Swastik Medicare has been APPROVED by our administration.\n\nYou are now an official verified partner and can access all platform features.`
                );
            } catch (e) {
                console.warn("WhatsApp approval notice error:", e.message);
            }
        }

        return NextResponse.json({ success: true, verified });
    } catch (error) {
        console.error("Admin Approvals POST Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
