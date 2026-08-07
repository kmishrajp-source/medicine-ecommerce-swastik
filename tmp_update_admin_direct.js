const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

let dbUrl = '';
let directUrl = '';
try {
    const envContent = fs.readFileSync('.env', 'utf-8');
    const match = envContent.match(/PRISMA_DATABASE_URL="([^"]+)"/);
    if (match) dbUrl = match[1];
    
    const match2 = envContent.match(/DIRECT_URL="([^"]+)"/);
    if (match2) directUrl = match2[1];
} catch(e) {}

if (!directUrl && !dbUrl) {
    console.error('Could not find connection URL in .env');
    process.exit(1);
}

// Use direct URL for the script to bypass the pooler which might be offline
process.env.DATABASE_URL = directUrl || dbUrl;
const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash('Pranshu@2007', 10);
    
    await prisma.user.upsert({
        where: { email: 'kmishrajp@gmail.com' },
        update: { password: hashedPassword, role: 'ADMIN' },
        create: { email: 'kmishrajp@gmail.com', name: 'Kaushlesh Mishra', password: hashedPassword, role: 'ADMIN' }
    });
    
    console.log('Admin accounts updated successfully with new password!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
