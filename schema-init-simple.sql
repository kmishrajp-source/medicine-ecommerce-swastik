-- Generated SQL from Prisma Migrate Diff
-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'CUSTOMER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "insuranceCompanyId" TEXT,
    "referralCode" TEXT,
    "referredBy" TEXT,
    "walletBalance" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "fcmTokens" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "lastIpAddress" TEXT,
    "deviceId" TEXT,
    "phoneVerified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "image" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "requiresPrescription" BOOLEAN NOT NULL DEFAULT false,
    "uses" TEXT,
    "sideEffects" TEXT,
    "stock" INTEGER NOT NULL DEFAULT 100,
    "composition" TEXT,
    "manufacturer" TEXT,
    "brand" TEXT,
    "salt" TEXT,
    "mrp" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "discount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "isRecommended" BOOLEAN NOT NULL DEFAULT false,
    "packSize" TEXT,
    "expiryDate" TIMESTAMP(3),
    "batchNumber" TEXT,
    "isOTC" BOOLEAN NOT NULL DEFAULT false,
    "isScheduleH1" BOOLEAN NOT NULL DEFAULT false,
    "isColdChain" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "manufacturerId" TEXT,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hospital" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL DEFAULT 'Gorakhpur',
    "licenseNumber" TEXT,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "website" TEXT,
    "specialties" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "isDirectory" BOOLEAN NOT NULL DEFAULT false,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 4.5,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    "photoUrl" TEXT,
    "openingHours" TEXT NOT NULL DEFAULT '24/7 Hours',
    "bankDetails" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Hospital_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Doctor" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT,
    "specialization" TEXT NOT NULL,
    "hospital" TEXT,
    "hospitalId" TEXT,
    "city" TEXT NOT NULL DEFAULT 'Gorakhpur',
    "experience" INTEGER,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'unverified',
    "source" TEXT NOT NULL DEFAULT 'field_agent',
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "phone" TEXT,
    "photoUrl" TEXT,
    "consultationFee" DOUBLE PRECISION NOT NULL DEFAULT 500.0,
    "razorpayAccountId" TEXT,
    "isDirectory" BOOLEAN NOT NULL DEFAULT false,
    "location" TEXT,
    "isClaimed" BOOLEAN NOT NULL DEFAULT false,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 4.0,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    "recommendationRate" INTEGER NOT NULL DEFAULT 80,
    "patientStoriesCount" INTEGER NOT NULL DEFAULT 0,
    "openingHours" TEXT NOT NULL DEFAULT '9:00 AM - 5:00 PM',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Doctor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Retailer" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "shopName" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "licenseNumber" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "city" TEXT NOT NULL DEFAULT 'Gorakhpur',
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "isDirectory" BOOLEAN NOT NULL DEFAULT false,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 4.5,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'unverified',
    "source" TEXT NOT NULL DEFAULT 'field_agent',
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "photoUrl" TEXT,
    "openingHours" TEXT NOT NULL DEFAULT '9:00 AM - 10:00 PM',
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "priority_score" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Retailer_pkey" PRIMARY KEY ("id")
);

-- [Rest of the SQL tables...]
-- Note: I will only create the core tables needed for the directory first to ensure it works.
