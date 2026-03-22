"use client";
import React, { useState, useEffect } from 'react';

const AIRecoveryAssistant = ({ actionType = null, pageName = null }) => {
    const [lastError, setLastError] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    // Poll for recent failures for this user/session (simplified)
    useEffect(() => {
        const interval = setInterval(checkForFailures, 5000);
        return () => clearInterval(interval);
    }, []);

    const checkForFailures = async () => {
        try {
            // In a real app, we might check a local state or a lightweight 'hasFailure' endpoint
            // For this demo, we'll assume the parent component can pass an error state or we poll
            const res = await fetch('/api/user/recent-failure');
            const data = await res.json();
            if (data.failure && !data.failure.isResolved) {
                setLastError(data.failure);
                setIsVisible(true);
            }
        } catch (e) { /* silent */ }
    };

    if (!isVisible || !lastError) return null;

    const suggestions = {
        'payment_gateway': [
            "Network timeout while connecting to bank. Please wait 2 minutes before retrying.",
            "Ensure your UPI app / Card has international/online transactions enabled.",
            "Try using PhonePe or Google Pay if card payment fails."
        ],
        'validation': [
            "Check that your phone number and delivery address are correctly formatted.",
            "Ensure all required prescription fields are filled."
        ],
        'server': [
            "Our servers are under high load. We've notified our technicians.",
            "Try refreshing the page or clearing your cache."
        ],
        'partner_registration': [
            "Ensure your License/Registration ID is in the correct format.",
            "Make sure your Bank Account and IFSC code are from a supported Indian bank.",
            "Wait for 5 minutes if the OTP is delayed."
        ],
        'settlement_failure': [
            "Your bank's UPI/IMPS server might be down. The platform will retry in 1 hour.",
            "Check if your GSTIN/Bank details have changed recently.",
            "Contact Swastik Finance Support if the failure persists beyond 24 hours."
        ],
        'default': [
            "We've encountered an unexpected error. Our team is investigating.",
            "Feel free to Chat on WhatsApp (+91 79921 22974) for immediate support."
        ]
    };

    const currentSuggestions = suggestions[lastError.errorType] || suggestions['default'];

    return (
        <div style={{
            position: 'fixed',
            bottom: '100px',
            right: '25px',
            width: '320px',
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
            border: '2px solid #4F46E5',
            zIndex: 9999,
            padding: '20px',
            animation: 'slideUp 0.3s ease-out'
        }}>
            <style>{`
                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                <div style={{ background: '#4F46E5', color: 'white', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="fa-solid fa-robot"></i>
                </div>
                <h4 style={{ margin: 0, fontSize: '1rem', color: '#111827' }}>AI Recovery Support</h4>
                <button 
                    onClick={() => setIsVisible(false)}
                    style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF' }}
                >
                    <i className="fa-solid fa-xmark"></i>
                </button>
            </div>

            <p style={{ fontSize: '0.875rem', color: '#4B5563', marginBottom: '15px' }}>
                <strong>Issue Detected:</strong> {lastError.errorMessage}
            </p>

            <div style={{ background: '#F3F4F6', padding: '12px', borderRadius: '8px', marginBottom: '15px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#4F46E5', textTransform: 'uppercase', marginBottom: '8px' }}>Steps to Solve:</div>
                <ul style={{ paddingLeft: '18px', margin: 0, fontSize: '0.85rem', color: '#374151' }}>
                    {currentSuggestions.map((s, i) => <li key={i} style={{ marginBottom: '5px' }}>{s}</li>)}
                </ul>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                    onClick={() => window.location.reload()}
                    style={{ flex: 1, background: '#4F46E5', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 'bold' }}
                >
                    Retry Action
                </button>
                <a 
                    href="https://wa.me/917992122974" 
                    target="_blank" 
                    style={{ flex: 1, background: '#25D366', color: 'white', textAlign: 'center', textDecoration: 'none', padding: '10px', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 'bold' }}
                >
                    Chat Support
                </a>
            </div>
            
            <div style={{ marginTop: '15px', fontSize: '0.7rem', color: '#9CA3AF', textAlign: 'center' }}>
                Logged ID: {lastError.id?.slice(-8)}
            </div>
        </div>
    );
};

export default AIRecoveryAssistant;
