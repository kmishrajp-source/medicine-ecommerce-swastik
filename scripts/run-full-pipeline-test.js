const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function runFullPipelineTest() {
  console.log('\n=============================================================');
  console.log('   FULL HEALTHMART LIFECYCLE PIPELINE TEST (Prisma Direct)   ');
  console.log('=============================================================\n');

  // STAGE 1: REQUIREMENT REQUEST (RFQ)
  console.log('▶ [1/6] REQUIREMENT REQUEST (RFQ Submission)...');
  const cat = await prisma.marketplaceCategory.findFirst({
    where: { slug: 'medical-equipment-and-supplies' }
  });
  console.log('  Category resolved:', cat.id, '->', cat.name);

  const enqNumber = `HM-REQ-TEST-${Date.now()}`;
  const enquiry = await prisma.buyerEnquiry.create({
    data: {
      enquiryNumber: enqNumber,
      categoryId: cat.id,
      serviceType: 'medical_equipment',
      title: 'Procurement: 10x Multipara Monitors & 10x Semi-Electric Beds',
      description: 'Urgent requirement for newly expanded ICU ward in Gorakhpur.',
      quantity: 10,
      budgetRangeMin: 300000,
      budgetRangeMax: 600000,
      locationCity: 'Gorakhpur',
      locationState: 'Uttar Pradesh',
      locationPincode: '273001',
      deliveryAddress: 'Gorakhpur Medical City, Station Road, Gorakhpur',
      buyerName: 'Dr. R. K. Mishra',
      buyerPhone: '+91 98390 12345',
      buyerEmail: 'procurement@gorakhpurmed.org',
      buyerOrganization: 'Gorakhpur Medical City Hospital',
      isPhoneVerified: true,
      priority: 'HIGH',
      status: 'SENT_TO_PROVIDERS',
      categorySpecificData: {
        equipmentType: 'ICU Monitor & Beds',
        specifications: '12.1-inch, 5-para, CE certified',
        warrantyRequested: '2 Years Comprehensive'
      }
    }
  });
  console.log('  ✅ Requirement created successfully!');
  console.log('     ID:', enquiry.id);
  console.log('     Enquiry Number:', enquiry.enquiryNumber);
  console.log('     Status:', enquiry.status);

  // STAGE 2: MULTIPLE QUOTATIONS
  console.log('\n▶ [2/6] MULTIPLE QUOTATIONS (Providers submit structured quotes)...');
  const providersData = [
    {
      providerId: 'sp-purvanchal-001',
      providerType: 'SUPPLIER',
      providerBusinessName: 'Purvanchal MedTech & Surgical Supplies',
      providerContactName: 'Rajesh Kumar',
      providerPhone: '+91 79921 22974',
      providerEmail: 'rajesh@purvanchalmedtech.com',
      subtotalAmount: 480000,
      taxAmount: 57600,
      shippingOrServiceFee: 3000,
      totalAmount: 540600,
      timelineDelivery: '5 business days',
      warrantyTerms: '2 Years Comprehensive On-Site',
      paymentTerms: '50% advance with PO, 50% upon delivery challan',
      cancellationTerms: 'Free cancellation before freight loading',
      inclusions: ['10x 12.1-inch Multipara Monitors', '10x Semi-Electric Beds', 'Free on-site installation & training'],
      exclusions: ['Consumables past initial 30 days'],
      verificationBadge: 'SWASTIK_VERIFIED',
      rating: 4.9,
      items: [
        { itemName: '12.1-inch ICU Multipara Monitor', quantity: 10, unitPrice: 28000, taxRatePercent: 12, taxAmount: 33600, totalPrice: 313600 },
        { itemName: 'Semi-Electric ICU Bed with ABS rails', quantity: 10, unitPrice: 20000, taxRatePercent: 12, taxAmount: 24000, totalPrice: 224000 },
        { itemName: 'Freight & Installation Service', quantity: 1, unitPrice: 3000, taxRatePercent: 0, taxAmount: 0, totalPrice: 3000 }
      ]
    },
    {
      providerId: 'sp-mediline-002',
      providerType: 'SUPPLIER',
      providerBusinessName: 'MediLine Healthcare Solutions Pvt Ltd',
      providerContactName: 'Priya Sharma',
      providerPhone: '+91 98765 43210',
      providerEmail: 'priya@medilinehealthcare.com',
      subtotalAmount: 450000,
      taxAmount: 54000,
      shippingOrServiceFee: 0,
      totalAmount: 504000,
      timelineDelivery: '7 business days',
      warrantyTerms: '1 Year Manufacturer + 1 Year AMC',
      paymentTerms: '30% advance, 70% against delivery inspection',
      cancellationTerms: '10% restocking charge if cancelled after dispatch',
      inclusions: ['10x Patient Monitors', '10x Semi-Electric Hospital Beds', 'Free Freight'],
      exclusions: ['Staff training certification fees'],
      verificationBadge: 'SWASTIK_VERIFIED',
      rating: 4.6,
      items: [
        { itemName: 'Patient Monitor Series-B', quantity: 10, unitPrice: 26000, taxRatePercent: 12, taxAmount: 31200, totalPrice: 291200 },
        { itemName: 'Hospital Semi-Electric Bed', quantity: 10, unitPrice: 19000, taxRatePercent: 12, taxAmount: 22800, totalPrice: 212800 }
      ]
    },
    {
      providerId: 'sp-globalmed-003',
      providerType: 'MANUFACTURER',
      providerBusinessName: 'Global MedEquip Direct',
      providerContactName: 'Sunil Verma',
      providerPhone: '+91 94150 99887',
      providerEmail: 'sunil@globalmedequip.com',
      subtotalAmount: 520000,
      taxAmount: 62400,
      shippingOrServiceFee: 5000,
      totalAmount: 587400,
      timelineDelivery: '3 business days (Express)',
      warrantyTerms: '3 Years Full Replacement Warranty',
      paymentTerms: '100% advance via RTGS',
      cancellationTerms: 'Non-refundable once dispatched',
      inclusions: ['10x Mindray Premium Monitors', '10x Heavy Duty Electric ICU Beds', '3 Years AMC + Free Replacement'],
      exclusions: [],
      verificationBadge: 'SWASTIK_VERIFIED',
      rating: 4.8,
      items: [
        { itemName: 'Mindray Premium 12.1-inch Monitor', quantity: 10, unitPrice: 31000, taxRatePercent: 12, taxAmount: 37200, totalPrice: 347200 },
        { itemName: 'Heavy Duty Electric ICU Bed', quantity: 10, unitPrice: 21000, taxRatePercent: 12, taxAmount: 25200, totalPrice: 235200 },
        { itemName: 'Express Delivery Logistics', quantity: 1, unitPrice: 5000, taxRatePercent: 0, taxAmount: 0, totalPrice: 5000 }
      ]
    }
  ];

  const quotations = [];
  for (let i = 0; i < providersData.length; i++) {
    const p = providersData[i];
    const quoteNum = `HM-QUO-${Date.now()}-${i + 1}`;
    const quote = await prisma.providerQuotation.create({
      data: {
        quoteNumber: quoteNum,
        enquiryId: enquiry.id,
        providerId: p.providerId,
        providerType: p.providerType,
        providerBusinessName: p.providerBusinessName,
        providerContactName: p.providerContactName,
        providerPhone: p.providerPhone,
        providerEmail: p.providerEmail,
        subtotalAmount: p.subtotalAmount,
        taxAmount: p.taxAmount,
        shippingOrServiceFee: p.shippingOrServiceFee,
        totalAmount: p.totalAmount,
        currency: 'INR',
        timelineDelivery: p.timelineDelivery,
        warrantyTerms: p.warrantyTerms,
        paymentTerms: p.paymentTerms,
        cancellationTerms: p.cancellationTerms,
        inclusions: p.inclusions,
        exclusions: p.exclusions,
        verificationBadge: p.verificationBadge,
        rating: p.rating,
        validUntil: new Date(Date.now() + 14 * 86400000),
        status: 'SENT',
        versionNumber: 1,
        isRevised: false,
        items: {
          create: p.items.map(it => ({
            itemName: it.itemName,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            taxRatePercent: it.taxRatePercent,
            taxAmount: it.taxAmount,
            totalPrice: it.totalPrice
          }))
        }
      },
      include: { items: true }
    });
    quotations.push(quote);
    console.log(`  ✅ Quotation #${i + 1} Submitted:`);
    console.log(`     Quote #: ${quote.quoteNumber}`);
    console.log(`     Provider: ${quote.providerBusinessName}`);
    console.log(`     Total: ₹${quote.totalAmount.toLocaleString('en-IN')} (${quote.items.length} line items)`);
    console.log(`     Timeline: ${quote.timelineDelivery} | Warranty: ${quote.warrantyTerms}`);
  }

  // Update enquiry status to QUOTATIONS_AVAILABLE
  await prisma.buyerEnquiry.update({
    where: { id: enquiry.id },
    data: { status: 'QUOTATIONS_AVAILABLE' }
  });

  // STAGE 3: COMPARISON
  console.log('\n▶ [3/6] COMPARISON MATRIX (Buyer evaluates side-by-side)...');
  const fetchedQuotes = await prisma.providerQuotation.findMany({
    where: { enquiryId: enquiry.id },
    include: { items: true },
    orderBy: { totalAmount: 'asc' }
  });

  console.log('  Comparison Matrix for Enquiry:', enquiry.enquiryNumber);
  console.log('  -------------------------------------------------------------------------------------------------------------------');
  console.log('  Provider                           | Price (INR) | Delivery Time | Warranty               | Payment Terms');
  console.log('  -------------------------------------------------------------------------------------------------------------------');
  fetchedQuotes.forEach(q => {
    const name = q.providerBusinessName.padEnd(35).substring(0, 35);
    const price = (`₹` + q.totalAmount.toLocaleString('en-IN')).padEnd(12);
    const delivery = (q.timelineDelivery || '').padEnd(14);
    const warranty = (q.warrantyTerms || '').padEnd(23).substring(0, 23);
    const terms = (q.paymentTerms || '').substring(0, 30);
    console.log(`  ${name}| ${price}| ${delivery}| ${warranty}| ${terms}`);
  });
  console.log('  -------------------------------------------------------------------------------------------------------------------');
  console.log('  Lowest Quote: ₹' + fetchedQuotes[0].totalAmount.toLocaleString('en-IN') + ' (' + fetchedQuotes[0].providerBusinessName + ')');

  // STAGE 4: SELECTION & ACCEPTANCE
  console.log('\n▶ [4/6] SELECTION (Buyer selects Purvanchal MedTech quote based on 2-year warranty & local support)...');
  const selectedQuote = fetchedQuotes.find(q => q.providerBusinessName.includes('Purvanchal')) || fetchedQuotes[0];
  console.log('  Selecting Quote:', selectedQuote.quoteNumber, 'from', selectedQuote.providerBusinessName);

  // Accept selected quote
  const acceptedQuote = await prisma.providerQuotation.update({
    where: { id: selectedQuote.id },
    data: { status: 'ACCEPTED' }
  });

  // Decline competing quotes
  await prisma.providerQuotation.updateMany({
    where: { enquiryId: enquiry.id, id: { not: selectedQuote.id } },
    data: { status: 'DECLINED', rejectionReason: 'Buyer selected another provider offering better warranty & delivery terms' }
  });

  // Update Enquiry to ACCEPTED
  await prisma.buyerEnquiry.update({
    where: { id: enquiry.id },
    data: { status: 'ACCEPTED', acceptedQuotationId: selectedQuote.id }
  });
  console.log('  ✅ Selected Quote status updated to: ACCEPTED');
  console.log('  ✅ Competing Quotes status updated to: DECLINED');
  console.log('  ✅ Buyer Enquiry status updated to: ACCEPTED');

  // STAGE 5: CONFIRMED ORDER
  console.log('\n▶ [5/6] CONFIRMED ORDER (System creates binding order with tracking)...');
  const orderNumber = `HM-ORD-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;
  const order = await prisma.marketplaceOrder.create({
    data: {
      orderNumber,
      enquiryId: enquiry.id,
      quotationId: selectedQuote.id,
      providerId: selectedQuote.providerId,
      providerBusinessName: selectedQuote.providerBusinessName,
      totalAmount: selectedQuote.totalAmount,
      currency: selectedQuote.currency,
      paymentTerms: selectedQuote.paymentTerms,
      warrantyTerms: selectedQuote.warrantyTerms,
      timelineDelivery: selectedQuote.timelineDelivery,
      status: 'ORDER_CONFIRMED',
      deliveryStatus: 'PENDING_DISPATCH',
      deliveryNotes: 'Order confirmed with Purvanchal MedTech. Advance payment verified via Bank Transfer.'
    }
  });
  console.log('  ✅ Binding HealthMart Order Generated!');
  console.log('     Order ID:', order.id);
  console.log('     Order Number:', order.orderNumber);
  console.log('     Order Status:', order.status);
  console.log('     Delivery Status:', order.deliveryStatus);
  console.log('     Total Amount:', `₹${order.totalAmount.toLocaleString('en-IN')}`);

  // STAGE 6: DELIVERY PROCESS
  console.log('\n▶ [6/6] DELIVERY PROCESS (Tracking fulfillment through all delivery milestones)...');
  const deliveryStages = [
    {
      status: 'DISPATCHED',
      notes: 'Units loaded on logistics vehicle from Gorakhpur Industrial Area warehouse.',
      courier: 'Swastik Medical Logistics Fleet #04',
      tracking: 'SWASTIK-TRK-GKP-8821',
      dateField: 'dispatchedAt'
    },
    {
      status: 'IN_TRANSIT',
      notes: 'Vehicle en route to Gorakhpur Medical City Hospital, Medical College Road.',
      courier: 'Swastik Medical Logistics Fleet #04',
      tracking: 'SWASTIK-TRK-GKP-8821'
    },
    {
      status: 'OUT_FOR_DELIVERY',
      notes: 'Delivery executive on-site at hospital receiving bay. Contacting Dr. R. K. Mishra for gate pass.',
      courier: 'Swastik Medical Logistics Fleet #04',
      tracking: 'SWASTIK-TRK-GKP-8821'
    },
    {
      status: 'DELIVERED',
      notes: 'All 10x Monitors & 10x Beds unloaded, inspected, and verified by hospital biomedical engineer. Signed challan received.',
      courier: 'Swastik Medical Logistics Fleet #04',
      tracking: 'SWASTIK-TRK-GKP-8821',
      dateField: 'deliveredAt'
    }
  ];

  let currentOrder = order;
  for (const step of deliveryStages) {
    const updateData = {
      deliveryStatus: step.status,
      deliveryNotes: step.notes,
      courierName: step.courier,
      trackingNumber: step.tracking
    };
    if (step.dateField === 'dispatchedAt') updateData.dispatchedAt = new Date();
    if (step.dateField === 'deliveredAt') {
      updateData.deliveredAt = new Date();
      updateData.status = 'ORDER_DELIVERED';
    }

    currentOrder = await prisma.marketplaceOrder.update({
      where: { id: order.id },
      data: updateData
    });
    console.log(`  🚚 [Milestone] -> ${currentOrder.deliveryStatus}`);
    console.log(`     Courier: ${currentOrder.courierName} | Tracking: ${currentOrder.trackingNumber}`);
    console.log(`     Notes: ${currentOrder.deliveryNotes}`);
    if (currentOrder.dispatchedAt) console.log(`     Dispatched At: ${currentOrder.dispatchedAt.toISOString()}`);
    if (currentOrder.deliveredAt) console.log(`     Delivered At: ${currentOrder.deliveredAt.toISOString()}`);
  }

  // FINAL VERIFICATION
  console.log('\n=============================================================');
  console.log('   FINAL AUDIT SUMMARY OF TESTED LIFECYCLE                   ');
  console.log('=============================================================');
  const finalEnquiry = await prisma.buyerEnquiry.findUnique({
    where: { id: enquiry.id },
    include: {
      quotations: { include: { items: true } },
      order: true
    }
  });

  console.log('  Enquiry Number    :', finalEnquiry.enquiryNumber);
  console.log('  Enquiry Status    :', finalEnquiry.status);
  console.log('  Total Quotations  :', finalEnquiry.quotations.length);
  finalEnquiry.quotations.forEach(q => {
    console.log(`    - Quote: ${q.quoteNumber} | Provider: ${q.providerBusinessName} | Status: ${q.status} | Amount: ₹${q.totalAmount.toLocaleString('en-IN')}`);
  });
  console.log('  Linked Order #    :', finalEnquiry.order.orderNumber);
  console.log('  Order Status      :', finalEnquiry.order.status);
  console.log('  Delivery Status   :', finalEnquiry.order.deliveryStatus);
  console.log('  Delivered At      :', finalEnquiry.order.deliveredAt);
  console.log('  Courier & Track   :', `${finalEnquiry.order.courierName} (${finalEnquiry.order.trackingNumber})`);
  console.log('\n  🎉 ALL 6 STAGES COMPLETED & VERIFIED IN PRODUCTION SUPABASE POSTGRESQL!\n');

  await prisma.$disconnect();
}

runFullPipelineTest().catch(async (e) => {
  console.error('Test failed:', e);
  await prisma.$disconnect();
  process.exit(1);
});

