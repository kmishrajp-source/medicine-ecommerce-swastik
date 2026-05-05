import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Retrieves the latest OTP sent to a phone number from the DB logs.
 * Used for automated verification bypass.
 */
export async function getLatestOTP(phone: string): Promise<string | null> {
    // Normalize phone to match DB storage (e.g. 91xxxxxxxxxx)
    let cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;

    const otpRecord = await prisma.oTP.findFirst({
        where: { phone: cleanPhone },
        orderBy: { createdAt: 'desc' }
    });

    return otpRecord?.code || null;
}

/**
 * Deletes all test-generated data for a specific test user.
 */
export async function cleanupTestData(phone: string, emailPrefix: string = 'automation_') {
    let cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;

    try {
        console.log(`Cleaning up test data for ${phone}...`);

        // 1. Find User
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { phone: cleanPhone },
                    { email: { startsWith: emailPrefix } }
                ]
            }
        });

        if (user) {
            // 2. Delete related records in order of dependency
            // Wallet Transactions
            await prisma.walletTransaction.deleteMany({ where: { userId: user.id } });
            
            // SubOrders
            await prisma.subOrder.deleteMany({ where: { userId: user.id } });

            // Order Items -> Orders
            const orders = await prisma.order.findMany({ where: { userId: user.id } });
            const orderIds = orders.map(o => o.id);
            
            await prisma.orderItem.deleteMany({ where: { orderId: { in: orderIds } } });
            await prisma.order.deleteMany({ where: { userId: user.id } });

            // OTPs
            await prisma.oTP.deleteMany({ where: { phone: cleanPhone } });

            // Finally, the User
            await prisma.user.delete({ where: { id: user.id } });
            
            console.log(`✅ Successfully cleaned up Test User: ${user.email}`);
        }
    } catch (error) {
        console.error('❌ Cleanup failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

/**
 * Resets inventory for a specific product to its original state.
 */
export async function resetInventory(productId: string, originalStock: number = 100) {
     await prisma.product.update({
        where: { id: productId },
        data: { stock: originalStock }
    });
}
