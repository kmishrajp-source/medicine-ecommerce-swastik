CREATE TABLE "StockBroadcast" (
    "id" TEXT NOT NULL,
    "medicineName" TEXT NOT NULL,
    "targetArea" TEXT,
    "sentCount" INTEGER NOT NULL DEFAULT 0,
    "repliesCount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockBroadcast_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "LiveStockQuote" (
    "id" TEXT NOT NULL,
    "broadcastId" TEXT NOT NULL,
    "retailerId" TEXT,
    "stockistId" TEXT,
    "retailerName" TEXT,
    "quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "respondedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LiveStockQuote_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StockistDirectory" (
    "id" TEXT NOT NULL,
    "agencyName" TEXT NOT NULL,
    "ownerName" TEXT,
    "phone" TEXT NOT NULL,
    "altPhone" TEXT,
    "email" TEXT,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "pincode" TEXT,
    "state" TEXT NOT NULL DEFAULT 'Uttar Pradesh',
    "gstin" TEXT,
    "licenseNumber" TEXT,
    "speciality" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockistDirectory_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RiderLocationLog" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "orderId" TEXT,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "heading" DOUBLE PRECISION,
    "speed" DOUBLE PRECISION,
    "accuracy" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RiderLocationLog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DeliveryAlert" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "orderId" TEXT,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeliveryAlert_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RiderCashAccount" (
    "id" TEXT NOT NULL,
    "riderId" TEXT NOT NULL,
    "cashHeld" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "cashSlab" DOUBLE PRECISION NOT NULL DEFAULT 5000.0,
    "totalCollected" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "totalDeposited" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RiderCashAccount_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CashTransaction" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "orderId" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CashTransaction_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CashDeposit" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "bankName" TEXT,
    "bankRef" TEXT,
    "receiptUrl" TEXT,
    "note" TEXT,
    "depositedAt" TIMESTAMP(3),
    "confirmedAt" TIMESTAMP(3),
    "confirmedBy" TEXT,
    "rejectedReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CashDeposit_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Distributor" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "companyName" TEXT NOT NULL,
    "ownerName" TEXT,
    "phone" TEXT NOT NULL,
    "altPhone" TEXT,
    "email" TEXT,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "pincode" TEXT,
    "state" TEXT NOT NULL DEFAULT 'Uttar Pradesh',
    "gstin" TEXT,
    "drugLicenseNo" TEXT,
    "brands" TEXT,
    "coverageArea" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Distributor_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CompetitorBill" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "phone" TEXT,
    "imageUrl" TEXT NOT NULL,
    "competitorName" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "couponCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompetitorBill_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Coupon" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "discountType" TEXT NOT NULL DEFAULT 'FLAT',
    "discountValue" DOUBLE PRECISION NOT NULL DEFAULT 100.0,
    "maxDiscount" DOUBLE PRECISION,
    "minOrderValue" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "validUntil" TIMESTAMP(3),
    "usageLimit" INTEGER NOT NULL DEFAULT 1,
    "timesUsed" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CampaignLead" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "campaign" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CampaignLead_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BroadcastCampaign" (
    "id" TEXT NOT NULL,
    "audience" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "totalSent" INTEGER NOT NULL DEFAULT 0,
    "totalFailed" INTEGER NOT NULL DEFAULT 0,
    "totalPending" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "BroadcastCampaign_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BroadcastLog" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "providerMsgId" TEXT,
    "errorMessage" TEXT,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BroadcastLog_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "LiveStockQuote" ADD CONSTRAINT "LiveStockQuote_broadcastId_fkey" FOREIGN KEY ("broadcastId") REFERENCES "StockBroadcast"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "RiderLocationLog" ADD CONSTRAINT "RiderLocationLog_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "DeliveryAgent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "DeliveryAlert" ADD CONSTRAINT "DeliveryAlert_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "DeliveryAgent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "RiderCashAccount" ADD CONSTRAINT "RiderCashAccount_riderId_fkey" FOREIGN KEY ("riderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CashTransaction" ADD CONSTRAINT "CashTransaction_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "RiderCashAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CashDeposit" ADD CONSTRAINT "CashDeposit_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "RiderCashAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Distributor" ADD CONSTRAINT "Distributor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CompetitorBill" ADD CONSTRAINT "CompetitorBill_couponCode_fkey" FOREIGN KEY ("couponCode") REFERENCES "Coupon"("code") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "BroadcastLog" ADD CONSTRAINT "BroadcastLog_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "BroadcastCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;
CREATE INDEX "RiderLocationLog_agentId_idx" ON "RiderLocationLog"("agentId");
CREATE INDEX "RiderLocationLog_orderId_idx" ON "RiderLocationLog"("orderId");
CREATE INDEX "RiderLocationLog_createdAt_idx" ON "RiderLocationLog"("createdAt");
CREATE INDEX "DeliveryAlert_agentId_idx" ON "DeliveryAlert"("agentId");
CREATE INDEX "DeliveryAlert_type_idx" ON "DeliveryAlert"("type");
CREATE INDEX "DeliveryAlert_isResolved_idx" ON "DeliveryAlert"("isResolved");
CREATE INDEX "CashTransaction_accountId_idx" ON "CashTransaction"("accountId");
CREATE INDEX "CashTransaction_type_idx" ON "CashTransaction"("type");
CREATE INDEX "CashDeposit_accountId_idx" ON "CashDeposit"("accountId");
CREATE INDEX "CashDeposit_status_idx" ON "CashDeposit"("status");
CREATE INDEX "BroadcastLog_campaignId_idx" ON "BroadcastLog"("campaignId");

