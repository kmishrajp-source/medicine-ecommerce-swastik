const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:Shivangi%40%23%242004@db.kklkpnzwxaxekxraqswh.supabase.co:5432/postgres",
    },
  },
});

async function main() {
  const email = "swastikmedicare.help@gmail.com";
  const plainPassword = "Shivangi@2004";
  
  console.log(`Hashing password for ${email}...`);
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  console.log(`Upserting user in the database...`);
  const adminUser = await prisma.user.upsert({
    where: { email: email },
    update: {
      password: hashedPassword,
      role: 'ADMIN',
      name: 'Swastik Admin Help'
    },
    create: {
      email: email,
      name: 'Swastik Admin Help',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('Successfully created/updated admin user:', adminUser.email);
}

main()
  .catch((e) => {
    console.error("Error updating admin user:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
