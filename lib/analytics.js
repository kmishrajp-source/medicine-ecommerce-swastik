/**
 * Swastik Medicare Master Analytics Utility
 * Consolidated tracking for GA4, Meta Pixel, and Master Audit Engine.
 */

export const ANALYTICS_EVENTS = {
    SEARCH: "search_medical_intent",
    CHIP_CLICK: "click_symptom_chip",
    CONTACT: "initiate_contact",
    LEAD: "lead_generated",
    VIEW: "view_profile",
    SOS: "emergency_sos_triggered",
    EXIT_INTENT: "user_exit_intent_detected",
    HESITATION: "user_hesitation_detected",
    CONVERSION_FAILURE: "funnel_drop_off"
};

export const trackEvent = async (eventName, params = {}) => {
    if (typeof window === "undefined") return;

    // 1. Standard GA4 Event
    if (window.gtag) {
        window.gtag("event", eventName, {
            ...params,
            user_agent: window.navigator.userAgent,
            timestamp: new Date().toISOString()
        });
    }

    // 2. Meta Pixel Tracking
    if (window.fbq) {
        const pixelMap = {
            [ANALYTICS_EVENTS.SEARCH]: "Search",
            [ANALYTICS_EVENTS.LEAD]: "Lead",
            [ANALYTICS_EVENTS.CONTACT]: "Contact",
            [ANALYTICS_EVENTS.VIEW]: "ViewContent",
            [ANALYTICS_EVENTS.SOS]: "Contact"
        };
        window.fbq("track", pixelMap[eventName] || "CustomEvent", {
            content_name: eventName,
            ...params
        });
    }

    // 3. MASTER AUDIT LOGGING (Step 1-3)
    // Synchronously send to our server-side audit engine
    try {
        await fetch('/api/admin/audit/log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                event: eventName, 
                params: {
                    ...params,
                    url: window.location.href,
                    referrer: document.referrer,
                    screen: `${window.innerWidth}x${window.innerHeight}`
                } 
            })
        });
    } catch (e) {
        console.warn("Audit log failed:", e);
    }
};

/**
 * Enhanced Lead Tracking for Marketing
 * Captures source, campaign, and medium from URL
 */
export const getAdSource = () => {
    if (typeof window === "undefined") return { source: "direct", campaign: null };
    const params = new URLSearchParams(window.location.search);
    return {
        source: params.get("utm_source") || params.get("src") || "organic",
        campaign: params.get("utm_campaign") || "general",
        medium: params.get("utm_medium") || "referral"
    };
};

export const trackAdLead = async (leadData) => {
    const sourceData = getAdSource();
    const finalData = {
        ...leadData,
        ...sourceData,
        timestamp: new Date().toISOString()
    };

    // 1. Track in GA/Meta
    trackEvent(ANALYTICS_EVENTS.LEAD, {
        method: "smart_wa_form",
        ...finalData
    });

    // 2. Log to DB via API
    try {
        await fetch('/api/marketing/lead', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(finalData)
        });
    } catch (e) {
        console.error("Lead logging failed:", e);
    }
};

export const trackFunnelStep = (funnel, step, meta = {}) => {
    trackEvent(`funnel_${funnel}_step_${step}`, meta);
};

export const detectUserSegment = () => {
    if (typeof window === "undefined") return "unknown";
    const isReturning = localStorage.getItem("swastik_visitor_returning");
    if (!isReturning) {
        localStorage.setItem("swastik_visitor_returning", "true");
        return "new_visitor";
    }
    return "returning_visitor";
};
