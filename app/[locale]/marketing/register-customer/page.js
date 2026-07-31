"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";

export default function MarketingRegisterCustomer() {
    const [phone, setPhone] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/marketing/register-customer", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone, name, email })
            });

            const data = await res.json();
            
            if (data.success) {
                setMessage(data.message);
                setPhone("");
                setName("");
                setEmail("");
            } else {
                setError(data.error || "Failed to register customer.");
            }
        } catch (err) {
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar cartCount={0} openCart={() => {}} />
            <div style={{
                minHeight: '100vh',
                background: '#f8fafc',
                padding: '120px 20px 60px',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center',
                fontFamily: "'Inter', sans-serif"
            }}>
                <div style={{
                    width: '100%',
                    maxWidth: '480px',
                    background: 'white',
                    borderRadius: '20px',
                    padding: '40px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.08)'
                }}>
                    <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>
                            Register Customer
                        </h2>
                        <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
                            Quickly onboard new customers and automatically send them the benefits of Swastik Medicare.
                        </p>
                    </div>

                    {message && (
                        <div style={{
                            background: '#dcfce7', color: '#166534',
                            padding: '16px', borderRadius: '12px', marginBottom: '25px',
                            fontWeight: '600', textAlign: 'center', border: '1px solid #bbf7d0'
                        }}>
                            {message}
                        </div>
                    )}

                    {error && (
                        <div style={{
                            background: '#fee2e2', color: '#991b1b',
                            padding: '16px', borderRadius: '12px', marginBottom: '25px',
                            fontWeight: '600', textAlign: 'center', border: '1px solid #fecaca'
                        }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '0.9rem' }}>
                                Mobile Number <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <div style={{ display: 'flex' }}>
                                <span style={{
                                    display: 'flex', alignItems: 'center', padding: '0 15px',
                                    background: '#f1f5f9', border: '1px solid #cbd5e1',
                                    borderRight: 'none', borderRadius: '12px 0 0 12px',
                                    color: '#64748b', fontWeight: '600'
                                }}>+91</span>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="Enter 10-digit number"
                                    required
                                    maxLength={10}
                                    style={{
                                        flex: 1, padding: '14px 16px',
                                        border: '1px solid #cbd5e1', borderRadius: '0 12px 12px 0',
                                        outline: 'none', fontSize: '1rem', color: '#1e293b'
                                    }}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '0.9rem' }}>
                                Full Name <span style={{ color: '#94a3b8', fontWeight: '400', fontSize: '0.8rem' }}>(Optional)</span>
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Rahul Sharma"
                                style={{
                                    width: '100%', padding: '14px 16px',
                                    border: '1px solid #cbd5e1', borderRadius: '12px',
                                    outline: 'none', fontSize: '1rem', color: '#1e293b', boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#475569', fontSize: '0.9rem' }}>
                                Email Address <span style={{ color: '#94a3b8', fontWeight: '400', fontSize: '0.8rem' }}>(Optional)</span>
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="e.g. rahul@example.com"
                                style={{
                                    width: '100%', padding: '14px 16px',
                                    border: '1px solid #cbd5e1', borderRadius: '12px',
                                    outline: 'none', fontSize: '1rem', color: '#1e293b', boxSizing: 'border-box'
                                }}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%', padding: '16px', borderRadius: '12px',
                                background: '#2563eb', color: 'white', border: 'none',
                                fontWeight: '700', fontSize: '1.05rem', marginTop: '10px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s',
                                opacity: loading ? 0.7 : 1
                            }}
                        >
                            {loading ? 'Processing...' : 'Register & Send SMS'}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}
