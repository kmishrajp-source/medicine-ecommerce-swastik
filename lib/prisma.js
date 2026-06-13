import { PrismaClient } from '@prisma/client'

// Fallback to PRISMA_DATABASE_URL if DATABASE_URL is missing
if (!process.env.DATABASE_URL && process.env.PRISMA_DATABASE_URL) {
    process.env.DATABASE_URL = process.env.PRISMA_DATABASE_URL;
}

const prismaClientSingleton = () => {
    return new PrismaClient()
}

const globalForPrisma = globalThis

const prisma = globalForPrisma.prisma || prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
