// scripts/send-reminders.mjs
import { PrismaClient } from '@prisma/client';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

async function sendReminders() {
    console.log("------------------------------------------");
    console.log("   Swastik Medicare -> Refill Reminders   ");
    console.log("------------------------------------------");

    const today = new Date();
    const reminderDate = new Date();
    reminderDate.setDate(today.getDate() - 25); // Orders from 25 days ago

    // Set start and end of that day
    const startOfDay = new Date(reminderDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(reminderDate.setHours(23, 59, 59, 999));

    console.log(`Checking orders from: ${startOfDay.toLocaleDateString()}`);

    try {
        const orders = await prisma.order.findMany({
            where: {
                createdAt: {
                    gte: startOfDay,
                    lte: endOfDay
                }
            },
            include: { user: true, items: true } // Include user to get name/phone
        });

        if (orders.length === 0) {
            console.log("No orders found from 25 days ago.");
        } else {
            console.log(`Found ${orders.length} orders due for refill reminder.`);

            for (const order of orders) {
                const name = order.guestName || order.user?.name || "Customer";
                const phone = order.guestPhone || order.user?.phone || "Unknown";
                const medicines = order.items.length;

                console.log(`[REMINDER] Sending to ${name} (${phone}) for Order #${order.id.slice(-6)}...`);

                // MOCK SMS SENDING
                // In production, call SMS API here
                // lib/sms.js logic duplicated or imported if ES modules allowed
                console.log(`   -> SMS Content: "Hi ${name}, your medicines from Swastik Medicare might be running low. Reply 'YES' to repeat your order of ${medicines} items."`);
                console.log(`   -> [SUCCESS] Mock SMS Sent.`);
            }
        }

    } catch (error) {
        console.error("Error sending reminders:", error);
    } finally {
        await prisma.$disconnect();
    }
}

sendReminders();
