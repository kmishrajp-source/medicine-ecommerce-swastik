import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        let masterUser = await prisma.user.findFirst({
            where: { role: 'ADMIN' }
        });

        if (!masterUser) {
            masterUser = await prisma.user.create({
                data: {
                    email: 'labadmin@swastik.com',
                    password: 'password123',
                    name: 'Swastik Diagnostics',
                    role: 'ADMIN'
                }
            });
        }

        let mainLab = await prisma.lab.findUnique({
            where: { userId: masterUser.id }
        });

        if (!mainLab) {
            mainLab = await prisma.lab.create({
                data: {
                    userId: masterUser.id,
                    name: 'Swastik National Diagnostics',
                    address: '123 Medical Hub, New Delhi',
                    licenseNumber: 'LAB-IND-001',
                    phone: '1800-123-4567',
                    verified: true
                }
            });
        }

        const testsToCreate = [
            { name: 'CBC (Complete Blood Count)', price: 200, description: 'Basic blood health screening. Evaluates overall health and detects a wide range of disorders.', turnaroundTime: '12 Hours' },
            { name: 'Liver Function Test (LFT)', price: 600, description: 'Measures the levels of proteins, liver enzymes, and bilirubin in your blood.', turnaroundTime: '24 Hours' },
            { name: 'Kidney Function Test (KFT)', price: 600, description: 'Measures GFR, creatinine, and BUN to evaluate kidney health.', turnaroundTime: '24 Hours' },
            { name: 'Lipid Profile', price: 700, description: 'Cholesterol screening including HDL, LDL, and Triglycerides to determine heart disease risk.', turnaroundTime: '24 Hours' },
            { name: 'Thyroid Panel (T3, T4, TSH)', price: 500, description: 'Evaluates thyroid gland function and helps diagnose hyperthyroidism or hypothyroidism.', turnaroundTime: '24 Hours' },
            { name: 'HbA1c', price: 450, description: 'Measures average blood sugar levels over the past 3 months for long-term diabetes monitoring.', turnaroundTime: '12 Hours' },
            { name: 'Blood Glucose Fasting', price: 150, description: 'Check fasting blood sugar levels. Essential for diabetes tracking. Requires 8-10 hours fasting.', turnaroundTime: '6 Hours' },
            { name: 'Vitamin D', price: 1100, description: 'Vitamin D 25-Hydroxy test to check for bone health and immune system deficiencies.', turnaroundTime: '24 Hours' },
            { name: 'PCR Test (COVID‑19)', price: 900, description: 'RT-PCR test for detecting the SARS-CoV-2 virus.', turnaroundTime: '24 Hours' },
            { name: 'ECG (Electrocardiogram)', price: 500, description: 'Records the electrical signal from your heart to check for different heart conditions.', turnaroundTime: '1 Hour (Home Collection limit)' }
        ];

        let createdCount = 0;
        for (const t of testsToCreate) {
            const existing = await prisma.labTest.findFirst({
                where: { name: t.name, labId: mainLab.id }
            });
            if (!existing) {
                await prisma.labTest.create({
                    data: {
                        labId: mainLab.id,
                        name: t.name,
                        price: t.price,
                        description: t.description,
                        turnaroundTime: t.turnaroundTime
                    }
                });
                createdCount++;
            }
        }

        return NextResponse.json({ success: true, message: `Created ${createdCount} tests`, lab: mainLab.name });
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
