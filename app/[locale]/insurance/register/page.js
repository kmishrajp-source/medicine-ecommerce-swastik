"use client";
import { useState } from 'react';
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import MotivationalVideo from "@/components/MotivationalVideo";

export default function InsuranceRegister() {
    const { cartCount, toggleCart } = useCart();
    const router = useRouter();
    const [formData, setFormData] = useState({
        companyName: '', 
        email: '', 
        phone: '', 
        password: '', 
        licenseNumber: '',
        handlingFee: 50,
        bankDetails: {
            accountHolder: '',
            accountNumber: '',
            ifsc: '',
            upiId: ''
        }
    });
    
    const [agreements, setAgreements] = useState({
        terms: false,
        compliance: false,
        identity: false
    });
    const [loading, setLoading] = useState(false);

    const isFormValid = agreements.terms && agreements.compliance && agreements.identity &&
        formData.companyName && formData.email && formData.phone && 
        formData.password && formData.licenseNumber &&
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
            const res = await fetch('/api/insurance/register', {
                method: 'POST',
                body: JSON.stringify(formData),
                headers: { 'Content-Type': 'application/json' }
            });

            const data = await res.json();
            setLoading(false);

            if (data.success) {
                alert("Insurance registration successful! Redirecting to login.");
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
                    title="Seamless Medical Claims"
                    description="Join Swastik Medicare's Insurance Network. Verify coverage in real-time, automate claim handling fees, and provide your policyholders with a faster, more transparent healthcare experience."
                    videoUrl="https://www.youtube.com/embed/5yiySDLhLyk"
                    ctaText="Become a Provider"
                    ctaLink="#registration-form"
                />

                <div id="registration-form" style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', maxWidth: '600px', margin: '0 auto' }}>
                    <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#1E40AF' }}>
                        <i className="fa-solid fa-file-shield" style={{ marginRight: '10px' }}></i>
                        Insurance Provider Onboarding
                    </h2>
                    <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>Connect with thousands of patients and hospitals instantly.</p>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div style={sectionStyle}>
                            <h3 style={sectionTitleStyle}>Company Details</h3>
                            <input type="text" name="companyName" placeholder="Insurance Company Name" required onChange={handleChange} style={inputStyle} />
                            <input type="email" name="email" placeholder="Corporate Admin Email" required onChange={handleChange} style={inputStyle} />
                            <input type="tel" name="phone" placeholder="Official Support Phone" required onChange={handleChange} style={inputStyle} />
                            <input type="password" name="password" placeholder="Create Admin Password" required onChange={handleChange} style={inputStyle} />
                            <input type="text" name="licenseNumber" placeholder="Insurance License Number / IRDAI ID" required onChange={handleChange} style={inputStyle} />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                <label style={{ fontSize: '0.8rem', color: '#1E40AF' }}>Standard Claim Handling Fee (₹)</label>
                                <input type="number" name="handlingFee" placeholder="Handling Fee per Claim (e.g. 50)" required onChange={handleChange} value={formData.handlingFee} style={inputStyle} />
                            </div>
                        </div>

                        <div style={sectionStyle}>
                            <h3 style={sectionTitleStyle}>Automatic Payout Settings</h3>
                            <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '10px' }}>Your share of the settlement will be auto-transferred here.</p>
                            <input type="text" name="bankDetails.upiId" placeholder="Corporate UPI ID" onChange={handleChange} style={inputStyle} />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <input type="text" name="bankDetails.accountNumber" placeholder="Bank Account Number" onChange={handleChange} style={inputStyle} />
                                <input type="text" name="bankDetails.ifsc" placeholder="Bank IFSC Code" onChange={handleChange} style={inputStyle} />
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px', padding: '15px', background: '#F9F9F9', borderRadius: '8px', border: '1px solid #eee' }}>
                            <label style={checkboxLabelStyle}>
                                <input type="checkbox" checked={agreements.terms} onChange={(e) => setAgreements(prev => ({ ...prev, terms: e.target.checked }))} />
                                <span>I agree to the <a href="/policy" target="_blank" style={{ color: '#1E40AF', fontWeight: 'bold' }}>Insurance Collaboration Agreement</a></span>
                            </label>
                            <label style={checkboxLabelStyle}>
                                <input type="checkbox" checked={agreements.compliance} onChange={(e) => setAgreements(prev => ({ ...prev, compliance: e.target.checked }))} />
                                <span>I confirm compliance with data privacy laws.</span>
                            </label>
                            <label style={checkboxLabelStyle}>
                                <input type="checkbox" checked={agreements.identity} onChange={(e) => setAgreements(prev => ({ ...prev, identity: e.target.checked }))} />
                                <span>I acknowledge that IRDAI license verification is mandatory.</span>
                            </label>
                        </div>

                        <button type="submit" disabled={loading || !isFormValid} style={{
                            background: isFormValid ? '#1E40AF' : '#ccc', color: 'white', padding: '12px', borderRadius: '8px', border: 'none', cursor: isFormValid ? 'pointer' : 'not-allowed', fontWeight: 'bold', fontSize: '1rem', marginTop: '10px'
                        }}>
                            {loading ? "Onboarding..." : "Register Provider"}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: '20px' }}>
                        Portal access? <a href="/login" style={{ color: '#1E40AF', fontWeight: 'bold' }}>Login here</a>
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
