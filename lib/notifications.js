import prisma from "./prisma";

/**
 * Send a notification for critical operations.
 * Currently logs to console/DB, but can be integrated with Resend/Twilio later.
 * 
 * @param {Object} params
 * @param {string} params.type - The type of notification (e.g. "SOP_CHANGED", "PRICE_CHANGED")
 * @param {string} params.message - The message body
 * @param {string} params.userId - The ID of the user responsible
 */
export async function sendCriticalAlert({ type, message, userId }) {
    console.log(`[ALERT: ${type}] ${message} (User: ${userId})`);

    try {
        // Log it to the SystemLogs table for UI dashboard display
        await prisma.systemLog.create({
            data: {
                level: "CRITICAL",
                feature: type,
                message: message,
                userId: userId,
                metadata: { timestamp: new Date().toISOString() }
            }
        });
        
        // TODO: In production, integrate email sending (e.g. Resend) here
        // sendEmail("superadmin@swastik.com", `Critical Alert: ${type}`, message);

        // TODO: In production, integrate SMS (e.g. MSG91, Twilio) here
        // sendSMS("+910000000000", message);

    } catch (error) {
        console.error("Failed to process critical alert:", error);
    }
}
