"use client";

import { useState, useEffect } from 'react';

export default function LeadCapturePopup() {
    const [isVisible, setIsVisible] = useState(false);
    const [hasDismissed, setHasDismissed] = useState(false);
    const [contactInfo, setContactInfo] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        // Prevent showing if already dismissed in this session/localstorage
        if (typeof window !== 'undefined') {
            const dismissed = localStorage.getItem('swastik_lead_popup_dismissed');
            if (dismissed === 'true') {
                setHasDismissed(true);
                return;
            }
        }

        // Trigger 1: Time Delay (15 seconds)
        const timer = setTimeout(() => {
            if (!hasDismissed && !isVisible) {
                setIsVisible(true);
            }
        }, 10000);

        // Trigger 2: Exit Intent (Mouse leaving viewport)
        const handleMouseLeave = (e) => {
            if (e.clientY <= 0 && !hasDismissed && !isVisible) {
                setIsVisible(true);
            }
        };

        document.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            clearTimeout(timer);
            document.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [hasDismissed, isVisible]);

    const handleDismiss = () => {
        setIsVisible(false);
        setHasDismissed(true);
        if (typeof window !== 'undefined') {
            localStorage.setItem('swastik_lead_popup_dismissed', 'true');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!contactInfo) return;

        setIsSubmitting(true);

        const isEmail = contactInfo.includes('@');
        const payload = {
            guestPhone: !isEmail ? contactInfo : null,
            guestEmail: isEmail ? contactInfo : null,
            source: 'exit_intent_popup',
            notes: 'Requested FIRST100 coupon'
        };

        try {
            const res = await fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setSuccessMessage('Successfully unlocked! Use code: FIRST100 at checkout.');
                // Copy to clipboard silently
                navigator.clipboard.writeText('FIRST100').catch(() => {});
                
                setTimeout(() => {
                    handleDismiss();
                }, 4000);
            } else {
                alert("Something went wrong. Please try again later.");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isVisible) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '20px'
        }}>
            <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '30px',
                maxWidth: '450px',
                width: '100%',
                position: 'relative',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                textAlign: 'center'
            }}>
                <button 
                    onClick={handleDismiss} 
                    style={{
                        position: 'absolute',
                        top: '15px',
                        right: '15px',
                        background: 'none',
                        border: 'none',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        color: '#6b7280'
                    }}
                >
                    &times;
                </button>

                <div style={{ marginBottom: '20px' }}>
                    <div style={{ 
                        background: '#eef2ff', 
                        display: 'inline-flex', 
                        padding: '15px', 
                        borderRadius: '50%',
                        marginBottom: '10px'
                    }}>
                        <i className="fa-solid fa-gift" style={{ fontSize: '2rem', color: '#4f46e5' }}></i>
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', margin: '0 0 10px 0' }}>Wait! Don't Miss Out</h2>
                    <p style={{ color: '#4b5563', margin: 0 }}>
                        Get <strong style={{ color: '#10b981' }}>₹50 OFF</strong> your very first medicine order. Unlock your coupon code instantly!
                    </p>
                </div>

                {successMessage ? (
                    <div style={{ background: '#ecfdf5', padding: '20px', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                        <p style={{ color: '#065f46', fontWeight: 'bold', margin: '0 0 10px 0' }}>{successMessage}</p>
                        <p style={{ color: '#047857', fontSize: '0.9rem', margin: 0 }}>(Code copied to clipboard!)</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <input
                            type="text"
                            placeholder="Enter WhatsApp Number or Email"
                            value={contactInfo}
                            onChange={(e) => setContactInfo(e.target.value)}
                            style={{
                                padding: '12px 15px',
                                border: '1px solid #d1d5db',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                width: '100%',
                                textAlign: 'center'
                            }}
                            required
                        />
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            style={{
                                background: '#4f46e5',
                                color: 'white',
                                padding: '12px',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                fontWeight: 'bold',
                                border: 'none',
                                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                transition: 'background 0.2s'
                            }}
                        >
                            {isSubmitting ? 'Unlocking...' : 'Unlock ₹50 OFF'}
                        </button>
                    </form>
                )}
                
                <p style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '15px' }}>
                    By continuing, you agree to receive promotional updates. You can opt-out anytime.
                </p>
            </div>
        </div>
    );
}
