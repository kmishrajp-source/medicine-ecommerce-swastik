import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user?.role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const q = searchParams.get('q') || '';
        const city = searchParams.get('city') || '';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = 20;

        const where = {
            AND: [
                q ? { OR: [
                    { agencyName: { contains: q, mode: 'insensitive' } },
                    { phone: { contains: q } },
                    { ownerName: { contains: q, mode: 'insensitive' } },
                ]} : {},
                city ? { city: { contains: city, mode: 'insensitive' } } : {},
            ]
        };

        const [stockists, total] = await Promise.all([
            prisma.stockistDirectory.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit
            }),
            prisma.stockistDirectory.count({ where })
        ]);

        return NextResponse.json({ success: true, stockists, total, page, totalPages: Math.ceil(total / limit) });
    } catch (error) {
        console.error("Stockist Directory GET Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user?.role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        
        // Handle bulk CSV import
        if (body.bulk && Array.isArray(body.bulk)) {
            let created = 0;
            for (const row of body.bulk) {
                if (!row.agencyName || !row.phone || !row.city || !row.address) continue;
                await prisma.stockistDirectory.upsert({
                    where: { id: row.id || 'new_' + Date.now() + Math.random() },
                    update: {},
                    create: {
                        agencyName: row.agencyName,
                        ownerName: row.ownerName || null,
                        phone: row.phone,
                        altPhone: row.altPhone || null,
                        email: row.email || null,
                        address: row.address,
                        city: row.city,
                        pincode: row.pincode || null,
                        state: row.state || 'Uttar Pradesh',
                        gstin: row.gstin || null,
                        licenseNumber: row.licenseNumber || null,
                        speciality: row.speciality || null,
                        source: 'csv_import'
                    }
                }).catch(() => null);
                created++;
            }
            return NextResponse.json({ success: true, created });
        }

        // Single entry
        const { agencyName, ownerName, phone, altPhone, email, address, city, pincode, state, gstin, licenseNumber, speciality, notes } = body;
        if (!agencyName || !phone || !city || !address) {
            return NextResponse.json({ error: "agencyName, phone, city, address are required" }, { status: 400 });
        }

        const stockist = await prisma.stockistDirectory.create({
            data: { agencyName, ownerName, phone, altPhone, email, address, city, pincode, state: state || 'Uttar Pradesh', gstin, licenseNumber, speciality, notes }
        });

        return NextResponse.json({ success: true, stockist });
    } catch (error) {
        console.error("Stockist Directory POST Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user?.role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { id, ...data } = body;
        if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

        const updated = await prisma.stockistDirectory.update({ where: { id }, data });
        return NextResponse.json({ success: true, updated });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.user?.role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

        await prisma.stockistDirectory.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
