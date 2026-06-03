require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });
if (!process.env.DATABASE_URL && process.env.PRISMA_DATABASE_URL) {
    process.env.DATABASE_URL = process.env.PRISMA_DATABASE_URL;
}
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await prisma.user.upsert({
        where: { email: 'admin@swastik.com' },
        update: { password: hashedPassword, role: 'ADMIN' },
        create: { email: 'admin@swastik.com', name: 'Swastik Admin', password: hashedPassword, role: 'ADMIN' }
    });
    console.log('Admin user updated successfully. Password is: admin123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
