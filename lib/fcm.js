import * as admin from 'firebase-admin';
import prisma from "@/lib/prisma";

// Initialize Firebase Admin safely ensuring it only happens once
if (!admin.apps.length) {
    try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log("Firebase Admin Initialized for Push Notifications");
    } catch (error) {
        console.error("Firebase Admin Initialization Error:", error.message);
    }
}

/**
 * Sends a Push Notification using Firebase Cloud Messaging (FCM) to a specific user.
 * It broadcasts the message to all devices registered under that User's `fcmTokens` array.
 * 
 * @param {string} userId - The unique Prisma ID of the User to target
 * @param {string} title - Notification Title
 * @param {string} body - Notification Body text
 * @param {string} clickActionUrl - URL to open when the user clicks the notification
 */
export async function sendPushNotification(userId, title, body, clickActionUrl = "/") {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { fcmTokens: true, name: true }
        });

        if (!user || !user.fcmTokens || user.fcmTokens.length === 0) {
            console.log(`[FCM] Could not send push to ${userId}: No registered devices.`);
            return { success: false, reason: "No tokens" };
        }

        const message = {
            notification: {
                title,
                body
            },
            data: {
                click_action: clickActionUrl // Used by service worker to route user
            },
            tokens: user.fcmTokens
        };

        const response = await admin.messaging().sendEachForMulticast(message);
        console.log(`[FCM] Sent Push to ${user.name} | Success: ${response.successCount} | Failed: ${response.failureCount}`);

        // Cleanup: If there are failures, it usually means the token expired or the user uninstalled
        if (response.failureCount > 0) {
            const failedTokens = [];
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    failedTokens.push(user.fcmTokens[idx]);
                }
            });

            // Remove dead tokens from the database to optimize future sends
            if (failedTokens.length > 0) {
                const activeTokens = user.fcmTokens.filter(t => !failedTokens.includes(t));
                await prisma.user.update({
                    where: { id: userId },
                    data: { fcmTokens: activeTokens }
                });
                console.log(`[FCM] Cleaned up ${failedTokens.length} dead tokens for user ${userId}`);
            }
        }

        return { success: true, delivered: response.successCount };

    } catch (error) {
        console.error("[FCM SERVER EXCEPTION]", error);
        return { success: false, error: error.message };
    }
}
