"use client";
import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackEvent, ANALYTICS_EVENTS } from '@/lib/analytics';

/**
 * Swastik AIRecoveryAssistant
 * Only active on the home page (e.g. /en, /hi, /bn).
 * Shows exit intent hints, hesitation prompts, and real server error alerts.
 */
const AIRecoveryAssistant = ({ currentQuery = "", pageType = "general" }) => {
    const pathname = usePathname();
    const [isVisible, setIsVisible] = useState(false);
    const [suggestion, setSuggestion] = useState("");
    const [alertType, setAlertType] = useState("info"); // "info" | "error" | "emergency"
    const [lastError, setLastError] = useState(null);

    // Only activate on home pages like /en, /hi, /bn
    const isHomePage = /^\/[a-z]{2}(\/)?$/.test(pathname);

    // 1. BEHAVIORAL MONITORING: Exit Intent & Hesitation (home page only)
    useEffect(() => {
        if (!isHomePage) return;

        const handleExitIntent = (e) => {
            if (e.clientY <= 0) {
                setSuggestion("Don't leave without finding a doctor! Tap here for an instant referral.");
                setAlertType("info");
                setIsVisible(true);
                trackEvent(ANALYTICS_EVENTS.EXIT_INTENT, { page: pageType, query: currentQuery });
            }
        };

        const hesitationTimer = setTimeout(() => {
            if (!isVisible && currentQuery) {
                setSuggestion(`Need help refining your search for "${currentQuery}"? Tap for expert selection.`);
                setAlertType("info");
                setIsVisible(true);
                trackEvent(ANALYTICS_EVENTS.HESITATION, { page: pageType, query: currentQuery });
            }
        }, 15000);

        document.addEventListener('mouseleave', handleExitIntent);
        return () => {
            document.removeEventListener('mouseleave', handleExitIntent);
            clearTimeout(hesitationTimer);
        };
    }, [currentQuery, pageType, isHomePage, isVisible]);

    // 2. INTENT MONITORING: Emergency & Medical Keywords (home page only)
    useEffect(() => {
        if (!isHomePage || !currentQuery) return;
        const q = currentQuery.toLowerCase();
        if (q.includes('ambulance') || q.includes('emergency') || q.includes('sos')) {
            setSuggestion("🚨 EMERGENCY DETECTED: I've alerted dispatch. Call +917992122974 now for immediate assistance.");
            setAlertType("emergency");
            setIsVisible(true);
            return;
        }
        if (q.includes('lungs') || q.includes('breathing')) {
            setSuggestion("Searching for lung-related health? I can recommend top-rated Pulmonologists.");
            setAlertType("info");
            setIsVisible(true);
        } else if (q.includes('heart') || q.includes('chest')) {
            setSuggestion("Searching for heart care? You should consult a Cardiologist first.");
            setAlertType("info");
            setIsVisible(true);
        }
    }, [currentQuery, isHomePage]);

    // 3. FAILURE POLLING — home page only, every 15s
    useEffect(() => {
        if (!isHomePage) return;
        const interval = setInterval(async () => {
            try {
                const res = await fetch('/api/user/recent-failure');
                const data = await res.json();
                if (data.failure && !data.failure.isResolved) {
                    setLastError(data.failure);
                    setSuggestion(`Detected ${data.failure.errorType} error. We've notified our technician.`);
                    setAlertType("error");
                    setIsVisible(true);
                }
            } catch (e) {}
        }, 15000);
        return () => clearInterval(interval);
    }, [isHomePage]);

    if (!isVisible || !isHomePage) return null;

    const alertColors = {
        info:      { bg: '#eff6ff', border: '#3b82f6', text: '#1e40af' },
        error:     { bg: '#fef2f2', border: '#ef4444', text: '#b91c1c' },
        emergency: { bg: '#fff7ed', border: '#f97316', text: '#c2410c' }
    };
    const colors = alertColors[alertType] || alertColors.info;

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
                    style={{ marginLeft: 'auto', background: '#f3f4f6', border: 'none', cursor: 'pointer', color: '#9ca3af', width: '28px', height: '28px', borderRadius: '50%', fontSize: '0.9rem' }}
                >✕</button>
            </div>

            <div style={{ background: colors.bg, padding: '16px', borderRadius: '16px', borderLeft: `4px solid ${colors.border}`, marginBottom: '20px' }}>
                <p style={{ fontSize: '0.875rem', color: colors.text, fontWeight: 600, margin: 0, lineHeight: 1.5 }}>
                    {suggestion}
                </p>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                    onClick={() => {
                        trackEvent("ai_intervention_click", { method: "tap_chat" });
                        window.dispatchEvent(new CustomEvent('swastik:open-chat', { 
                            detail: { message: "I need to talk to a representative / dispatch team. Please help." }
                        }));
                        setIsVisible(false);
                    }}
                    style={{ flex: 1, background: '#111827', color: 'white', border: 'none', padding: '12px', borderRadius: '12px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 900, textAlign: 'center' }}
                >
                    TALK TO DISPATCH
                </button>
                <a 
                    href={`https://wa.me/917992122974?text=AI Help: ${currentQuery}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    onClick={() => trackEvent("ai_intervention_click", { method: "tap_whatsapp" })}
                    style={{ flex: 1, background: '#25D366', color: 'white', border: 'none', cursor: 'pointer', textAlign: 'center', textDecoration: 'none', padding: '12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    WHATSAPP HELP
                </a>
            </div>
            
            <div style={{ marginTop: '16px', fontSize: '0.65rem', color: '#9ca3af', textAlign: 'center', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {lastError ? `Recovering ID: ${lastError.id?.slice(-8).toUpperCase()}` : `Proactive Monitoring Active`}
            </div>
        </div>
    );
};

export default AIRecoveryAssistant;
