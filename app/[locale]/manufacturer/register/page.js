"use client";
import { useState } from 'react';
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import MotivationalVideo from "@/components/MotivationalVideo";

export default function ManufacturerRegister() {
    const { cartCount, toggleCart } = useCart();
    const router = useRouter();
    const [formData, setFormData] = useState({
        companyName: '', 
        email: '', 
        phone: '', 
        password: '', 
        contactPerson: '',
        bankDetails: {
            accountHolder: '',
            accountNumber: '',
            ifsc: '',
            upiId: ''
        }
    });
    
    const [agreements, setAgreements] = useState({
        terms: false,
        supply: false,
        identity: false
    });
    const [loading, setLoading] = useState(false);

    const isFormValid = agreements.terms && agreements.supply && agreements.identity &&
        formData.companyName && formData.email && formData.phone && 
        formData.password && formData.contactPerson &&
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
            const res = await fetch('/api/manufacturer/register', {
                method: 'POST',
                body: JSON.stringify(formData),
                headers: { 'Content-Type': 'application/json' }
            });

            const data = await res.json();
            setLoading(false);

            if (data.success) {
                alert("Manufacturer registration successful! Redirecting to login.");
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
                    title="Scale Your Medicine Distribution"
                    description="Partner with Swastik Medicare to reach millions of patients and thousands of pharmacies. Manage your catalog, track stock levels, and enjoy automatic 90% payouts on every order fulfilled."
                    videoUrl="https://www.youtube.com/embed/kD56e6tao0o"
                    ctaText="Join the Supply Chain"
                    ctaLink="#registration-form"
                />

                <div id="registration-form" style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', maxWidth: '600px', margin: '0 auto' }}>
                    <h2 style={{ textAlign: 'center', marginBottom: '10px', color: '#1B5E20' }}>
                        <i className="fa-solid fa-industry" style={{ marginRight: '10px' }}></i>
                        Manufacturer & Distributor Portal
                    </h2>
                    <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px' }}>Direct integration with India's largest medical marketplace.</p>

                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '25px', gap: '10px' }}>
                        <a href="/ai-assistant" className="btn" style={{ background: '#3B82F6', color: 'white', textDecoration: 'none', padding: '8px 15px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <i className="fa-solid fa-robot"></i> AI Registration Help
                        </a>
                        <a href="https://wa.me/917992122974" target="_blank" className="btn" style={{ background: '#25D366', color: 'white', textDecoration: 'none', padding: '8px 15px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <i className="fa-brands fa-whatsapp"></i> Supplier Support
                        </a>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div style={sectionStyle}>
                            <h3 style={sectionTitleStyle}>Company & Contact Information</h3>
                            <input type="text" name="companyName" placeholder="Company Name (Manufacturer/Distributor)" required onChange={handleChange} style={inputStyle} />
                            <input type="text" name="contactPerson" placeholder="Contact Person Name" required onChange={handleChange} style={inputStyle} />
                            <input type="email" name="email" placeholder="Business Email Address" required onChange={handleChange} style={inputStyle} />
                            <input type="tel" name="phone" placeholder="Official Contact Phone" required onChange={handleChange} style={inputStyle} />
                            <input type="password" name="password" placeholder="Create Portal Password" required onChange={handleChange} style={inputStyle} />
                        </div>

                        <div style={sectionStyle}>
                            <h3 style={sectionTitleStyle}>Settlement Details (10% Comm. Deducted)</h3>
                            <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '10px' }}>Specify where your remaining 90% revenue should be settled.</p>
                            <input type="text" name="bankDetails.upiId" placeholder="Business UPI ID" onChange={handleChange} style={inputStyle} />
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <input type="text" name="bankDetails.accountNumber" placeholder="Bank Account Number" onChange={handleChange} style={inputStyle} />
                                <input type="text" name="bankDetails.ifsc" placeholder="Bank IFSC Code" onChange={handleChange} style={inputStyle} />
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px', padding: '15px', background: '#F9F9F9', borderRadius: '8px', border: '1px solid #eee' }}>
                            <label style={checkboxLabelStyle}>
                                <input type="checkbox" checked={agreements.terms} onChange={(e) => setAgreements(prev => ({ ...prev, terms: e.target.checked }))} />
                                <span>I agree to the <a href="/policy" target="_blank" style={{ color: '#1B5E20', fontWeight: 'bold' }}>Marketplace Supply Agreement</a></span>
                            </label>
                            <label style={checkboxLabelStyle}>
                                <input type="checkbox" checked={agreements.supply} onChange={(e) => setAgreements(prev => ({ ...prev, supply: e.target.checked }))} />
                                <span>I confirm that all supplied medicines are WHO-GMP certified/legal.</span>
                            </label>
                            <label style={checkboxLabelStyle}>
                                <input type="checkbox" checked={agreements.identity} onChange={(e) => setAgreements(prev => ({ ...prev, identity: e.target.checked }))} />
                                <span>I acknowledge that 10% platform commission is automatically deducted.</span>
                            </label>
                        </div>

                        <button type="submit" disabled={loading || !isFormValid} style={{
                            background: isFormValid ? '#1B5E20' : '#ccc', color: 'white', padding: '12px', borderRadius: '8px', border: 'none', cursor: isFormValid ? 'pointer' : 'not-allowed', fontWeight: 'bold', fontSize: '1rem', marginTop: '10px'
                        }}>
                            {loading ? "Registering..." : "Partner with Swastik"}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: '20px' }}>
                        Supplier Login? <a href="/login" style={{ color: '#1B5E20', fontWeight: 'bold' }}>Login here</a>
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
