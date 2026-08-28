export async function dispatchToViaSocket(eventName, payload, webhookUrlOverride = null) {
    const webhookUrl = webhookUrlOverride || process.env.VIASOCKET_LEAD_WEBHOOK_URL;
    
    // Fail gracefully: Do not break the app if viaSocket is not configured
    if (!webhookUrl) {
        console.warn(`[viaSocket] Missing VIASOCKET_LEAD_WEBHOOK_URL for event: ${eventName}`);
        return { success: false, reason: 'missing_url' };
    }

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                event: eventName,
                timestamp: new Date().toISOString(),
                data: payload
            })
        });
        
        return { success: response.ok };
    } catch (error) {
        console.error(`[viaSocket Error] Failed to dispatch ${eventName}:`, error);
        // We return false rather than throwing so the main transaction completes safely
        return { success: false, error: error.message };
    }
}
