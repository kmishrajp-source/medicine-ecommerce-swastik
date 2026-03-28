import prisma from './prisma';

/**
 * Logs a system failure to the database for AI recovery and admin monitoring.
 */
export async function logFailure({
    userId = null,
    userRole = null,
    actionType,
    errorType,
    errorMessage,
    pageUrl = null,
    details = {},
    aiSuggestion = null
}) {
    try {
        const log = await prisma.systemFailureLog.create({
            data: {
                userId,
                userRole,
                actionType,
                errorType,
                errorMessage: typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage),
                pageUrl,
                details: details || {},
                aiSuggestion
            }
        });
        console.log(`[FAILURE LOGGED] ID: ${log.id} | Action: ${actionType} | Error: ${errorType}`);
        return log;
    } catch (e) {
        console.error('[LOGGER ERROR] Failed to save failure log:', e);
        return null;
    }
}

/**
 * Log a security or system event to the database.
 */
export async function logEvent({ userId, action, details, ip, status = 'success' }) {
    try {
        await prisma.systemLog.create({
            data: {
                userId,
                action,
                details: typeof details === 'object' ? JSON.stringify(details) : details,
                ip,
                status,
                timestamp: new Date()
            }
        });
    } catch (error) {
        console.error("Logging Error:", error);
        // Fallback to console if DB logging fails to avoid losing event info
        console.log(`[SEC-LOG] ${status.toUpperCase()}: ${action} by ${userId || 'GUEST'} at ${ip}. Details: ${details}`);
    }
}
