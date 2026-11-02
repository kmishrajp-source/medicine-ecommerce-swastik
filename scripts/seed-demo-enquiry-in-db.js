const { Client } = require('pg');
require('dotenv').config();

async function seedDemoEnquiry() {
  const client = new Client({
    connectionString: process.env.DIRECT_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to DB');

    // Get medical-equipment category ID
    const catRes = await client.query(`SELECT id FROM "MarketplaceCategory" WHERE slug = 'medical-equipment-and-supplies' LIMIT 1;`);
    const categoryId = catRes.rows[0]?.id || 'cat-medical-equipment-and-supplies';

    // 1. Insert or update enq-demo-001
    await client.query(`
      INSERT INTO "BuyerEnquiry" (
        "id", "enquiryNumber", "categoryId", "serviceType", "title", "description",
        "quantity", "budgetRangeMin", "budgetRangeMax", "targetDeliveryDate",
        "locationCity", "locationState", "locationPincode", "deliveryAddress",
        "categorySpecificData", "buyerName", "buyerPhone", "buyerEmail",
        "buyerOrganization", "isPhoneVerified", "privacyMode", "priority",
        "status", "source", "createdAt", "updatedAt"
      ) VALUES (
        'enq-demo-001', 'HM-REQ-202611-1001', $1, 'medical_equipment',
        'ICU Multi-Para Patient Monitors & Motorized Beds Procurement',
        'Procurement of 5 units 12.1-inch Multi-para Patient Monitors (ECG, SpO2, NIBP) and 5 units 5-Function Electric ICU Beds.',
        5, 250000, 450000, '2026-11-20 00:00:00',
        'Gorakhpur', 'Uttar Pradesh', '273001', 'Apex Healthcare Center, Medical College Road, Gorakhpur',
        '{"equipmentCategory": "ICU & Critical Care Equipment", "specifications": "FDA / CE approved, 12.1-inch color display, battery backup > 4 hrs", "warrantyRequirement": "2 to 3 Years Comprehensive Warranty", "installationRequired": "Yes", "budgetRange": "₹1,00,000 to ₹5,00,000"}',
        'Dr. Arvind Srivastava', '+91 98390 12345', 'procurement@apexmedcenter.com',
        'Apex Multi-Specialty Clinic', true, 'PROTECTED', 'HIGH',
        'QUOTATIONS_AVAILABLE', 'demo_seed', NOW(), NOW()
      ) ON CONFLICT ("id") DO UPDATE SET
        "status" = 'QUOTATIONS_AVAILABLE',
        "title" = EXCLUDED.title,
        "description" = EXCLUDED.description;
    `, [categoryId]);
    console.log('Enquiry enq-demo-001 inserted/updated!');

    // 2. Insert Quotations
    const quotes = [
      {
        id: "quo-demo-001",
        quoteNumber: "HM-QUO-202611-0101",
        providerId: "sp-eq-001",
        providerType: "SUPPLIER",
        providerBusinessName: "Purvanchal MedTech & Surgical Supplies",
        providerContactName: "Rajesh Kumar",
        providerPhone: "+91 79921 22974",
        providerEmail: "procure@purvanchalmedtech.com",
        subtotalAmount: 320000,
        taxAmount: 38400,
        shippingOrServiceFee: 2500,
        totalAmount: 360900,
        timelineDelivery: "7 business days after PO",
        warrantyTerms: "2 Years on-site warranty",
        paymentTerms: "50% advance, 50% on delivery",
        cancellationTerms: "10% restocking fee after dispatch",
        inclusions: ["5x ICU Multipara Monitors (CE Certified)", "5x Semi-Electric ICU Beds", "Cables & accessories"],
        exclusions: ["Extended battery modules", "Replacement sensors after Year 1"],
        notes: "Competitive pricing for Gorakhpur clinics.",
        rating: 4.9,
        items: [
          { itemName: "ICU Patient Monitor (Standard)", quantity: 5, unitPrice: 35000, taxRatePercent: 12, totalPrice: 196000 },
          { itemName: "Semi-Electric ICU Bed", quantity: 5, unitPrice: 29000, taxRatePercent: 12, totalPrice: 162400 },
          { itemName: "Transport & Unloading", quantity: 1, unitPrice: 2500, taxRatePercent: 0, totalPrice: 2500 },
        ]
      },
      {
        id: "quo-demo-002",
        quoteNumber: "HM-QUO-202611-0102",
        providerId: "sp-eq-002",
        providerType: "SUPPLIER",
        providerBusinessName: "MediLine Healthcare Solutions Pvt Ltd",
        providerContactName: "Priya Sharma",
        providerPhone: "+91 98765 43210",
        providerEmail: "sales@medilinehealthcare.com",
        subtotalAmount: 298000,
        taxAmount: 35760,
        shippingOrServiceFee: 3500,
        totalAmount: 337260,
        timelineDelivery: "10 business days after PO",
        warrantyTerms: "1 Year comprehensive + 1 Year AMC",
        paymentTerms: "30% advance, 70% against delivery",
        cancellationTerms: "Full refund if cancelled before dispatch",
        inclusions: ["5x Patient Monitors with SpO2, ECG", "5x Motorized ICU Beds", "Free installation & demo", "Staff training included"],
        exclusions: ["Consumables", "Spare parts after warranty"],
        notes: "GST invoice provided. ISO 9001 certified supplier.",
        rating: 4.6,
        items: [
          { itemName: "Patient Monitor (Advanced Series)", quantity: 5, unitPrice: 32000, taxRatePercent: 12, totalPrice: 179200 },
          { itemName: "Motorized 5-Function ICU Bed", quantity: 5, unitPrice: 30000, taxRatePercent: 12, totalPrice: 168000 },
          { itemName: "Installation & Training", quantity: 1, unitPrice: 0, taxRatePercent: 0, totalPrice: 0 },
          { itemName: "Freight & Insurance", quantity: 1, unitPrice: 3500, taxRatePercent: 0, totalPrice: 3500 },
        ]
      },
      {
        id: "quo-demo-003",
        quoteNumber: "HM-QUO-202611-0103",
        providerId: "sp-eq-003",
        providerType: "SUPPLIER",
        providerBusinessName: "Swastik Medical Equipment Hub",
        providerContactName: "Ankit Agarwal",
        providerPhone: "+91 70001 88888",
        providerEmail: "ankit@swastikmedhub.com",
        subtotalAmount: 355000,
        taxAmount: 42600,
        shippingOrServiceFee: 0,
        totalAmount: 397600,
        timelineDelivery: "5 business days after PO confirmation",
        warrantyTerms: "3 Years Comprehensive On-Site Warranty",
        paymentTerms: "100% advance via NEFT/RTGS",
        cancellationTerms: "Non-refundable after order placed",
        inclusions: ["5x Premium ICU Monitors (Mindray brand)", "5x Full-Electric ICU Beds (imported)", "3-Year on-site AMC included", "Free delivery & installation"],
        exclusions: [],
        notes: "Premium imported equipment. Best-in-class 3-year warranty.",
        rating: 4.8,
        items: [
          { itemName: "Mindray Premium ICU Monitor", quantity: 5, unitPrice: 42000, taxRatePercent: 12, totalPrice: 235200 },
          { itemName: "Full-Electric ICU Bed (Imported)", quantity: 5, unitPrice: 35000, taxRatePercent: 12, totalPrice: 196000 },
          { itemName: "Free Delivery & Installation", quantity: 1, unitPrice: 0, taxRatePercent: 0, totalPrice: 0 },
        ]
      }
    ];

    for (const q of quotes) {
      await client.query(`
        INSERT INTO "ProviderQuotation" (
          "id", "quoteNumber", "enquiryId", "providerId", "providerType",
          "providerBusinessName", "providerContactName", "providerPhone", "providerEmail",
          "subtotalAmount", "taxAmount", "shippingOrServiceFee", "totalAmount",
          "currency", "timelineDelivery", "warrantyTerms", "paymentTerms",
          "cancellationTerms", "inclusions", "exclusions", "notes",
          "status", "versionNumber", "isRevised", "verificationBadge", "rating",
          "validUntil", "createdAt", "updatedAt"
        ) VALUES (
          $1, $2, 'enq-demo-001', $3, $4,
          $5, $6, $7, $8,
          $9, $10, $11, $12,
          'INR', $13, $14, $15,
          $16, $17, $18, $19,
          'SENT', 1, false, 'SWASTIK_VERIFIED', $20,
          NOW() + INTERVAL '14 days', NOW(), NOW()
        ) ON CONFLICT ("id") DO UPDATE SET
          "totalAmount" = EXCLUDED."totalAmount",
          "subtotalAmount" = EXCLUDED."subtotalAmount",
          "status" = EXCLUDED."status";
      `, [
        q.id, q.quoteNumber, q.providerId, q.providerType,
        q.providerBusinessName, q.providerContactName, q.providerPhone, q.providerEmail,
        q.subtotalAmount, q.taxAmount, q.shippingOrServiceFee, q.totalAmount,
        q.timelineDelivery, q.warrantyTerms, q.paymentTerms,
        q.cancellationTerms, q.inclusions, q.exclusions, q.notes,
        q.rating
      ]);

      // Delete existing items to avoid duplicates
      await client.query(`DELETE FROM "QuotationItem" WHERE "quotationId" = $1;`, [q.id]);

      for (const item of q.items) {
        await client.query(`
          INSERT INTO "QuotationItem" (
            "id", "quotationId", "itemName", "quantity", "unitPrice", "taxRatePercent", "totalPrice"
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7
          );
        `, [
          `item-${q.id}-${Math.random().toString(36).substring(2, 8)}`,
          q.id, item.itemName, item.quantity, item.unitPrice, item.taxRatePercent, item.totalPrice
        ]);
      }
    }

    console.log('3 Demo quotations and items seeded successfully into PostgreSQL!');

  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    await client.end();
  }
}

seedDemoEnquiry();

