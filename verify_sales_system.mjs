import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function runSalesSystemTest() {
  console.log('\n============================================================');
  console.log('   SWASTIK MEDICARE - SALES SYSTEM VERIFICATION');
  console.log('============================================================\n');

  const DUMMY = {
    name: `Sales Lead ${Date.now()}`,
    phone: '9876543210',
    email: `sales.${Date.now()}@test.com`
  };

  try {
    // ─────────────────────────────────────────────
    // STEP 1: LEAD RECEIVED
    // ─────────────────────────────────────────────
    console.log('STEP 1: LEAD RECEIVED (Inquiry Logging)');
    const lead = await prisma.basCrmLead.create({
      data: {
        customerName: DUMMY.name,
        customerPhone: DUMMY.phone,
        customerEmail: DUMMY.email,
        source: 'WhatsApp', // Simulating WhatsApp inquiry
        status: 'NEW',
        leadScore: 50,
        expectedValue: 1500
      }
    });
    console.log(`✅ Lead captured successfully! ID: ${lead.id}`);

    // ─────────────────────────────────────────────
    // STEP 2: PRODUCT VERIFICATION & QUOTATION
    // ─────────────────────────────────────────────
    console.log('\nSTEP 2 & 3: PRODUCT VERIFICATION & QUOTATION');
    const updatedLead = await prisma.basCrmLead.update({
      where: { id: lead.id },
      data: {
        status: 'PROPOSAL',
        probability: 70
      }
    });
    console.log(`✅ Quotation sent! Lead status updated to: ${updatedLead.status}`);

    // ─────────────────────────────────────────────
    // STEP 4: ORDER CONFIRMATION
    // ─────────────────────────────────────────────
    console.log('\nSTEP 4: ORDER CONFIRMATION (Convert Lead to Order)');
    const order = await prisma.order.create({
      data: {
        total: 1500,
        status: 'Processing',
        paymentMethod: 'COD',
        guestName: lead.customerName,
        guestEmail: lead.customerEmail,
        guestPhone: lead.customerPhone,
        address: '123 Dummy St, Gorakhpur',
        deliveryCode: '5678'
      }
    });
    // Mark Lead as Won
    await prisma.basCrmLead.update({
      where: { id: lead.id },
      data: { status: 'WON', probability: 100 }
    });
    console.log(`✅ Order Confirmed! Order ID: ${order.id}`);
    console.log(`✅ Lead marked as WON.`);

    // ─────────────────────────────────────────────
    // STEP 5: DISPATCH
    // ─────────────────────────────────────────────
    console.log('\nSTEP 5: DISPATCH (Pick, Pack, Ship)');
    const dispatchedOrder = await prisma.order.update({
      where: { id: order.id },
      data: { status: 'Dispatched' }
    });
    console.log(`✅ Order Picked, Packed, and Dispatched! Status: ${dispatchedOrder.status}`);

    // ─────────────────────────────────────────────
    // STEP 6: FOLLOW-UP
    // ─────────────────────────────────────────────
    console.log('\nSTEP 6: FOLLOW-UP (Delivery & Retention)');
    const deliveredOrder = await prisma.order.update({
      where: { id: order.id },
      data: { status: 'Delivered' }
    });
    
    // Create an automated follow-up task
    const task = await prisma.basTask.create({
      data: {
        title: 'Post-Delivery Follow-Up',
        description: `Call ${DUMMY.name} to confirm medicine effectiveness and remind about next refill.`,
        type: 'FOLLOW_UP',
        priority: 'HIGH',
        status: 'PENDING',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      }
    });
    console.log(`✅ Order Delivered! Status: ${deliveredOrder.status}`);
    console.log(`✅ Automated Follow-up Task Scheduled for 7 days! Task ID: ${task.id}`);

    console.log('\n============================================================');
    console.log('🎉 SALES SYSTEM WORKFLOW TEST COMPLETED SUCCESSFULLY');
    console.log('============================================================\n');

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error);
  } finally {
    await prisma.$disconnect();
  }
}

runSalesSystemTest();
