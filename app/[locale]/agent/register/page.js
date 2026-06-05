"use client";
import { useState } from 'react';
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";

export default function AgentRegister() {
    const { cartCount, toggleCart } = useCart();
    const router = useRouter();

    const [step, setStep] = useState(1); // 1=personal, 2=vehicle, 3=verify
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', password: '', confirmPassword: '',
        vehicleNumber: '', licenseNumber: '',
    });
    const [agreements, setAgreements] = useState({
        terms: false, age: false, identity: false
    });
    const [loading, setLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [verifyingOtp, setVerifyingOtp] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [phoneVerified, setPhoneVerified] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (name === 'phone') setPhoneVerified(false);
        setError('');
    };

    const handleSendOtp = async () => {
        if (!formData.phone || formData.phone.replace(/\D/g, '').length < 10) {
            return setError("Please enter a valid 10-digit phone number");
        }
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/auth/send-otp', {
                method: 'POST',
                body: JSON.stringify({ phone: formData.phone }),
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await res.json();
            if (data.success) {
                setOtpSent(true);
            } else {
                setError(data.error || "Failed to send OTP. Try again.");
            }
        } catch (e) {
            setError("Network error. Please check your connection.");
        }
        setLoading(false);
    };

    const handleVerifyOtp = async () => {
        if (!otpCode || otpCode.length < 6) return setError("Please enter the 6-digit OTP");
        setVerifyingOtp(true);
        setError('');
        try {
            const res = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                body: JSON.stringify({ phone: formData.phone, code: otpCode }),
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await res.json();
            if (data.success) {
                setPhoneVerified(true);
                setOtpSent(false);
                setError('');
            } else {
                setError(data.error || "Invalid OTP. Please try again.");
            }
        } catch (e) {
            setError("Network error. Please try again.");
        }
        setVerifyingOtp(false);
    };

    const validateStep1 = () => {
        if (!formData.name.trim()) return "Please enter your full name";
        if (!formData.email.trim() || !formData.email.includes('@')) return "Please enter a valid email";
        if (!formData.phone.replace(/\D/g, '') || formData.phone.replace(/\D/g, '').length < 10) return "Please enter a valid 10-digit phone number";
        if (!phoneVerified) return "Please verify your phone number with OTP";
        if (!formData.password || formData.password.length < 6) return "Password must be at least 6 characters";
        if (formData.password !== formData.confirmPassword) return "Passwords do not match";
        return null;
    };

    const validateStep2 = () => {
        if (!formData.vehicleNumber.trim()) return "Please enter your vehicle registration number";
        if (!formData.licenseNumber.trim()) return "Please enter your driving license number";
        return null;
    };

    const goToStep2 = () => {
        const err = validateStep1();
        if (err) return setError(err);
        setError('');
        setStep(2);
    };

    const goToStep3 = () => {
        const err = validateStep2();
        if (err) return setError(err);
        setError('');
        setStep(3);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!agreements.terms || !agreements.age || !agreements.identity) {
            return setError("Please accept all agreements to proceed");
        }
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/agent/register', {
                method: 'POST',
                body: JSON.stringify({ ...formData, phoneVerified }),
                headers: { 'Content-Type': 'application/json' }
            });

            const data = await res.json();
            setLoading(false);

            if (data.success) {
                setSuccess(true);
            } else {
                setError(data.error || "Registration failed. Please try again.");
            }
        } catch (e) {
            setLoading(false);
            setError("Network error. Please check your connection and try again.");
        }
    };

    if (success) {
        return (
            <>
                <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />
                <div style={{
                    minHeight: '100vh',
                    background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
                    fontFamily: "'Inter', 'Segoe UI', sans-serif"
                }}>
                    <div style={{
                        background: '#fff', borderRadius: '24px', padding: '50px 40px',
                        boxShadow: '0 20px 60px rgba(27,94,32,0.15)', textAlign: 'center', maxWidth: '480px', width: '100%'
                    }}>
                        <div style={{ fontSize: '64px', marginBottom: '20px' }}>🎉</div>
                        <h2 style={{ color: '#1B5E20', fontSize: '1.75rem', fontWeight: '800', marginBottom: '12px' }}>
                            Registration Successful!
                        </h2>
                        <p style={{ color: '#555', lineHeight: 1.6, marginBottom: '24px' }}>
                            Welcome to Swastik Medicare Delivery Fleet! Your application is under review.
                            Our team will verify your documents and contact you within <strong>24-48 hours</strong>.
                        </p>
                        <div style={{
                            background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '12px',
                            padding: '16px', marginBottom: '24px', textAlign: 'left'
                        }}>
                            <p style={{ margin: 0, color: '#166534', fontSize: '0.9rem' }}>
                                📱 <strong>What's next?</strong><br/>
                                • Our team will call you to verify your details<br/>
                                • Once approved, you can start accepting deliveries<br/>
                                • Earn ₹50 per delivery directly to your wallet
                            </p>
                        </div>
                        <a href="/login" style={{
                            display: 'inline-block', background: 'linear-gradient(135deg, #1B5E20, #2E7D32)',
                            color: 'white', padding: '14px 32px', borderRadius: '12px', textDecoration: 'none',
                            fontWeight: '700', fontSize: '1rem'
                        }}>
                            Login to Your Account →
                        </a>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />
            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #bbf7d0 100%)',
                paddingTop: '90px', paddingBottom: '40px',
                fontFamily: "'Inter', 'Segoe UI', sans-serif"
            }}>
                <div style={{ maxWidth: '540px', margin: '0 auto', padding: '0 20px' }}>

                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <div style={{
                            width: '72px', height: '72px', background: 'linear-gradient(135deg, #1B5E20, #4CAF50)',
                            borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '36px', margin: '0 auto 16px', boxShadow: '0 8px 25px rgba(27,94,32,0.3)'
                        }}>🏍️</div>
                        <h1 style={{ color: '#1B5E20', fontSize: '1.75rem', fontWeight: '800', margin: 0 }}>
                            Join Delivery Fleet
                        </h1>
                        <p style={{ color: '#4a7c59', marginTop: '8px', fontSize: '0.95rem' }}>
                            Earn ₹50 per delivery • Flexible hours • Instant wallet payouts
                        </p>
                    </div>

                    {/* Step Indicator */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '28px', gap: '0' }}>
                        {[1,2,3].map((s, i) => (
                            <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
                                <div style={{
                                    width: '36px', height: '36px', borderRadius: '50%',
                                    background: step >= s ? 'linear-gradient(135deg, #1B5E20, #4CAF50)' : '#e2e8f0',
                                    color: step >= s ? 'white' : '#94a3b8',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: '700', fontSize: '0.9rem',
                                    boxShadow: step >= s ? '0 4px 12px rgba(27,94,32,0.3)' : 'none',
                                    transition: 'all 0.3s ease'
                                }}>{step > s ? '✓' : s}</div>
                                {i < 2 && (
                                    <div style={{
                                        width: '60px', height: '3px',
                                        background: step > s ? 'linear-gradient(90deg, #1B5E20, #4CAF50)' : '#e2e8f0',
                                        transition: 'all 0.3s ease'
                                    }}/>
                                )}
                            </div>
                        ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', padding: '0 4px' }}>
                        {['Personal Info', 'Vehicle Details', 'Agreement'].map((label, i) => (
                            <span key={i} style={{
                                fontSize: '0.75rem', fontWeight: '600',
                                color: step === i+1 ? '#1B5E20' : '#94a3b8',
                                flex: 1, textAlign: 'center'
                            }}>{label}</span>
                        ))}
                    </div>

                    {/* Form Card */}
                    <div style={{
                        background: '#fff', borderRadius: '20px', padding: '32px',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.08)', border: '1px solid rgba(27,94,32,0.1)'
                    }}>

                        {/* Error Message */}
                        {error && (
                            <div style={{
                                background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '10px',
                                padding: '12px 16px', marginBottom: '20px', color: '#dc2626',
                                fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '8px'
                            }}>
                                ⚠️ {error}
                            </div>
                        )}

                        {/* ── STEP 1: Personal Info ── */}
                        {step === 1 && (
                            <div>
                                <h3 style={{ color: '#1B5E20', marginBottom: '20px', fontWeight: '700' }}>
                                    📋 Personal Information
                                </h3>

                                <label style={labelStyle}>Full Name</label>
                                <input name="name" type="text" placeholder="Rahul Kumar" value={formData.name}
                                    onChange={handleChange} style={inputStyle} />

                                <label style={labelStyle}>Email Address</label>
                                <input name="email" type="email" placeholder="rahul@example.com" value={formData.email}
                                    onChange={handleChange} style={inputStyle} />

                                <label style={labelStyle}>Phone Number</label>
                                <div style={{ position: 'relative', marginBottom: '16px' }}>
                                    <input name="phone" type="tel" placeholder="10-digit mobile number"
                                        value={formData.phone} onChange={handleChange}
                                        style={{ ...inputStyle, marginBottom: 0, paddingRight: '110px' }} />
                                    {!phoneVerified ? (
                                        <button type="button" onClick={handleSendOtp}
                                            disabled={loading || !formData.phone}
                                            style={{
                                                position: 'absolute', right: '6px', top: '50%', transform: 'translateY(-50%)',
                                                background: '#1B5E20', color: 'white', border: 'none', borderRadius: '8px',
                                                padding: '8px 12px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: '600'
                                            }}>
                                            {loading ? '...' : otpSent ? 'Resend OTP' : 'Send OTP'}
                                        </button>
                                    ) : (
                                        <span style={{
                                            position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                                            color: '#16a34a', fontWeight: '700', fontSize: '0.85rem'
                                        }}>✅ Verified</span>
                                    )}
                                </div>

                                {otpSent && !phoneVerified && (
                                    <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                                        <input type="text" placeholder="Enter 6-digit OTP" maxLength="6"
                                            value={otpCode} onChange={(e) => setOtpCode(e.target.value)}
                                            style={{ ...inputStyle, flex: 1, marginBottom: 0 }} />
                                        <button type="button" onClick={handleVerifyOtp} disabled={verifyingOtp}
                                            style={{
                                                background: '#1B5E20', color: 'white', border: 'none', borderRadius: '10px',
                                                padding: '0 18px', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap'
                                            }}>
                                            {verifyingOtp ? '...' : 'Verify'}
                                        </button>
                                    </div>
                                )}

                                <label style={labelStyle}>Create Password</label>
                                <input name="password" type="password" placeholder="Minimum 6 characters"
                                    value={formData.password} onChange={handleChange} style={inputStyle} />

                                <label style={labelStyle}>Confirm Password</label>
                                <input name="confirmPassword" type="password" placeholder="Re-enter your password"
                                    value={formData.confirmPassword} onChange={handleChange} style={inputStyle} />

                                <button type="button" onClick={goToStep2} style={primaryBtnStyle}>
                                    Continue to Vehicle Details →
                                </button>
                            </div>
                        )}

                        {/* ── STEP 2: Vehicle Details ── */}
                        {step === 2 && (
                            <div>
                                <h3 style={{ color: '#1B5E20', marginBottom: '20px', fontWeight: '700' }}>
                                    🏍️ Vehicle & License Details
                                </h3>

                                <label style={labelStyle}>Vehicle Registration Number</label>
                                <input name="vehicleNumber" type="text" placeholder="e.g. UP53AB1234"
                                    value={formData.vehicleNumber} onChange={handleChange} style={inputStyle} />

                                <label style={labelStyle}>Driving License Number</label>
                                <input name="licenseNumber" type="text" placeholder="e.g. UP1320220012345"
                                    value={formData.licenseNumber} onChange={handleChange} style={inputStyle} />

                                <div style={{
                                    background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '12px',
                                    padding: '16px', marginBottom: '20px'
                                }}>
                                    <p style={{ margin: 0, color: '#166534', fontSize: '0.875rem', lineHeight: 1.6 }}>
                                        📄 <strong>Document Verification:</strong><br />
                                        Our team will contact you to collect copies of your Driving License and Aadhaar Card during onboarding.
                                    </p>
                                </div>

                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button type="button" onClick={() => { setStep(1); setError(''); }}
                                        style={{ ...primaryBtnStyle, flex: 1, background: '#f1f5f9', color: '#475569' }}>
                                        ← Back
                                    </button>
                                    <button type="button" onClick={goToStep3} style={{ ...primaryBtnStyle, flex: 2 }}>
                                        Continue →
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ── STEP 3: Agreement & Submit ── */}
                        {step === 3 && (
                            <form onSubmit={handleSubmit}>
                                <h3 style={{ color: '#1B5E20', marginBottom: '20px', fontWeight: '700' }}>
                                    📜 Terms & Agreement
                                </h3>

                                {/* Summary Card */}
                                <div style={{
                                    background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px',
                                    padding: '16px', marginBottom: '20px'
                                }}>
                                    <p style={{ margin: '0 0 8px', fontWeight: '700', color: '#1e293b', fontSize: '0.9rem' }}>
                                        📋 Registration Summary
                                    </p>
                                    <p style={{ margin: '4px 0', color: '#475569', fontSize: '0.85rem' }}>👤 {formData.name}</p>
                                    <p style={{ margin: '4px 0', color: '#475569', fontSize: '0.85rem' }}>📧 {formData.email}</p>
                                    <p style={{ margin: '4px 0', color: '#475569', fontSize: '0.85rem' }}>📱 {formData.phone} {phoneVerified ? '✅' : ''}</p>
                                    <p style={{ margin: '4px 0', color: '#475569', fontSize: '0.85rem' }}>🏍️ {formData.vehicleNumber}</p>
                                    <p style={{ margin: '4px 0', color: '#475569', fontSize: '0.85rem' }}>📄 License: {formData.licenseNumber}</p>
                                </div>

                                <div style={{
                                    background: '#f8fafc', borderRadius: '12px', padding: '16px',
                                    display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px'
                                }}>
                                    {[
                                        { key: 'terms', text: 'I agree to the Partner Distribution Agreement and Terms of Service' },
                                        { key: 'age', text: 'I confirm I am at least 18 years of age' },
                                        { key: 'identity', text: 'I acknowledge that identity verification may be required before activation' },
                                    ].map(({ key, text }) => (
                                        <label key={key} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
                                            <input type="checkbox" checked={agreements[key]}
                                                onChange={e => setAgreements(prev => ({ ...prev, [key]: e.target.checked }))}
                                                style={{ marginTop: '3px', accentColor: '#1B5E20', width: '16px', height: '16px' }} />
                                            <span style={{ fontSize: '0.875rem', color: '#374151', lineHeight: 1.5 }}>{text}</span>
                                        </label>
                                    ))}
                                </div>

                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button type="button" onClick={() => { setStep(2); setError(''); }}
                                        style={{ ...primaryBtnStyle, flex: 1, background: '#f1f5f9', color: '#475569' }}>
                                        ← Back
                                    </button>
                                    <button type="submit"
                                        disabled={loading || !agreements.terms || !agreements.age || !agreements.identity}
                                        style={{
                                            ...primaryBtnStyle, flex: 2,
                                            background: (agreements.terms && agreements.age && agreements.identity)
                                                ? 'linear-gradient(135deg, #1B5E20, #4CAF50)'
                                                : '#cbd5e1',
                                            cursor: (agreements.terms && agreements.age && agreements.identity) ? 'pointer' : 'not-allowed',
                                            opacity: loading ? 0.8 : 1
                                        }}>
                                        {loading ? '⏳ Registering...' : '🚀 Submit Application'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* Bottom Links */}
                    <div style={{ textAlign: 'center', marginTop: '24px' }}>
                        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                            Already a partner?{' '}
                            <a href="/login" style={{ color: '#1B5E20', fontWeight: '700', textDecoration: 'none' }}>
                                Login here →
                            </a>
                        </p>
                        <a href="https://wa.me/917992122974" target="_blank" rel="noopener noreferrer"
                            style={{
                                display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '12px',
                                background: '#25D366', color: 'white', padding: '10px 20px', borderRadius: '10px',
                                textDecoration: 'none', fontWeight: '600', fontSize: '0.9rem'
                            }}>
                            💬 Need help? Chat on WhatsApp
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
}

const labelStyle = {
    display: 'block', marginBottom: '6px',
    fontSize: '0.85rem', fontWeight: '600', color: '#374151', letterSpacing: '0.3px'
};

const inputStyle = {
    width: '100%', padding: '13px 14px', borderRadius: '10px',
    border: '1px solid #d1d5db', fontSize: '0.95rem',
    outline: 'none', marginBottom: '16px', boxSizing: 'border-box',
    transition: 'border-color 0.2s', color: '#1e293b', background: '#fafafa'
};

const primaryBtnStyle = {
    width: '100%', padding: '14px', borderRadius: '12px',
    fontWeight: '700', fontSize: '1rem', border: 'none', cursor: 'pointer',
    background: 'linear-gradient(135deg, #1B5E20, #4CAF50)', color: 'white',
    transition: 'all 0.2s', boxShadow: '0 4px 15px rgba(27,94,32,0.3)',
    letterSpacing: '0.3px'
};
