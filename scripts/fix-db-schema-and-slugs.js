const { Client } = require('pg');
require('dotenv').config();

async function fixSchemaAndCheckCategories() {
  const client = new Client({
    connectionString: process.env.DIRECT_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to DB');

    // 1. Add isGenericStore to Retailer
    console.log('Adding isGenericStore to Retailer if missing...');
    await client.query(`ALTER TABLE "Retailer" ADD COLUMN IF NOT EXISTS "isGenericStore" BOOLEAN DEFAULT FALSE;`);
    console.log('Retailer schema fixed successfully!');

    // 2. Check MarketplaceCategory slugs
    const res = await client.query(`SELECT id, slug, name FROM "MarketplaceCategory" ORDER BY slug;`);
    console.log('Existing MarketplaceCategory rows:', res.rows);

    // Let's ensure both standard slugs exist
    // Check if 'pharmacy-and-medicines' exists
    const hasPharmacyAndMedicines = res.rows.some(r => r.slug === 'pharmacy-and-medicines');
    const hasPharmaciesAndMedicineServices = res.rows.some(r => r.slug === 'pharmacies-and-medicine-services');

    if (!hasPharmacyAndMedicines && hasPharmaciesAndMedicineServices) {
      console.log('Creating alias category for pharmacy-and-medicines...');
      await client.query(`
        INSERT INTO "MarketplaceCategory" (
          "id", "slug", "name", "description", "serviceType", "icon", "permittedWorkflow",
          "supportsQuotationComparison", "supportsDirectBooking", "supportsOnlinePayment",
          "requiresManualConfirmation", "isActive", "sortOrder"
        ) VALUES (
          'cat-pharmacy-alias', 'pharmacy-and-medicines', 'Pharmacies and Permitted Medicine Services',
          'Retail pharmacies, prescription dispensers, chronic medicine suppliers and emergency medicine stores',
          'MEDICINE_SUPPLY', 'fa-solid fa-pills', 'RFQ_AND_QUOTE', TRUE, FALSE, FALSE, TRUE, TRUE, 1
        ) ON CONFLICT ("slug") DO NOTHING;
      `);
      console.log('Alias category pharmacy-and-medicines created');
    }

    const hasApprovedHealthcare = res.rows.some(r => r.slug === 'approved-healthcare-business-services');
    const hasOtherHealthcare = res.rows.some(r => r.slug === 'other-healthcare-services');

    if (!hasApprovedHealthcare && hasOtherHealthcare) {
      console.log('Creating alias category for approved-healthcare-business-services...');
      await client.query(`
        INSERT INTO "MarketplaceCategory" (
          "id", "slug", "name", "description", "serviceType", "icon", "permittedWorkflow",
          "supportsQuotationComparison", "supportsDirectBooking", "supportsOnlinePayment",
          "requiresManualConfirmation", "isActive", "sortOrder"
        ) VALUES (
          'cat-other-alias', 'approved-healthcare-business-services', 'Other Approved Healthcare Business Services',
          'Specialist medical services, healthcare consultancy, and auxiliary healthcare operations',
          'OTHER_SERVICES', 'fa-solid fa-notes-medical', 'DIRECT_INQUIRY', FALSE, FALSE, FALSE, TRUE, TRUE, 13
        ) ON CONFLICT ("slug") DO NOTHING;
      `);
      console.log('Alias category approved-healthcare-business-services created');
    }

  } catch (err) {
    console.error('Error fixing schema/slugs:', err);
  } finally {
    await client.end();
  }
}

fixSchemaAndCheckCategories();

