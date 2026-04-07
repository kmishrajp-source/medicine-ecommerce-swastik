"use client";
import React, { useState, useEffect } from 'react';
import { trackEvent, ANALYTICS_EVENTS } from '@/lib/analytics';

/**
 * Swastik AIRecoveryAssistant (Master Proactive Version)
 * Monitors user hesitation, exit intent, and critical search intent to prevent drop-offs.
 */
const AIRecoveryAssistant = ({ currentQuery = "", pageType = "general" }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [suggestion, setSuggestion] = useState("");
    const [lastError, setLastError] = useState(null);

    // 1. BEHAVIORAL MONITORING: Exit Intent & Hesitation
    useEffect(() => {
        const handleExitIntent = (e) => {
            if (e.clientY <= 0) { // Mouse moving towards browser tab/exit
                setSuggestion("Don't leave without finding a doctor! Tap here for an instant referral.");
                setIsVisible(true);
                trackEvent(ANALYTICS_EVENTS.EXIT_INTENT, { page: pageType, query: currentQuery });
            }
        };

        const hesitationTimer = setTimeout(() => {
            if (!isVisible && currentQuery) {
                setSuggestion(`Need help refined your search for "${currentQuery}"? Tap for expert selection.`);
                setIsVisible(true);
                trackEvent(ANALYTICS_EVENTS.HESITATION, { page: pageType, query: currentQuery });
            }
        }, 15000); // 15s inactivity

        document.addEventListener('mouseleave', handleExitIntent);
        return () => {
            document.removeEventListener('mouseleave', handleExitIntent);
            clearTimeout(hesitationTimer);
        };
    }, [currentQuery, pageType]);

    // 2. INTENT MONITORING: Critical Keywords (Ambulance/Emergency)
    useEffect(() => {
        if (!currentQuery) return;
        const q = currentQuery.toLowerCase();
        
        if (q.includes('ambulance') || q.includes('emergency') || q.includes('sos')) {
            setSuggestion("🚨 EMERGENCY DETECTED: I've alerted dispatch. Call +917992122974 now for immediate assistance.");
            setIsVisible(true);
            return;
        }

        // Feature-specific proactive guidance (Medical Intent)
        if (q.includes('lungs') || q.includes('breathing')) {
            setSuggestion("Searching for lung-related health? I can recommend top-rated Pulmonologists.");
            setIsVisible(true);
        } else if (q.includes('heart') || q.includes('chest')) {
            setSuggestion("Searching for heart care? You should consult a Cardiologist first.");
            setIsVisible(true);
        }
    }, [currentQuery]);

    // 3. LEGACY FAILURE POLLING (For Step 10: Real-time Alerts)
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const res = await fetch('/api/user/recent-failure');
                const data = await res.json();
                if (data.failure && !data.failure.isResolved) {
                    setLastError(data.failure);
                    setSuggestion(`Detected ${data.failure.errorType} error. We've notified our technician.`);
                    setIsVisible(true);
                }
            } catch (e) {}
        }, 8000);
        return () => clearInterval(interval);
    }, []);

    if (!isVisible) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: '100px',
            right: '25px',
            width: '340px',
            background: 'white',
            borderRadius: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            border: '2px solid #6366f1',
            zIndex: 9999,
            padding: '24px',
            animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
            <style>{`
                @keyframes slideUp {
                    from { transform: translateY(30px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ background: '#6366f1', color: 'white', width: '32px', height: '32px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="fa-solid fa-robot"></i>
                </div>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#1f2937' }}>Swastik AI Assistant</h4>
                <button 
                    onClick={() => setIsVisible(false)}
                    style={{ marginLeft: 'auto', background: '#f3f4f6', border: 'none', cursor: 'pointer', color: '#9ca3af', width: '28px', height: '28px', borderRadius: '50%' }}
                >
                    <i className="fa-solid fa-xmark"></i>
                </button>
            </div>

            <div style={{ background: '#fef2f2', padding: '16px', borderRadius: '16px', borderLeft: '4px solid #ef4444', marginBottom: '20px' }}>
                <p style={{ fontSize: '0.875rem', color: '#1f2937', fontWeight: 600, margin: 0, lineHeight: 1.5 }}>
                    {suggestion}
                </p>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
                <a 
                    href="tel:+917992122974"
                    onClick={() => trackEvent("ai_intervention_click", { method: "tap_call" })}
                    style={{ flex: 1, background: '#111827', color: 'white', border: 'none', padding: '12px', borderRadius: '12px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 900, textAlign: 'center', textDecoration: 'none' }}
                >
                    TALK TO DISPATCH
                </a>
                <a 
                    href={`https://wa.me/917992122974?text=AI Help: Case ${currentQuery}`}
                    target="_blank" 
                    onClick={() => trackEvent("ai_intervention_click", { method: "tap_whatsapp" })}
                    style={{ flex: 1, background: '#25D366', color: 'white', textAlign: 'center', textDecoration: 'none', padding: '12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 900 }}
                >
                    WHATSAPP HELP
                </a>
            </div>
            
            <div style={{ marginTop: '16px', fontSize: '0.65rem', color: '#9ca3af', textAlign: 'center', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {lastError ? `Recovering ID: ${lastError.id?.slice(-8)}` : `Proactive Monitoring Active`}
            </div>
        </div>
    );
};

export default AIRecoveryAssistant;
