"use client";
import { useState } from 'react';
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";

export default function AgentRegister() {
    const { cartCount, toggleCart } = useCart();
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', password: '', vehicleNumber: '', licenseNumber: '',
        licenseImageUrl: '', aadhaarImageUrl: ''
    });
    const [agreements, setAgreements] = useState({
        terms: false,
        age: false,
        identity: false
    });
    const [loading, setLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [verifyingOtp, setVerifyingOtp] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [phoneVerified, setPhoneVerified] = useState(false);

    const isFormValid = agreements.terms && agreements.age && agreements.identity &&
        formData.name && formData.email && formData.phone && phoneVerified &&
        formData.password && formData.vehicleNumber && formData.licenseNumber &&
        formData.licenseImageUrl && formData.aadhaarImageUrl;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (name === 'phone') setPhoneVerified(false); // Reset verification if phone changes
    };

    const handleSendOtp = async () => {
        if (!formData.phone) return alert("Please enter phone number first");
        setLoading(true);
        const res = await fetch('/api/auth/send-otp', {
            method: 'POST',
            body: JSON.stringify({ phone: formData.phone }),
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await res.json();
        setLoading(false);
        if (data.success) {
            setOtpSent(true);
            alert("OTP sent to your phone!");
        } else {
            alert(data.error || "Failed to send OTP");
        }
    };

    const handleVerifyOtp = async () => {
        setVerifyingOtp(true);
        const res = await fetch('/api/auth/verify-otp', {
            method: 'POST',
            body: JSON.stringify({ phone: formData.phone, code: otpCode }),
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await res.json();
        setVerifyingOtp(false);
        if (data.success) {
            setPhoneVerified(true);
            setOtpSent(false);
            alert("Phone verified successfully! ✅");
        } else {
            alert(data.error || "Invalid OTP");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const res = await fetch('/api/agent/register', {
            method: 'POST',
            body: JSON.stringify({ ...formData, phoneVerified }), // Pass phoneVerified status
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await res.json();
        setLoading(false);

        if (data.success) {
            alert("Registration successful! Please login.");
            router.push('/login');
        } else {
            alert(data.error || "Registration failed");
        }
    };

    return (
        <>
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />
            <div className="container" style={{ marginTop: '100px', maxWidth: '500px' }}>
                <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#1B5E20' }}>
                        <i className="fa-solid fa-motorcycle" style={{ marginRight: '10px' }}></i>
                        Register as Delivery Partner
                    </h2>
                    <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>Earn ₹50 per successful delivery directly to your wallet!</p>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <input type="text" name="name" placeholder="Full Name" required onChange={handleChange} style={inputStyle} />
                        <input type="email" name="email" placeholder="Email Address" required onChange={handleChange} style={inputStyle} />
                        <div style={{ position: 'relative' }}>
                            <input type="tel" name="phone" placeholder="Phone Number" required onChange={handleChange} style={{ ...inputStyle, width: '100%', paddingRight: '100px' }} />
                            {!phoneVerified && (
                                <button type="button" onClick={handleSendOtp} disabled={loading || !formData.phone} style={{
                                    position: 'absolute', right: '5px', top: '5px', bottom: '5px', background: '#1B5E20', color: 'white', border: 'none', borderRadius: '6px', padding: '0 10px', fontSize: '0.8rem', cursor: 'pointer'
                                }}>
                                    {otpSent ? "Resend" : "Verify"}
                                </button>
                            )}
                            {phoneVerified && <span style={{ position: 'absolute', right: '10px', top: '12px', color: '#1B5E20', fontWeight: 'bold' }}>Verified ✅</span>}
                        </div>

                        {otpSent && !phoneVerified && (
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input type="text" placeholder="Enter 6-digit OTP" maxLength="6" onChange={(e) => setOtpCode(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
                                <button type="button" onClick={handleVerifyOtp} disabled={verifyingOtp} style={{
                                    background: '#1B5E20', color: 'white', border: 'none', borderRadius: '8px', padding: '0 15px', fontWeight: 'bold', cursor: 'pointer'
                                }}>
                                    {verifyingOtp ? "..." : "Confirm"}
                                </button>
                            </div>
                        )}
                        <input type="password" name="password" placeholder="Create Password" required onChange={handleChange} style={inputStyle} />
                        <input type="text" name="vehicleNumber" placeholder="Vehicle Reg Number (e.g. DL-01-AB-1234)" required onChange={handleChange} style={inputStyle} />
                        <input type="text" name="licenseNumber" placeholder="Driving License Number" required onChange={handleChange} style={inputStyle} />

                        <div style={{ borderTop: '1px solid #eee', marginTop: '10px', paddingTop: '10px' }}>
                            <p style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#666', marginBottom: '10px' }}>Identity Verification Documents</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                    <label style={{ fontSize: '0.8rem', color: '#1B5E20' }}>Driving License Image URL</label>
                                    <input type="text" name="licenseImageUrl" placeholder="Paste License Image URL" required onChange={handleChange} style={inputStyle} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                    <label style={{ fontSize: '0.8rem', color: '#1B5E20' }}>Aadhaar Card Image URL</label>
                                    <input type="text" name="aadhaarImageUrl" placeholder="Paste Aadhaar Image URL" required onChange={handleChange} style={inputStyle} />
                                </div>
                                <small style={{ color: '#999', fontSize: '0.75rem' }}>* Identity documents are required for manual verification.</small>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px', padding: '15px', background: '#F9F9F9', borderRadius: '8px', border: '1px solid #eee' }}>
                            <label style={checkboxLabelStyle}>
                                <input type="checkbox" checked={agreements.terms} onChange={(e) => setAgreements(prev => ({ ...prev, terms: e.target.checked }))} />
                                <span>I agree to the <a href="/policy#partner-agreement" target="_blank" style={{ color: '#1B5E20', fontWeight: 'bold' }}>Partner Distribution Agreement</a></span>
                            </label>
                            <label style={checkboxLabelStyle}>
                                <input type="checkbox" checked={agreements.age} onChange={(e) => setAgreements(prev => ({ ...prev, age: e.target.checked }))} />
                                <span>I confirm I am at least 18 years of age.</span>
                            </label>
                            <label style={checkboxLabelStyle}>
                                <input type="checkbox" checked={agreements.identity} onChange={(e) => setAgreements(prev => ({ ...prev, identity: e.target.checked }))} />
                                <span>I acknowledge that I may need to verify my identity via a valid ID.</span>
                            </label>
                        </div>

                        <button type="submit" disabled={loading || !isFormValid} style={{
                            background: isFormValid ? '#1B5E20' : '#ccc', color: 'white', padding: '12px', borderRadius: '8px', border: 'none', cursor: isFormValid ? 'pointer' : 'not-allowed', fontWeight: 'bold', fontSize: '1rem', marginTop: '10px'
                        }}>
                            {loading ? "Registering..." : "Join Delivery Fleet"}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: '20px' }}>
                        Already a partner? <a href="/login" style={{ color: '#1B5E20', fontWeight: 'bold' }}>Login here</a>
                    </p>

                    <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #eee', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '10px' }}>Need help with registration? Contact Partner Support</p>
                        <a href="https://wa.me/917992122974" target="_blank" rel="noopener noreferrer" style={{ background: '#25D366', color: 'white', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                            <i className="fa-brands fa-whatsapp"></i> Chat on WhatsApp
                        </a>
                    </div>
                </div>
            </div>
        </>
    );
}

const inputStyle = {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '1rem'
};

const checkboxLabelStyle = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    fontSize: '0.9rem',
    color: '#333',
    cursor: 'pointer'
};
