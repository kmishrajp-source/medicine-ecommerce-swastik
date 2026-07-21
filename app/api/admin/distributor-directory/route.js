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
                    { companyName: { contains: q, mode: 'insensitive' } },
                    { phone: { contains: q } },
                    { ownerName: { contains: q, mode: 'insensitive' } },
                    { brands: { contains: q, mode: 'insensitive' } },
                ]} : {},
                city ? { city: { contains: city, mode: 'insensitive' } } : {},
            ]
        };

        const [distributors, total] = await Promise.all([
            prisma.distributor.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit
            }),
            prisma.distributor.count({ where })
        ]);

        return NextResponse.json({ success: true, distributors, total, page, totalPages: Math.ceil(total / limit) });
    } catch (error) {
        console.error("Distributor Directory GET Error:", error);
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
                if (!row.companyName || !row.phone || !row.city || !row.address) continue;
                await prisma.distributor.create({
                    data: {
                        companyName: row.companyName,
                        ownerName: row.ownerName || null,
                        phone: row.phone,
                        altPhone: row.altPhone || null,
                        email: row.email || null,
                        address: row.address,
                        city: row.city,
                        pincode: row.pincode || null,
                        state: row.state || 'Uttar Pradesh',
                        gstin: row.gstin || null,
                        drugLicenseNo: row.drugLicenseNo || null,
                        brands: row.brands || null,
                        coverageArea: row.coverageArea || null,
                        source: 'csv_import'
                    }
                }).catch(() => null);
                created++;
            }
            return NextResponse.json({ success: true, created });
        }

        // Single entry
        const { companyName, ownerName, phone, altPhone, email, address, city, pincode, state, gstin, drugLicenseNo, brands, coverageArea, notes } = body;
        if (!companyName || !phone || !city || !address) {
            return NextResponse.json({ error: "companyName, phone, city, address are required" }, { status: 400 });
        }

        const distributor = await prisma.distributor.create({
            data: { companyName, ownerName, phone, altPhone, email, address, city, pincode, state: state || 'Uttar Pradesh', gstin, drugLicenseNo, brands, coverageArea, notes }
        });

        return NextResponse.json({ success: true, distributor });
    } catch (error) {
        console.error("Distributor Directory POST Error:", error);
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

        const updated = await prisma.distributor.update({ where: { id }, data });
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

        await prisma.distributor.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
