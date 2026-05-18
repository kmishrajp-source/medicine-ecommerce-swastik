"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function DeliveryLogin() {
    const [orderId, setOrderId] = useState("");
    const [code, setCode] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleVerify = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/verify-delivery", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId, code }),
            });

            const data = await res.json();

            if (data.success) {
                setMessage(data.message);
                setOrderId("");
                setCode("");
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError("Verification failed. Check network.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar cartCount={0} openCart={() => { }} />
            <div style={{
                minHeight: '100vh',
                background: 'radial-gradient(circle at top right, #1e1b4b, #0f0728, #070314)',
                padding: '120px 20px 60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: "'Inter', sans-serif"
            }}>
                <div style={{
                    width: '100%',
                    maxWidth: '450px',
                    background: 'rgba(15, 10, 30, 0.65)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(139, 92, 246, 0.25)',
                    borderRadius: '24px',
                    padding: '40px',
                    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4), 0 0 40px rgba(139, 92, 246, 0.1)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {/* Glowing Accent */}
                    <div style={{
                        position: 'absolute',
                        top: '-150px',
                        right: '-150px',
                        width: '300px',
                        height: '300px',
                        background: 'radial-gradient(circle, rgba(167, 139, 250, 0.3) 0%, transparent 70%)',
                        pointerEvents: 'none'
                    }} />

                    <div style={{ textAlign: 'center', marginBottom: '35px' }}>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '70px',
                            height: '70px',
                            background: 'linear-gradient(135deg, #a78bfa, #8b5cf6)',
                            borderRadius: '20px',
                            boxShadow: '0 10px 25px rgba(139, 92, 246, 0.4), 0 0 15px rgba(139, 92, 246, 0.2)',
                            marginBottom: '15px'
                        }}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="1" y="3" width="15" height="13" rx="2" ry="2"></rect>
                                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                                <circle cx="5.5" cy="18.5" r="2.5"></circle>
                                <circle cx="18.5" cy="18.5" r="2.5"></circle>
                            </svg>
                        </div>
                        <h2 style={{
                            fontSize: '1.8rem',
                            fontWeight: '800',
                            background: 'linear-gradient(to right, #ffffff, #c084fc)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            margin: '0 0 8px 0',
                            letterSpacing: '-0.5px'
                        }}>
                            RIDER PORTAL
                        </h2>
                        <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
                            Verify Secure Cash on Delivery Orders
                        </p>
                    </div>

                    {message && (
                        <div style={{
                            background: 'rgba(16, 185, 129, 0.15)',
                            border: '1px solid rgba(16, 185, 129, 0.4)',
                            color: '#34d399',
                            padding: '14px',
                            borderRadius: '12px',
                            marginBottom: '25px',
                            textAlign: 'center',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            boxShadow: '0 4px 20px rgba(16, 185, 129, 0.1)',
                            animation: 'fadeIn 0.3s ease-out'
                        }}>
                            <span style={{ marginRight: '8px' }}>✓</span> {message}
                        </div>
                    )}

                    {error && (
                        <div style={{
                            background: 'rgba(239, 68, 68, 0.15)',
                            border: '1px solid rgba(239, 68, 68, 0.4)',
                            color: '#f87171',
                            padding: '14px',
                            borderRadius: '12px',
                            marginBottom: '25px',
                            textAlign: 'center',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            boxShadow: '0 4px 20px rgba(239, 68, 68, 0.1)',
                            animation: 'fadeIn 0.3s ease-out'
                        }}>
                            <span style={{ marginRight: '8px' }}>⚠</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleVerify}>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#cbd5e1', fontWeight: '600', fontSize: '0.85rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                                Order ID
                            </label>
                            <input
                                type="text"
                                value={orderId}
                                onChange={(e) => setOrderId(e.target.value)}
                                placeholder="Paste Order ID here"
                                required
                                style={{
                                    width: '100%',
                                    padding: '14px 16px',
                                    borderRadius: '12px',
                                    background: 'rgba(255, 255, 255, 0.04)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    color: 'white',
                                    fontSize: '0.95rem',
                                    outline: 'none',
                                    transition: 'all 0.3s',
                                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '30px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', color: '#cbd5e1', fontWeight: '600', fontSize: '0.85rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                                Secret Delivery Code
                            </label>
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder="e.g. 1234"
                                required
                                maxLength="4"
                                style={{
                                    width: '100%',
                                    padding: '14px 16px',
                                    borderRadius: '12px',
                                    background: 'rgba(255, 255, 255, 0.04)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    color: '#c084fc',
                                    fontSize: '1.4rem',
                                    fontWeight: 'bold',
                                    letterSpacing: '8px',
                                    textAlign: 'center',
                                    outline: 'none',
                                    transition: 'all 0.3s',
                                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
                                }}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '15px',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)',
                                border: 'none',
                                color: 'white',
                                fontWeight: '700',
                                fontSize: '1rem',
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                boxShadow: '0 8px 20px rgba(124, 58, 237, 0.3)'
                            }}
                        >
                            {loading ? "Verifying..." : "⚡ COMPLETE DELIVERY"}
                        </button>
                    </form>

                    <div style={{
                        marginTop: '35px',
                        paddingTop: '25px',
                        borderTop: '1px solid rgba(255,255,255,0.08)',
                        textAlign: 'center'
                    }}>
                        <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '15px' }}>Want to earn with us?</p>
                        <Link href="/agent/register" style={{
                            background: 'rgba(139, 92, 246, 0.12)',
                            color: '#c084fc',
                            border: '1px solid rgba(139, 92, 246, 0.3)',
                            borderRadius: '12px',
                            width: '100%',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textDecoration: 'none',
                            padding: '12px',
                            fontWeight: '600',
                            fontSize: '0.9rem',
                            transition: 'all 0.3s'
                        }}>
                            <span style={{ marginRight: '8px' }}>🏍</span> Join as Delivery Partner
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
