/**
 * Swastik Medicare Analytics Utility
 * Standardizes event tracking across GA4 and Meta Pixel.
 */

export const trackEvent = (eventName, params = {}) => {
    if (typeof window === "undefined") return;

    // GA4 Tracking
    if (window.gtag) {
        window.gtag("event", eventName, params);
    }

    // Meta Pixel Tracking
    if (window.fbq) {
        // Map common events to standard Pixel events where possible
        const pixelMap = {
            "search_medical_intent": "Search",
            "initiate_contact": "Contact",
            "lead_generated": "Lead",
            "view_doctor_profile": "ViewContent"
        };
        
        const pixelEvent = pixelMap[eventName] || "CustomEvent";
        window.fbq("track", pixelEvent, {
            content_name: eventName,
            ...params
        });
    }

    // Development Logging
    if (process.env.NODE_ENV === "development") {
        console.log(`[Analytics] ${eventName}:`, params);
    }
};

export const ANALYTICS_EVENTS = {
    SEARCH: "search_medical_intent",
    CHIP_CLICK: "click_symptom_chip",
    CONTACT: "initiate_contact",
    LEAD: "lead_generated",
    VIEW: "view_doctor_profile"
};
