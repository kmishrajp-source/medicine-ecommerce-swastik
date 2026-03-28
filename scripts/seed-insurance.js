const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("--- 🏗️ Seeding Medical Insurance Data ---");

    // 1. Create Insurance Companies
    const companies = [
        {
            name: "Star Health Insurance",
            description: "India's first standalone health insurance provider.",
            email: "support@starhealth.in",
            website: "https://www.starhealth.in"
        },
        {
            name: "HDFC ERGO",
            description: "A joint venture between HDFC and ERGO International AG.",
            email: "care@hdfcergo.com",
            website: "https://www.hdfcergo.com"
        },
        {
            name: "Niva Bupa Health",
            description: "Expertise of Bupa, the global health leader.",
            email: "customercare@nivabupa.com",
            website: "https://www.nivabupa.com"
        }
    ];

    for (const comp of companies) {
        const createdComp = await prisma.insuranceCompany.upsert({
            where: { id: comp.name.toLowerCase().replace(/\s+/g, '-') }, // Using name as ID base for deterministic seed
            update: {},
            create: {
                id: comp.name.toLowerCase().replace(/\s+/g, '-'),
                ...comp
            }
        });

        console.log(`✅ Company Created: ${createdComp.name}`);

        // 2. Create Plans for each company
        const plans = [
            {
                name: `${comp.name} Premier Health`,
                description: "Comprehensive coverage for individual and family.",
                coverageType: "Family",
                premium: 12500 + Math.random() * 5000,
                commissionRate: 15.5,
                features: ["Cashless Hospitalization", "No Claim Bonus", "Day Care Procedures", "Air Ambulance"]
            },
            {
                name: `${comp.name} Optima Secure`,
                description: "Critical illness and emergency cover.",
                coverageType: "Individual",
                premium: 8500 + Math.random() * 3000,
                commissionRate: 12.0,
                features: ["Critical Illness Cover", "Free Health Checkup", "Pre/Post Hospitalization"]
            }
        ];

        for (const plan of plans) {
            await prisma.insurancePlan.create({
                data: {
                    companyId: createdComp.id,
                    ...plan
                }
            });
            console.log(`   📦 Plan Created: ${plan.name}`);
        }
    }

    console.log("--- ✅ Seeding Completed ---");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
