import prisma from './prisma';

/**
 * Logs a system failure to the database for AI recovery and admin monitoring.
 * @param {Object} params
 * @param {string} params.userId - ID of the user who experienced the failure.
 * @param {string} params.userRole - Role of the user (CUSTOMER, RETAILER, etc.).
 * @param {string} params.actionType - The action being performed (checkout, payment, etc.).
 * @param {string} params.errorType - Category of the error (network, validation, etc.).
 * @param {string} params.errorMessage - Human-readable error message.
 * @param {string} params.pageUrl - URL where the error occurred.
 * @param {Object} params.details - Additional metadata/JSON payload.
 * @param {string} params.aiSuggestion - Optional prompt or pre-generated suggestion.
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
