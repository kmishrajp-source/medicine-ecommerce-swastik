import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req) {
    try {
        const body = await req.json();
        const { name, email, password, phone, type, ...extraData } = body;

        if (!email || !password || !type) {
            return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ success: false, error: "Email already registered" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Map UI type to Database Role
        const roleMap = {
            'doctor': 'DOCTOR',
            'retailer': 'RETAILER',
            'insurance': 'INSURANCE', // We will use this role
            'lab': 'LAB'
        };

        const role = roleMap[type] || 'CUSTOMER';

        // Create User
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role,
            }
        });

        // Create Sector-Specific Profile
        if (type === 'doctor') {
            await prisma.doctor.create({
                data: {
                    userId: user.id,
                    name,
                    specialization: extraData.specialization || "General",
                    hospital: extraData.hospital || "Private Clinic",
                    experience: parseInt(extraData.experience) || 0,
                    phone: phone || "",
                    status: "self_registered",
                    source: "self_registered"
                }
            });
        } else if (type === 'retailer') {
            await prisma.retailer.create({
                data: {
                    userId: user.id,
                    shopName: name, // In schema it is shopName
                    address: extraData.address || "Local Area",
                    phone: phone || "",
                    licenseNumber: extraData.licenseNumber || "PENDING",
                    status: "self_registered",
                    source: "self_registered"
                }
            });
        } else if (type === 'insurance') {
            const company = await prisma.insuranceCompany.create({
                data: {
                    name: extraData.companyName || `${name} Insurance`,
                    email: email,
                    phone: phone || "",
                    description: "Managed by Partner",
                }
            });
            // Link user to company
            await prisma.user.update({
                where: { id: user.id },
                data: { insuranceCompanyId: company.id }
            });
        }

        return NextResponse.json({ success: true, message: "Partner registered successfully" });

    } catch (error) {
        console.error("Partner registration error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
