import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET - check whether the current user's partner profile is verified
export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;
        const role = session.user.role;

        let status = { verified: true, partnerType: role }; // Default: assume verified

        if (role === 'RETAILER') {
            const r = await prisma.retailer.findFirst({ where: { userId }, select: { verified: true, shopName: true } });
            if (r) status = { verified: r.verified, partnerType: 'Pharmacy Retailer', name: r.shopName };
        } else if (role === 'DOCTOR') {
            const d = await prisma.doctor.findFirst({ where: { userId }, select: { verified: true, name: true, status: true } });
            if (d) status = { verified: d.verified, partnerType: 'Doctor', name: d.name };
        } else if (role === 'LAB') {
            const l = await prisma.lab.findFirst({ where: { userId }, select: { verified: true, name: true } });
            if (l) status = { verified: l.verified, partnerType: 'Diagnostic Lab', name: l.name };
        } else if (role === 'PHARMA') {
            const p = await prisma.pharmaCompany.findFirst({ where: { userId }, select: { verified: true, companyName: true } });
            if (p) status = { verified: p.verified, partnerType: 'Pharma Company', name: p.companyName };
        } else if (role === 'MEDICAL_REP') {
            const mr = await prisma.medicalRep.findFirst({ where: { userId }, select: { verified: true, name: true } });
            if (mr) status = { verified: mr.verified, partnerType: 'Medical Representative', name: mr.name };
        } else if (role === 'HOSPITAL') {
            const h = await prisma.hospital.findFirst({ where: { userId }, select: { verified: true, name: true } });
            if (h) status = { verified: h.verified, partnerType: 'Hospital', name: h.name };
        } else if (role === 'STOCKIST') {
            const s = await prisma.stockist.findFirst({ where: { userId }, select: { verified: true, agencyName: true } });
            if (s) status = { verified: s.verified, partnerType: 'Stockist', name: s.agencyName };
        }

        return NextResponse.json({ success: true, ...status });

    } catch (error) {
        console.error('Partner Status Check Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
