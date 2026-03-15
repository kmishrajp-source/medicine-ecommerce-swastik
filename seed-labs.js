require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const PRISMA_DATABASE_URL = "postgresql://postgres:Shivangi%40%23%242004@db.kklkpnzwxaxekxraqswh.supabase.co:5432/postgres";
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: PRISMA_DATABASE_URL,
    },
  },
});

async function main() {
    console.log("Starting Lab Test Seed...");

    // 1. Ensure an Admin user exists for the Lab or create a Master Lab Partner
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

    // 2. Ensure the Lab exists
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

    // 3. The requested Lab Tests
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
            console.log(`Created test: ${t.name}`);
        } else {
            console.log(`Test already exists: ${t.name}`);
        }
    }

    console.log("Lab Seed Completed!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
