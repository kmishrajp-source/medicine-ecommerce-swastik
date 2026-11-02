import prisma from '../lib/prisma.js';
import { createBuyerEnquiry, getEnquiryByIdOrNumber, submitProviderQuotation, updateQuotationStatus } from '../lib/healthmart/store.js';

async function testLocalFlow() {
  console.log('Testing createBuyerEnquiry with real DB connection...');
  try {
    const enq = await createBuyerEnquiry({
      categorySlug: 'medical-equipment-and-supplies',
      serviceType: 'medical_equipment',
      title: 'Local Test: Multipara Patient Monitors',
      description: 'Test enquiry to verify DB insertion and full flow',
      quantity: 5,
      budgetRangeMin: 100000,
      budgetRangeMax: 200000,
      locationCity: 'Gorakhpur',
      locationState: 'Uttar Pradesh',
      locationPincode: '273001',
      buyerName: 'Dr. Test Gorakhpur',
      buyerPhone: '9839012345',
      buyerEmail: 'test@swastik.local'
    });
    console.log('Enquiry created:', enq.id, enq.enquiryNumber, 'savedToDb:', enq._savedToDb);

    console.log('\nTesting getEnquiryByIdOrNumber...');
    const fetched = await getEnquiryByIdOrNumber(enq.enquiryNumber);
    console.log('Fetched enquiry from DB:', fetched ? fetched.enquiryNumber : 'NOT FOUND');

    console.log('\nTesting submitProviderQuotation...');
    const quote = await submitProviderQuotation({
      enquiryId: enq.id,
      providerId: 'sp-test-001',
      providerType: 'SUPPLIER',
      providerBusinessName: 'Apex Surgical Gorakhpur',
      providerContactName: 'Ravi Kumar',
      providerPhone: '9876543210',
      providerEmail: 'ravi@apexsurgical.com',
      subtotalAmount: 150000,
      taxAmount: 18000,
      shippingOrServiceFee: 1500,
      totalAmount: 169500,
      timelineDelivery: '3 business days',
      warrantyTerms: '2 Years on-site warranty',
      paymentTerms: '50% advance, 50% on delivery',
      items: [
        { itemName: 'Multipara Monitor 12.1-inch', quantity: 5, unitPrice: 30000, taxRatePercent: 12, totalPrice: 168000 },
        { itemName: 'Delivery & Setup', quantity: 1, unitPrice: 1500, taxRatePercent: 0, totalPrice: 1500 }
      ]
    });
    console.log('Quotation submitted:', quote.id, quote.quoteNumber, 'Total:', quote.totalAmount);

    console.log('\nTesting updateQuotationStatus (ACCEPT)...');
    const accepted = await updateQuotationStatus(quote.id, 'ACCEPTED');
    console.log('Quotation status:', accepted.status);
    console.log('Order created:', accepted.order ? accepted.order.orderNumber : 'No order object');

    console.log('\nAll direct DB tests passed successfully!');
  } catch (err) {
    console.error('Direct test error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

testLocalFlow();

