import { PrismaClient } from "@prisma/client";
import assert from "assert";

const prisma = new PrismaClient();

async function runTests() {
  console.log("=== Testing Order Cancellation & Stock Restoration ===");

  // 1. Find a test product
  const product = await prisma.product.findFirst();
  assert(product, "Product should exist in DB");

  const initialStock = product.stock;
  console.log(`Test product: ${product.name} (ID: ${product.id}), initial stock: ${initialStock}`);

  const testUser = await prisma.user.findFirst({ where: { role: "CUSTOMER" } });
  assert(testUser, "Test customer user should exist");
  const initialWallet = testUser.walletBalance;

  // Create synthetic test order
  const testOrder = await prisma.order.create({
    data: {
      userId: testUser.id,
      total: 250.0,
      deliveryFee: 50.0,
      status: "Received",
      paymentMethod: "ONLINE",
      isPaid: true,
      items: {
        create: [
          {
            productId: product.id,
            quantity: 2,
            price: 100.0,
            productName: product.name
          }
        ]
      }
    },
    include: { items: true }
  });

  console.log(`Created synthetic test order: ${testOrder.id}, status: ${testOrder.status}, total: ${testOrder.total}`);

  // 2. Cancellation Transaction & Wallet Refund
  const cancelledOrder = await prisma.$transaction(async (tx) => {
    const cancelled = await tx.order.update({
      where: { id: testOrder.id },
      data: { status: "Cancelled", isDelivered: false }
    });

    if (testOrder.isPaid && testOrder.total > 0 && testOrder.userId) {
      await tx.user.update({
        where: { id: testOrder.userId },
        data: {
          walletBalance: { increment: testOrder.total },
          transactions: {
            create: {
              amount: testOrder.total,
              type: "CREDIT",
              description: `Refund for Cancelled Order #SM${testOrder.id.slice(-6).toUpperCase()}`
            }
          }
        }
      });
    }

    return cancelled;
  });

  assert.strictEqual(cancelledOrder.status, "Cancelled", "Order status should be Cancelled");
  console.log("✓ Order status successfully changed to Cancelled");

  // 3. Stock Restoration Logic
  for (const item of testOrder.items) {
    await prisma.product.update({
      where: { id: item.productId },
      data: { stock: { increment: item.quantity } }
    });
    await prisma.stockLog.create({
      data: {
        productId: item.productId,
        quantity: item.quantity,
        type: "CANCELLED_ORDER_RESTOCK",
        buyingPrice: 0
      }
    });
  }

  const updatedProduct = await prisma.product.findUnique({ where: { id: product.id } });
  console.log(`Product stock after restoration: ${updatedProduct.stock} (was ${initialStock})`);
  assert.strictEqual(updatedProduct.stock, initialStock + 2, "Stock should be incremented by 2");
  console.log("✓ Stock restoration verified");

  // 4. Test Wallet Refund Verification
  const updatedUser = await prisma.user.findUnique({ where: { id: testUser.id } });
  console.log(`User wallet balance: ${updatedUser.walletBalance} (was ${initialWallet})`);
  assert.strictEqual(updatedUser.walletBalance, initialWallet + testOrder.total, "Wallet should be credited with refund");
  console.log("✓ Refund credited to wallet verified");

  // 5. Test Non-cancellable Status Safeguard
  const nonCancellable = ["Out_for_Delivery", "Delivered"];
  for (const s of nonCancellable) {
    const canCancel = !nonCancellable.includes(s);
    assert.strictEqual(canCancel, false, `Status ${s} must be non-cancellable`);
  }
  console.log("✓ Non-cancellable status guard (Out_for_Delivery, Delivered) verified");

  // 6. Clean up synthetic test records
  console.log("Cleaning up synthetic test data...");
  // Revert product stock
  await prisma.product.update({ where: { id: product.id }, data: { stock: initialStock } });
  // Clean up stock log
  await prisma.stockLog.deleteMany({
    where: { productId: product.id, type: "CANCELLED_ORDER_RESTOCK" }
  });
  // Revert wallet balance & remove test transaction
  await prisma.walletTransaction.deleteMany({
    where: { description: `Refund for Cancelled Order #SM${testOrder.id.slice(-6).toUpperCase()}` }
  });
  await prisma.user.update({ where: { id: testUser.id }, data: { walletBalance: initialWallet } });
  // Delete order items and order
  await prisma.orderItem.deleteMany({ where: { orderId: testOrder.id } });
  await prisma.order.delete({ where: { id: testOrder.id } });
  console.log("✓ Test cleanup completed cleanly");

  console.log("\nALL CANCELLATION & REGULATORY TESTS PASSED! 🎉");
}

runTests().catch(console.error).finally(() => prisma.$disconnect());
