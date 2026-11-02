const { Client } = require('pg');
require('dotenv').config();

const sql = `
-- 1. Add missing columns to BuyerEnquiry
ALTER TABLE "BuyerEnquiry" 
  ADD COLUMN IF NOT EXISTS "acceptedQuotationId" TEXT;

-- 2. Add missing columns to ProviderQuotation
ALTER TABLE "ProviderQuotation" 
  ADD COLUMN IF NOT EXISTS "verificationBadge" TEXT DEFAULT 'SWASTIK_VERIFIED',
  ADD COLUMN IF NOT EXISTS "rating" DOUBLE PRECISION DEFAULT 4.7;

-- 3. Create MarketplaceOrder table
CREATE TABLE IF NOT EXISTS "MarketplaceOrder" (
  "id" TEXT PRIMARY KEY,
  "orderNumber" TEXT UNIQUE NOT NULL,
  "enquiryId" TEXT UNIQUE NOT NULL REFERENCES "BuyerEnquiry"("id") ON DELETE CASCADE,
  "quotationId" TEXT UNIQUE NOT NULL REFERENCES "ProviderQuotation"("id") ON DELETE CASCADE,
  "buyerUserId" TEXT REFERENCES "User"("id") ON DELETE SET NULL,
  "providerId" TEXT NOT NULL,
  "providerBusinessName" TEXT NOT NULL,
  "totalAmount" DOUBLE PRECISION NOT NULL,
  "currency" TEXT DEFAULT 'INR',
  "paymentTerms" TEXT,
  "warrantyTerms" TEXT,
  "timelineDelivery" TEXT,
  "status" TEXT DEFAULT 'ORDER_CONFIRMED',
  "deliveryStatus" TEXT DEFAULT 'PENDING_DISPATCH',
  "trackingNumber" TEXT,
  "courierName" TEXT,
  "deliveryNotes" TEXT,
  "dispatchedAt" TIMESTAMP(3),
  "deliveredAt" TIMESTAMP(3),
  "cancelledAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "MarketplaceOrder_enquiryId_idx" ON "MarketplaceOrder"("enquiryId");
CREATE INDEX IF NOT EXISTS "MarketplaceOrder_providerId_idx" ON "MarketplaceOrder"("providerId");
`;

async function run() {
  const client = new Client({
    connectionString: process.env.DIRECT_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  console.log('Connected to Supabase! Creating MarketplaceOrder table and updating columns...');
  await client.query(sql);
  console.log('MarketplaceOrder table and columns created successfully!');
  await client.end();
}

run().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});

