"use client";
import { useState } from 'react';
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import MotivationalVideo from "@/components/MotivationalVideo";

export default function HospitalRegister() {
    const { cartCount, toggleCart } = useCart();
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '', 
        email: '', 
        phone: '', 
        password: '', 
        address: '', 
        licenseNumber: '',
        bankDetails: {
            accountHolder: '',
            accountNumber: '',
            ifsc: '',
            upiId: ''
        }
    });
    
    const [agreements, setAgreements] = useState({
        terms: false,
        privacy: false,
        identity: false
    });
    const [loading, setLoading] = useState(false);

    const isFormValid = agreements.terms && agreements.privacy && agreements.identity &&
        formData.name && formData.email && formData.phone && 
        formData.password && formData.address && formData.licenseNumber &&
        (formData.bankDetails.upiId || (formData.bankDetails.accountNumber && formData.bankDetails.ifsc));

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: { ...prev[parent], [child]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/hospital/register', {
                method: 'POST',
                body: JSON.stringify(formData),
                headers: { 'Content-Type': 'application/json' }
            });

            const data = await res.json();
            setLoading(false);

            if (data.success) {
                alert("Hospital registration successful! Redirecting to login.");
                router.push('/login');
            } else {
                alert(data.error || "Registration failed");
            }
        } catch (error) {
            setLoading(false);
            alert("An error occurred. Please try again.");
        }
    };

    return (
        <>
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />
            <div className="container" style={{ marginTop: '100px', maxWidth: '800px' }}>
                
                <MotivationalVideo 
                    title="Empowering Hospitals, Saving Lives"
                    description="Partner with Swastik Medicare to streamline your patient intake, manage appointments efficiently, and ensure seamless lab and medicine fulfillment for your patients."
                    videoUrl="https://www.youtube.com/embed/90ce3aCwpnw" // Placeholder for Hospital video
                    ctaText="Join the Network"
                    ctaLink="#registration-form"
                />

                <div id="registration-form" style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', maxWidth: '600px', margin: '0 auto' }}>
                    <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#DC2626' }}>
                        <i className="fa-solid fa-hospital" style={{ marginRight: '10px' }}></i>
                        Hospital Self-Registration
                    </h2>
                    <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>Join India's most advanced healthcare network.</p>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div style={sectionStyle}>
                            <h3 style={sectionTitleStyle}>Basic Information</h3>
                            <input type="text" name="name" placeholder="Hospital Name" required onChange={handleChange} style={inputStyle} />
                            <input type="email" name="email" placeholder="Admin Email Address" required onChange={handleChange} style={inputStyle} />
                            <input type="tel" name="phone" placeholder="Official Contact Phone" required onChange={handleChange} style={inputStyle} />
                            <input type="password" name="password" placeholder="Create Admin Password" required onChange={handleChange} style={inputStyle} />
                            <textarea name="address" placeholder="Hospital Full Address" required onChange={handleChange} style={{ ...inputStyle, minHeight: '80px' }} />
                            <input type="text" name="licenseNumber" placeholder="Healthcare License Number / Registration ID" required onChange={handleChange} style={inputStyle} />
                        </div>

                        <div style={sectionStyle}>
                            <h3 style={sectionTitleStyle}>Automatic Payment Settlement (90% Payout)</h3>
                            <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '10px' }}>Choose your preferred method for automatic settlements.</p>
                            <input type="text" name="bankDetails.upiId" placeholder="UPI ID (VPA) for fast transfers" onChange={handleChange} style={inputStyle} />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <input type="text" name="bankDetails.accountNumber" placeholder="Bank Account Number" onChange={handleChange} style={inputStyle} />
                                <input type="text" name="bankDetails.ifsc" placeholder="Bank IFSC Code" onChange={handleChange} style={inputStyle} />
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px', padding: '15px', background: '#F9F9F9', borderRadius: '8px', border: '1px solid #eee' }}>
                            <label style={checkboxLabelStyle}>
                                <input type="checkbox" checked={agreements.terms} onChange={(e) => setAgreements(prev => ({ ...prev, terms: e.target.checked }))} />
                                <span>I agree to the <a href="/policy" target="_blank" style={{ color: '#DC2626', fontWeight: 'bold' }}>Hospital Partner Agreement</a></span>
                            </label>
                            <label style={checkboxLabelStyle}>
                                <input type="checkbox" checked={agreements.privacy} onChange={(e) => setAgreements(prev => ({ ...prev, privacy: e.target.checked }))} />
                                <span>I accept the Privacy Policy regarding data sharing.</span>
                            </label>
                            <label style={checkboxLabelStyle}>
                                <input type="checkbox" checked={agreements.identity} onChange={(e) => setAgreements(prev => ({ ...prev, identity: e.target.checked }))} />
                                <span>I confirm that all license details provided are valid and legal.</span>
                            </label>
                        </div>

                        <button type="submit" disabled={loading || !isFormValid} style={{
                            background: isFormValid ? '#DC2626' : '#ccc', color: 'white', padding: '12px', borderRadius: '8px', border: 'none', cursor: isFormValid ? 'pointer' : 'not-allowed', fontWeight: 'bold', fontSize: '1rem', marginTop: '10px'
                        }}>
                            {loading ? "Registering..." : "Partner with Swastik"}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: '20px' }}>
                        Already a partner? <a href="/login" style={{ color: '#DC2626', fontWeight: 'bold' }}>Login here</a>
                    </p>
                </div>
            </div>
        </>
    );
}

const inputStyle = {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '1rem',
    width: '100%'
};

const sectionStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '15px',
    border: '1px solid #eee',
    borderRadius: '8px'
};

const sectionTitleStyle = {
    fontSize: '1rem',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '5px'
};

const checkboxLabelStyle = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    fontSize: '0.9rem',
    color: '#333',
    cursor: 'pointer'
};
