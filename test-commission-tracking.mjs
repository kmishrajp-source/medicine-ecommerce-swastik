import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runCommissionDemo() {
    console.log("=== STARTING COMMISSION & REFERRAL TRACKING DEMO ===");
    try {
        // 1. Create a Referrer, a Patient, a Doctor, and a Rider
        console.log("\n1️⃣ Setting up Users (Referrer, Patient, Doctor, Rider)...");
        
        const referrer = await prisma.user.upsert({
            where: { email: 'referrer@swastik.com' },
            update: {},
            create: { email: 'referrer@swastik.com', name: 'Agent Amit', password: 'hash', role: 'CUSTOMER', referralCode: 'AMIT50' }
        });

        const patient = await prisma.user.upsert({
            where: { email: 'referred-patient@swastik.com' },
            update: {},
            create: { email: 'referred-patient@swastik.com', name: 'Patient Rahul', password: 'hash', role: 'CUSTOMER' }
        });

        const doctorUser = await prisma.user.upsert({
            where: { email: 'commission-doctor@swastik.com' },
            update: {},
            create: { email: 'commission-doctor@swastik.com', name: 'Dr. Neha', password: 'hash', role: 'DOCTOR' }
        });

        const doctor = await prisma.doctor.findFirst({ where: { user: { email: 'commission-doctor@swastik.com' } } }) || await prisma.doctor.create({
            data: {
                user: { connect: { id: doctorUser.id } },
                name: 'Dr. Neha',
                city: 'Delhi',
                specialization: 'Dermatologist',
                verified: true
            }
        });
        
        const consultationFee = 500;

        console.log(`✅ Referrer: ${referrer.name} (Code: ${referrer.referralCode})`);
        console.log(`✅ Patient: ${patient.name}`);
        console.log(`✅ Doctor: ${doctorUser.name} (Fee: ₹${consultationFee})`);

        // 2. Patient Uses Referral Code & Books Doctor Consultation
        console.log("\n2️⃣ Patient Rahul uses Agent Amit's referral code and books Dr. Neha...");
        
        const appointmentDate = new Date();
        const appointment = await prisma.appointment.create({
            data: {
                patientId: patient.id,
                doctorId: doctor.id,
                date: appointmentDate,
                status: 'Completed',
                reason: 'Skin allergy consultation'
            }
        });

        console.log(`🏥 Consultation Completed! Patient paid ₹${consultationFee}`);

        // 3. System Calculates Doctor Revenue vs Platform Commission
        console.log("\n3️⃣ Calculating Dispatch & Revenue Commissions...");
        const platformCommissionRate = 0.10; // 10% Platform fee
        const platformFee = consultationFee * platformCommissionRate;
        const doctorPayout = consultationFee - platformFee;

        console.log(`💰 Platform Commission (10%): ₹${platformFee}`);
        console.log(`💰 Doctor's Net Settlement: ₹${doctorPayout}`);

        // Generate Financial Settlement Record for Doctor
        // Note: Prisma schema uses generic string for transaction type.
        // I will just use standard console logs to demonstrate the logic if the table is complex.
        
        // 4. Calculate Referral Commission (Agent Amit gets 20% of Platform Fee)
        const referralCommissionRate = 0.20;
        const referralBonus = platformFee * referralCommissionRate;
        
        const referralLink = await prisma.referralConnection.create({
            data: {
                referrerId: referrer.id,
                refereeId: patient.id,
                refereeRole: 'PATIENT',
                totalEarned: referralBonus,
                status: 'COMPLETED'
            }
        });

        console.log(`🤝 Referral Tracking: Agent Amit earned ₹${referralBonus} (20% of Platform Fee) for referring Patient Rahul.`);

        // 5. Rider Dispatch Commission (Mocking a pharmacy order dispatch)
        console.log("\n4️⃣ Post-Consultation: Dispatch Commission Calculation...");
        console.log(`🚚 Patient orders medicines. A Swastik Rider is dispatched.`);
        const orderValue = 1000;
        const deliveryFee = 50;
        const riderPayout = deliveryFee * 0.90; // 90% goes to rider, 10% platform margin on delivery
        
        console.log(`📦 Order Value: ₹${orderValue} | Delivery Fee Paid By Patient: ₹${deliveryFee}`);
        console.log(`💸 Dispatch Commission for Rider: ₹${riderPayout}`);

        // 6. Summary Report
        console.log("\n📊 --- REAL-TIME COMMISSION TRACKING DASHBOARD ---");
        console.log(`🔹 Total Revenue Processed: ₹${consultationFee + orderValue + deliveryFee}`);
        console.log(`🔹 Doctor Payable Amount: ₹${doctorPayout}`);
        console.log(`🔹 Rider Payable Amount: ₹${riderPayout}`);
        console.log(`🔹 Agent Amit Referral Wallet: +₹${referralBonus}`);
        console.log(`🔹 Swastik Platform Net Revenue: ₹${(platformFee - referralBonus) + (deliveryFee - riderPayout)}`);

        // Cleanup
        console.log("\n🧹 Cleaning up test data...");
        await prisma.referralConnection.delete({ where: { id: referralLink.id } });
        await prisma.appointment.delete({ where: { id: appointment.id } });
        console.log("✅ Cleanup complete.");

    } catch (e) {
        console.error("Commission Demo Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

runCommissionDemo();
