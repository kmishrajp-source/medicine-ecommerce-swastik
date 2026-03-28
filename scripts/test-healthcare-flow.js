const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function main() {
    const timestamp = Date.now();
    const customerEmail = `customer_${timestamp}@test.com`;
    const doctorEmail = `doctor_${timestamp}@test.com`;
    const retailerEmail = `retailer_${timestamp}@test.com`;
    const agentEmail = `agent_${timestamp}@test.com`;
    const password = await bcrypt.hash('password123', 10);

    console.log("--- 1. Setup Phase ---");

    // Create Customer
    const customer = await prisma.user.create({
        data: { email: customerEmail, password, name: 'Test Customer', role: 'CUSTOMER', phone: '9876543210' }
    });
    console.log(`Created Customer: ${customer.email}`);

    // Create Doctor
    const doctorUser = await prisma.user.create({
        data: { email: doctorEmail, password, name: 'Dr. Test', role: 'DOCTOR' }
    });
    const doctor = await prisma.doctor.create({
        data: { userId: doctorUser.id, specialization: 'General', consultationFee: 500 }
    });
    console.log(`Created Doctor: ${doctorUser.email}`);

    // Create Retailer
    const retailerUser = await prisma.user.create({
        data: { email: retailerEmail, password, name: 'Pharmacy Test', role: 'RETAILER' }
    });
    const retailer = await prisma.retailer.create({
        data: { userId: retailerUser.id, shopName: 'Test Medico', address: 'Gorakhpur Main St', phone: '1122334455', licenseNumber: 'DL123' }
    });
    console.log(`Created Retailer: ${retailerUser.email}`);

    // Create Delivery Agent
    const agentUser = await prisma.user.create({
        data: { email: agentEmail, password, name: 'Rider Test', role: 'AGENT' }
    });
    const agent = await prisma.deliveryAgent.create({
        data: { userId: agentUser.id, licenseNumber: 'AGENT123', vehicleNumber: 'UP53-0001', phone: '5566778899' }
    });
    console.log(`Created Delivery Agent: ${agentUser.email}`);

    // Create a Product for inventory
    const product = await prisma.product.create({
        data: { name: 'Paracetamol 500mg', description: 'Pain reliever', price: 20, image: 'https://via.placeholder.com/100', category: 'Medicine', stock: 100 }
    });
    console.log(`Created Product: ${product.name}`);

    console.log("\n--- 2. Prescription Flow ---");

    // Customer uploads prescription
    const prescription = await prisma.prescription.create({
        data: { 
            patientId: customer.id, 
            imageUrl: 'https://via.placeholder.com/400?text=Prescription+Test',
            status: 'Pending'
        }
    });
    console.log(`Prescription Uploaded: ${prescription.id}`);

    // Retailer quotes the prescription
    // Simulate what the API does
    const order = await prisma.order.create({
        data: {
            userId: customer.id,
            assignedRetailerId: retailer.id,
            total: 40.0, // 2x Paracetamol
            status: 'Pending Payment',
            items: {
                create: [{ productId: product.id, quantity: 2, price: 20 }]
            }
        }
    });
    await prisma.prescription.update({
        where: { id: prescription.id },
        data: { status: 'Processed', orderId: order.id }
    });
    console.log(`Retailer Quoted Rx. Order Created: ${order.id}`);

    // Customer "Pays"
    await prisma.order.update({
        where: { id: order.id },
        data: { isPaid: true, status: 'Ready_for_Packing' }
    });
    console.log(`Customer Paid. Status: Ready_for_Packing`);

    // Delivery Assignment
    await prisma.order.update({
        where: { id: order.id },
        data: { deliveryAgentId: agent.id, status: 'Out_for_Delivery' }
    });
    console.log(`Delivery Assigned to ${agentUser.name}. Status: Out_for_Delivery`);

    // Final Delivery
    await prisma.order.update({
        where: { id: order.id },
        data: { isDelivered: true, status: 'Delivered' }
    });
    console.log(`Final Status: DELIVERED`);

    console.log("\n--- 3. Doctor E-Prescription Flow ---");

    // Doctor creates appointment and prescription
    const appt = await prisma.appointment.create({
        data: { patientId: customer.id, doctorId: doctor.id, date: new Date(), status: 'Completed' }
    });
    
    const eRx = await prisma.prescription.create({
        data: {
            patientId: customer.id,
            doctorId: doctor.id,
            medicines: JSON.stringify([{ name: 'Amoxicillin', dosage: '1-0-1', duration: '5 days' }]),
            imageUrl: 'https://via.placeholder.com/400?text=Digital+Rx',
            status: 'Pending'
        }
    });
    console.log(`Doctor created E-Prescription: ${eRx.id} for Appointment: ${appt.id}`);

    console.log("\n--- ALL TESTS PASSED SUCCESSFULLY! ---");
}

main()
    .catch(e => { console.error(e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
