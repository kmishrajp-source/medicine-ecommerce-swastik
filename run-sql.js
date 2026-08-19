const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runSQL() {
  try {
    console.log("Running Phase 3 SQL...");
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "BiomedicalResearch" (
          "id"          TEXT NOT NULL,
          "title"       TEXT NOT NULL,
          "abstract"    TEXT NOT NULL,
          "source"      TEXT NOT NULL,
          "publishedAt" TIMESTAMP(3) NOT NULL,
          "keywords"    TEXT[],
          "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "BiomedicalResearch_pkey" PRIMARY KEY ("id")
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "ResearchAlert" (
          "id"        TEXT NOT NULL,
          "userId"    TEXT NOT NULL,
          "topic"     TEXT NOT NULL,
          "frequency" TEXT NOT NULL DEFAULT 'WEEKLY',
          "isActive"  BOOLEAN NOT NULL DEFAULT true,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "ResearchAlert_pkey" PRIMARY KEY ("id"),
          CONSTRAINT "ResearchAlert_userId_fkey"
              FOREIGN KEY ("userId") REFERENCES "User"("id")
              ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "ResearchAlert_userId_idx" ON "ResearchAlert"("userId");
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "BiomarkerInfo" (
          "id"          TEXT NOT NULL,
          "name"        TEXT NOT NULL,
          "description" TEXT NOT NULL,
          "disease"     TEXT,
          "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "BiomarkerInfo_pkey" PRIMARY KEY ("id")
      );
    `);

    await prisma.$executeRawUnsafe(`
      ALTER TABLE "LabTest" ADD COLUMN IF NOT EXISTS "category" TEXT NOT NULL DEFAULT 'ROUTINE';
    `);
    
    console.log("Phase 3 SQL done.");
    
    console.log("Running Phase 6 SQL...");
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "BioinformaticsDataset" (
          "id"          TEXT NOT NULL,
          "userId"      TEXT NOT NULL,
          "name"        TEXT NOT NULL,
          "description" TEXT,
          "fileUrl"     TEXT NOT NULL,
          "format"      TEXT NOT NULL,
          "status"      TEXT NOT NULL DEFAULT 'UPLOADED',
          "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "BioinformaticsDataset_pkey" PRIMARY KEY ("id"),
          CONSTRAINT "BioinformaticsDataset_userId_fkey"
              FOREIGN KEY ("userId") REFERENCES "User"("id")
              ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "BioinformaticsDataset_userId_idx" ON "BioinformaticsDataset"("userId");
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "BioinformaticsJob" (
          "id"           TEXT NOT NULL,
          "datasetId"    TEXT NOT NULL,
          "analysisType" TEXT NOT NULL,
          "status"       TEXT NOT NULL DEFAULT 'QUEUED',
          "resultUrl"    TEXT,
          "log"          TEXT,
          "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "BioinformaticsJob_pkey" PRIMARY KEY ("id"),
          CONSTRAINT "BioinformaticsJob_datasetId_fkey"
              FOREIGN KEY ("datasetId") REFERENCES "BioinformaticsDataset"("id")
              ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "BioinformaticsJob_datasetId_idx" ON "BioinformaticsJob"("datasetId");
    `);

    console.log("Phase 6 SQL done.");
    
  } catch (error) {
    console.error("Error running SQL:", error);
  } finally {
    await prisma.$disconnect();
  }
}

runSQL();
