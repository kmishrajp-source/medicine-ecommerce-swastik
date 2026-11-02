const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function testCreateQuote() {
  try {
    // Find latest enquiry
    const enq = await prisma.buyerEnquiry.findFirst({
      orderBy: { createdAt: 'desc' }
    });
    console.log('Found enquiry:', enq ? enq.id : 'NONE');
    if (!enq) return;

    const quote = await prisma.providerQuotation.create({
      data: {
        quoteNumber: `HM-QUO-TEST-${Date.now()}`,
        enquiryId: enq.id,
        providerId: 'prov-test-999',
        providerType: 'SUPPLIER',
        providerBusinessName: 'Test Medical Supplies',
        subtotalAmount: 10000,
        taxAmount: 1800,
        shippingOrServiceFee: 500,
        totalAmount: 12300,
        currency: 'INR',
        validUntil: new Date(Date.now() + 7 * 86400000),
        status: 'SENT',
        versionNumber: 1,
        isRevised: false,
        items: {
          create: [
            { itemName: 'Item A', quantity: 1, unitPrice: 10000, taxRatePercent: 18, taxAmount: 1800, totalPrice: 11800 }
          ]
        }
      },
      include: { items: true }
    });
    console.log('Success! Created quote:', quote.id);
  } catch (err) {
    console.error('Error creating quote:', err);
  } finally {
    await prisma.$disconnect();
  }
}

testCreateQuote();

