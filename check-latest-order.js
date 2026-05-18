const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://postgres.kklkpnzwxaxekxraqswh:Shivangi%40%23%242004@db.kklkpnzwxaxekxraqswh.supabase.co:5432/postgres'
    }
  }
});

async function main() {
  try {
    console.log("Fetching the latest orders from database...");
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (orders.length === 0) {
      console.log("No orders found in the database.");
      return;
    }

    console.log("Latest Orders:");
    orders.forEach((o, index) => {
      console.log(`\n--- Order #${index + 1} ---`);
      console.log(`ID: ${o.id}`);
      console.log(`Created At: ${o.createdAt}`);
      console.log(`Status: ${o.status}`);
      console.log(`Total: ₹${o.total}`);
      console.log(`Payment Method: ${o.paymentMethod}`);
      console.log(`Delivery Code: ${o.deliveryCode}`);
      console.log(`Customer: ${o.guestName || 'Logged In User'}`);
      console.log(`Phone: ${o.guestPhone || 'N/A'}`);
      console.log(`Address: ${o.address || 'N/A'}`);
      console.log(`Items: ${o.items.map(i => `${i.product.name} (x${i.quantity})`).join(', ')}`);
    });

  } catch (err) {
    console.error("Error executing query:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
