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
    const [lookupLoading, setLookupLoading] = useState(false);
    const [orderInfo, setOrderInfo] = useState(null); // order details shown before completing

    // Step 1: Look up order details by Order ID
    const handleLookup = async () => {
        if (!orderId.trim()) return;
        setLookupLoading(true);
        setError("");
        setOrderInfo(null);
        try {
            const res = await fetch(`/api/order-lookup?orderId=${encodeURIComponent(orderId.trim())}`);
            const data = await res.json();
            if (data.success) {
                setOrderInfo(data.order);
            } else {
                setError(data.error || "Order not found");
            }
        } catch (err) {
            setError("Network error. Please try again.");
        } finally {
            setLookupLoading(false);
        }
    };

    // Step 2: Verify delivery with secret code
    const handleVerify = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/verify-delivery", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId: orderId.trim(), code }),
            });

            const data = await res.json();

            if (data.success) {
                setMessage(`✅ Delivery Confirmed! ₹${orderInfo?.total?.toFixed(2) || ''} collected.`);
                setOrderId("");
                setCode("");
                setOrderInfo(null);
            } else {
                setError(data.error || "Verification failed.");
            }
        } catch (err) {
            setError("Verification failed. Check network.");
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '14px 16px',
        borderRadius: '12px',
        background: 'rgba(255, 255, 255, 0.04)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        color: 'white',
        fontSize: '0.95rem',
        outline: 'none',
        transition: 'all 0.3s',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)',
        boxSizing: 'border-box'
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '8px',
        color: '#cbd5e1',
        fontWeight: '600',
        fontSize: '0.85rem',
        letterSpacing: '0.5px',
        textTransform: 'uppercase'
    };

    return (
        <>
            <Navbar cartCount={0} openCart={() => { }} />
            <div style={{
                minHeight: '100vh',
                background: 'radial-gradient(circle at top right, #1e1b4b, #0f0728, #070314)',
                padding: '120px 20px 60px',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center',
                fontFamily: "'Inter', sans-serif"
            }}>
                <div style={{
                    width: '100%',
                    maxWidth: '500px',
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
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            width: '70px', height: '70px',
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
                            fontSize: '1.8rem', fontWeight: '800',
                            background: 'linear-gradient(to right, #ffffff, #c084fc)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                            margin: '0 0 8px 0', letterSpacing: '-0.5px'
                        }}>
                            RIDER PORTAL
                        </h2>
                        <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
                            Cash on Delivery — Verify &amp; Collect
                        </p>
                    </div>

                    {message && (
                        <div style={{
                            background: 'rgba(16, 185, 129, 0.15)',
                            border: '1px solid rgba(16, 185, 129, 0.4)',
                            color: '#34d399', padding: '16px', borderRadius: '12px',
                            marginBottom: '25px', textAlign: 'center',
                            fontSize: '1rem', fontWeight: '700',
                            boxShadow: '0 4px 20px rgba(16, 185, 129, 0.1)'
                        }}>
                            {message}
                        </div>
                    )}

                    {error && (
                        <div style={{
                            background: 'rgba(239, 68, 68, 0.15)',
                            border: '1px solid rgba(239, 68, 68, 0.4)',
                            color: '#f87171', padding: '14px', borderRadius: '12px',
                            marginBottom: '25px', textAlign: 'center',
                            fontSize: '0.9rem', fontWeight: '600',
                        }}>
                            <span style={{ marginRight: '8px' }}>⚠</span> {error}
                        </div>
                    )}

                    {/* ── STEP 1: Order Lookup ── */}
                    <div style={{ marginBottom: '20px' }}>
                        <label style={labelStyle}>Order ID</label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input
                                type="text"
                                value={orderId}
                                onChange={(e) => { setOrderId(e.target.value); setOrderInfo(null); setError(''); }}
                                placeholder="Paste Order ID here"
                                style={{ ...inputStyle, flex: 1 }}
                            />
                            <button
                                type="button"
                                onClick={handleLookup}
                                disabled={lookupLoading || !orderId.trim()}
                                style={{
                                    padding: '14px 18px', borderRadius: '12px',
                                    background: 'rgba(139, 92, 246, 0.3)',
                                    border: '1px solid rgba(139, 92, 246, 0.5)',
                                    color: '#c084fc', fontWeight: '700', fontSize: '0.85rem',
                                    cursor: 'pointer', whiteSpace: 'nowrap'
                                }}
                            >
                                {lookupLoading ? '...' : '🔍 Look Up'}
                            </button>
                        </div>
                    </div>

                    {/* ── ORDER DETAILS CARD (shown after lookup) ── */}
                    {orderInfo && (
                        <div style={{
                            background: 'rgba(16, 185, 129, 0.07)',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            borderRadius: '16px', padding: '20px', marginBottom: '24px'
                        }}>
                            {/* Amount to Collect — BIG and prominent */}
                            <div style={{
                                textAlign: 'center', padding: '16px 0 12px',
                                borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '14px'
                            }}>
                                <div style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '6px' }}>
                                    💰 COLLECT FROM CUSTOMER
                                </div>
                                <div style={{
                                    fontSize: '2.6rem', fontWeight: '900', letterSpacing: '-1px',
                                    background: 'linear-gradient(135deg, #34d399, #10b981)',
                                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                                }}>
                                    ₹{orderInfo.total?.toFixed(2)}
                                </div>
                                {orderInfo.paymentMethod === 'COD' ? (
                                    <span style={{ fontSize: '0.78rem', background: 'rgba(251,191,36,0.2)', color: '#fbbf24', padding: '3px 10px', borderRadius: '20px', fontWeight: '700' }}>
                                        CASH ON DELIVERY
                                    </span>
                                ) : (
                                    <span style={{ fontSize: '0.78rem', background: 'rgba(16,185,129,0.2)', color: '#34d399', padding: '3px 10px', borderRadius: '20px', fontWeight: '700' }}>
                                        ALREADY PAID ONLINE
                                    </span>
                                )}
                            </div>

                            {/* Customer Details */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem' }}>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <span style={{ color: '#94a3b8', minWidth: '70px' }}>👤 Name:</span>
                                    <span style={{ color: '#e2e8f0', fontWeight: '600' }}>{orderInfo.customerName}</span>
                                </div>
                                {orderInfo.customerPhone && (
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <span style={{ color: '#94a3b8', minWidth: '70px' }}>📞 Phone:</span>
                                        <a href={`tel:${orderInfo.customerPhone}`} style={{ color: '#a78bfa', fontWeight: '600', textDecoration: 'none' }}>
                                            {orderInfo.customerPhone}
                                        </a>
                                    </div>
                                )}
                                {orderInfo.address && (
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <span style={{ color: '#94a3b8', minWidth: '70px' }}>📍 Addr:</span>
                                        <span style={{ color: '#cbd5e1', fontSize: '0.83rem' }}>{orderInfo.address}</span>
                                    </div>
                                )}
                                {orderInfo.deliveryFee > 0 && (
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <span style={{ color: '#94a3b8', minWidth: '70px' }}>🚚 Del:</span>
                                        <span style={{ color: '#fbbf24', fontWeight: '600' }}>₹{orderInfo.deliveryFee?.toFixed(2)}</span>
                                    </div>
                                )}
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <span style={{ color: '#94a3b8', minWidth: '70px' }}>📦 Items:</span>
                                    <span style={{ color: '#e2e8f0' }}>{orderInfo.itemCount} item{orderInfo.itemCount !== 1 ? 's' : ''}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── STEP 2: Secret Code + Confirm (only visible after lookup) ── */}
                    {orderInfo && (
                        <form onSubmit={handleVerify}>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={labelStyle}>Secret Delivery Code (from customer)</label>
                                <input
                                    type="text"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    placeholder="e.g. 1234"
                                    required
                                    maxLength="4"
                                    style={{
                                        ...inputStyle,
                                        color: '#c084fc', fontSize: '1.6rem',
                                        fontWeight: 'bold', letterSpacing: '12px',
                                        textAlign: 'center'
                                    }}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    width: '100%', padding: '16px', borderRadius: '12px',
                                    background: 'linear-gradient(135deg, #34d399 0%, #059669 100%)',
                                    border: 'none', color: 'white', fontWeight: '800',
                                    fontSize: '1.05rem', cursor: 'pointer',
                                    boxShadow: '0 8px 20px rgba(52, 211, 153, 0.3)',
                                    transition: 'all 0.3s'
                                }}
                            >
                                {loading ? 'Verifying...' : `✅ CONFIRM COLLECTION — ₹${orderInfo.total?.toFixed(2)}`}
                            </button>
                        </form>
                    )}

                    <div style={{
                        marginTop: '35px', paddingTop: '25px',
                        borderTop: '1px solid rgba(255,255,255,0.08)',
                        textAlign: 'center'
                    }}>
                        <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '15px' }}>Want to earn with us?</p>
                        <Link href="/agent/register" style={{
                            background: 'rgba(139, 92, 246, 0.12)', color: '#c084fc',
                            border: '1px solid rgba(139, 92, 246, 0.3)', borderRadius: '12px',
                            width: '100%', display: 'inline-flex', alignItems: 'center',
                            justifyContent: 'center', textDecoration: 'none',
                            padding: '12px', fontWeight: '600', fontSize: '0.9rem', transition: 'all 0.3s'
                        }}>
                            <span style={{ marginRight: '8px' }}>🏍</span> Join as Delivery Partner
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
