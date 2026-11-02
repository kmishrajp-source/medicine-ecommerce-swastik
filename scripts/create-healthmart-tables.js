const { Client } = require('pg');
require('dotenv').config();

const ddl = `
-- 1. MarketplaceCategory
CREATE TABLE IF NOT EXISTS "MarketplaceCategory" (
  "id" TEXT PRIMARY KEY,
  "slug" TEXT UNIQUE NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "serviceType" TEXT NOT NULL,
  "icon" TEXT DEFAULT 'fa-solid fa-stethoscope',
  "bannerImage" TEXT,
  "requiredCredentials" JSONB,
  "permittedWorkflow" TEXT DEFAULT 'RFQ_AND_QUOTE',
  "supportsQuotationComparison" BOOLEAN DEFAULT TRUE,
  "supportsDirectBooking" BOOLEAN DEFAULT FALSE,
  "supportsOnlinePayment" BOOLEAN DEFAULT FALSE,
  "requiresManualConfirmation" BOOLEAN DEFAULT TRUE,
  "applicableLocationRules" JSONB,
  "categoryFields" JSONB,
  "isActive" BOOLEAN DEFAULT TRUE,
  "sortOrder" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- 2. ProviderServiceListing
CREATE TABLE IF NOT EXISTS "ProviderServiceListing" (
  "id" TEXT PRIMARY KEY,
  "categoryId" TEXT NOT NULL REFERENCES "MarketplaceCategory"("id") ON DELETE CASCADE,
  "userId" TEXT REFERENCES "User"("id") ON DELETE SET NULL,
  "providerType" TEXT NOT NULL,
  "providerId" TEXT,
  "businessName" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "serviceLocations" TEXT[] DEFAULT ARRAY['Gorakhpur', 'Uttar Pradesh', 'Pan India']::TEXT[],
  "operatingHours" TEXT DEFAULT '9:00 AM - 6:00 PM',
  "serviceAreas" TEXT[] DEFAULT ARRAY['Gorakhpur']::TEXT[],
  "basePrice" DOUBLE PRECISION,
  "priceUnit" TEXT,
  "pricingDetails" TEXT,
  "availableOptions" JSONB,
  "isVerified" BOOLEAN DEFAULT FALSE,
  "verificationBadge" TEXT,
  "verificationDetails" JSONB,
  "listingStatus" TEXT DEFAULT 'ACTIVE',
  "isFeatured" BOOLEAN DEFAULT FALSE,
  "featuredUntil" TIMESTAMP(3),
  "rating" DOUBLE PRECISION DEFAULT 4.5,
  "reviewCount" INTEGER DEFAULT 0,
  "totalQuotesGiven" INTEGER DEFAULT 0,
  "avgResponseTimeHours" DOUBLE PRECISION DEFAULT 2.5,
  "contactEmail" TEXT,
  "contactPhone" TEXT,
  "showPhonePublicly" BOOLEAN DEFAULT FALSE,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- 3. BuyerEnquiry
CREATE TABLE IF NOT EXISTS "BuyerEnquiry" (
  "id" TEXT PRIMARY KEY,
  "enquiryNumber" TEXT UNIQUE NOT NULL,
  "buyerId" TEXT REFERENCES "User"("id") ON DELETE SET NULL,
  "categoryId" TEXT REFERENCES "MarketplaceCategory"("id") ON DELETE SET NULL,
  "serviceType" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "quantity" INTEGER DEFAULT 1,
  "budgetRangeMin" DOUBLE PRECISION,
  "budgetRangeMax" DOUBLE PRECISION,
  "targetDeliveryDate" TIMESTAMP(3),
  "locationCity" TEXT DEFAULT 'Gorakhpur',
  "locationState" TEXT DEFAULT 'Uttar Pradesh',
  "locationPincode" TEXT,
  "deliveryAddress" TEXT,
  "categorySpecificData" JSONB,
  "buyerName" TEXT NOT NULL,
  "buyerPhone" TEXT NOT NULL,
  "buyerEmail" TEXT,
  "buyerOrganization" TEXT,
  "isPhoneVerified" BOOLEAN DEFAULT FALSE,
  "isConsentGiven" BOOLEAN DEFAULT TRUE,
  "privacyMode" TEXT DEFAULT 'PROTECTED',
  "priority" TEXT DEFAULT 'MEDIUM',
  "status" TEXT DEFAULT 'SUBMITTED',
  "closureReason" TEXT,
  "assignedAdminId" TEXT,
  "adminNotes" TEXT,
  "ipAddress" TEXT,
  "source" TEXT DEFAULT 'marketplace_web',
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- 4. EnquiryProviderMatch
CREATE TABLE IF NOT EXISTS "EnquiryProviderMatch" (
  "id" TEXT PRIMARY KEY,
  "enquiryId" TEXT NOT NULL REFERENCES "BuyerEnquiry"("id") ON DELETE CASCADE,
  "listingId" TEXT REFERENCES "ProviderServiceListing"("id") ON DELETE SET NULL,
  "providerType" TEXT NOT NULL,
  "providerId" TEXT NOT NULL,
  "providerBusinessName" TEXT NOT NULL,
  "matchScore" DOUBLE PRECISION DEFAULT 0.0,
  "scoreBreakdown" JSONB,
  "notificationSentAt" TIMESTAMP(3),
  "viewedAt" TIMESTAMP(3),
  "respondedAt" TIMESTAMP(3),
  "status" TEXT DEFAULT 'NOTIFIED',
  "declineReason" TEXT,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- 5. ProviderQuotation
CREATE TABLE IF NOT EXISTS "ProviderQuotation" (
  "id" TEXT PRIMARY KEY,
  "quoteNumber" TEXT UNIQUE NOT NULL,
  "enquiryId" TEXT NOT NULL REFERENCES "BuyerEnquiry"("id") ON DELETE CASCADE,
  "listingId" TEXT REFERENCES "ProviderServiceListing"("id") ON DELETE SET NULL,
  "providerUserId" TEXT REFERENCES "User"("id") ON DELETE SET NULL,
  "providerType" TEXT NOT NULL,
  "providerId" TEXT NOT NULL,
  "providerBusinessName" TEXT NOT NULL,
  "providerContactName" TEXT,
  "providerPhone" TEXT,
  "providerEmail" TEXT,
  "subtotalAmount" DOUBLE PRECISION NOT NULL,
  "taxAmount" DOUBLE PRECISION DEFAULT 0.0,
  "shippingOrServiceFee" DOUBLE PRECISION DEFAULT 0.0,
  "totalAmount" DOUBLE PRECISION NOT NULL,
  "currency" TEXT DEFAULT 'INR',
  "timelineDelivery" TEXT,
  "warrantyTerms" TEXT,
  "paymentTerms" TEXT,
  "cancellationTerms" TEXT,
  "inclusions" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "exclusions" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "notes" TEXT,
  "validUntil" TIMESTAMP(3) NOT NULL,
  "status" TEXT DEFAULT 'SENT',
  "rejectionReason" TEXT,
  "versionNumber" INTEGER DEFAULT 1,
  "isRevised" BOOLEAN DEFAULT FALSE,
  "verificationBadge" TEXT DEFAULT 'SWASTIK_VERIFIED',
  "rating" DOUBLE PRECISION DEFAULT 4.7,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- 6. QuotationItem
CREATE TABLE IF NOT EXISTS "QuotationItem" (
  "id" TEXT PRIMARY KEY,
  "quotationId" TEXT NOT NULL REFERENCES "ProviderQuotation"("id") ON DELETE CASCADE,
  "itemName" TEXT NOT NULL,
  "description" TEXT,
  "hsnOrSacCode" TEXT,
  "quantity" INTEGER DEFAULT 1,
  "unitPrice" DOUBLE PRECISION NOT NULL,
  "taxRatePercent" DOUBLE PRECISION DEFAULT 18.0,
  "taxAmount" DOUBLE PRECISION DEFAULT 0.0,
  "totalPrice" DOUBLE PRECISION NOT NULL,
  "sortOrder" INTEGER DEFAULT 0,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- 7. QuotationRevision
CREATE TABLE IF NOT EXISTS "QuotationRevision" (
  "id" TEXT PRIMARY KEY,
  "quotationId" TEXT NOT NULL REFERENCES "ProviderQuotation"("id") ON DELETE CASCADE,
  "versionNumber" INTEGER NOT NULL,
  "snapshotData" JSONB NOT NULL,
  "reasonForRevision" TEXT,
  "revisedByUserId" TEXT,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- 8. EnquiryMessage
CREATE TABLE IF NOT EXISTS "EnquiryMessage" (
  "id" TEXT PRIMARY KEY,
  "enquiryId" TEXT NOT NULL REFERENCES "BuyerEnquiry"("id") ON DELETE CASCADE,
  "senderUserId" TEXT REFERENCES "User"("id") ON DELETE SET NULL,
  "senderType" TEXT NOT NULL,
  "senderName" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "attachmentUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "isReadByReceiver" BOOLEAN DEFAULT FALSE,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- 9. MarketplaceSubscription
CREATE TABLE IF NOT EXISTS "MarketplaceSubscription" (
  "id" TEXT PRIMARY KEY,
  "providerType" TEXT NOT NULL,
  "providerId" TEXT NOT NULL,
  "planName" TEXT NOT NULL,
  "monthlyLeadQuota" INTEGER DEFAULT 10,
  "leadsUsedThisMonth" INTEGER DEFAULT 0,
  "priorityListing" BOOLEAN DEFAULT FALSE,
  "pricePaid" DOUBLE PRECISION DEFAULT 0.0,
  "validFrom" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "validUntil" TIMESTAMP(3) NOT NULL,
  "isActive" BOOLEAN DEFAULT TRUE,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- 10. MarketplaceLeadAccess
CREATE TABLE IF NOT EXISTS "MarketplaceLeadAccess" (
  "id" TEXT PRIMARY KEY,
  "enquiryId" TEXT NOT NULL,
  "providerType" TEXT NOT NULL,
  "providerId" TEXT NOT NULL,
  "accessType" TEXT DEFAULT 'LEAD_UNLOCK',
  "unlockedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "amountPaid" DOUBLE PRECISION DEFAULT 0.0,
  "pricePaid" DOUBLE PRECISION DEFAULT 0.0,
  "billingReference" TEXT,
  "disputed" BOOLEAN DEFAULT FALSE,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MarketplaceLeadAccess_unique" UNIQUE ("enquiryId", "providerType", "providerId")
);

-- 11. MarketplaceReview
CREATE TABLE IF NOT EXISTS "MarketplaceReview" (
  "id" TEXT PRIMARY KEY,
  "listingId" TEXT NOT NULL,
  "buyerName" TEXT NOT NULL,
  "rating" DOUBLE PRECISION DEFAULT 5.0,
  "comment" TEXT,
  "isVerifiedPurchase" BOOLEAN DEFAULT TRUE,
  "isPublic" BOOLEAN DEFAULT TRUE,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- 12. MarketplaceDispute
CREATE TABLE IF NOT EXISTS "MarketplaceDispute" (
  "id" TEXT PRIMARY KEY,
  "enquiryId" TEXT REFERENCES "BuyerEnquiry"("id") ON DELETE CASCADE,
  "filedByUserId" TEXT REFERENCES "User"("id") ON DELETE CASCADE,
  "providerType" TEXT NOT NULL,
  "providerId" TEXT NOT NULL,
  "reason" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "status" TEXT DEFAULT 'OPEN',
  "adminResolution" TEXT,
  "resolvedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- Indices
CREATE INDEX IF NOT EXISTS "MarketplaceCategory_serviceType_isActive_idx" ON "MarketplaceCategory"("serviceType", "isActive");
CREATE INDEX IF NOT EXISTS "ProviderQuotation_enquiryId_status_idx" ON "ProviderQuotation"("enquiryId", "status");
CREATE INDEX IF NOT EXISTS "ProviderQuotation_providerId_status_idx" ON "ProviderQuotation"("providerId", "status");
CREATE INDEX IF NOT EXISTS "BuyerEnquiry_status_idx" ON "BuyerEnquiry"("status");
CREATE INDEX IF NOT EXISTS "BuyerEnquiry_categoryId_idx" ON "BuyerEnquiry"("categoryId");
`;

async function applyDDL() {
  console.log('Connecting to database via DIRECT_URL...');
  const client = new Client({
    connectionString: process.env.DIRECT_URL,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();
  console.log('Connected! Creating HealthMart tables...');
  await client.query(ddl);
  console.log('All HealthMart tables created successfully!');
  await client.end();
}

applyDDL().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});

