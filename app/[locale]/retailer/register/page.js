"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import Navbar from "@/components/Navbar";
import MotivationalVideo from "@/components/MotivationalVideo";

export default function RetailerRegister() {
    const t = useTranslations('RetailerRegistration');
    const router = useRouter();
    const searchParams = useSearchParams();
    const [formData, setFormData] = useState({
        shopName: "",
        email: "",
        password: "",
        phone: "",
        address: "",
        licenseNumber: "",
        referralCode: "",
        agreedToTerms: false
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const ref = searchParams.get('ref') || searchParams.get('referral');
        if (ref) {
            setFormData(prev => ({ ...prev, referralCode: ref }));
        }
    }, [searchParams]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (!formData.agreedToTerms) {
                alert("Please agree to the legal terms to register.");
                setLoading(false);
                return;
            }
            const res = await fetch("/api/retailer/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.success) {
                alert("Registration Successful! Please login.");
                router.push("/retailer/login");
            } else {
                alert("Error: " + data.error);
            }
        } catch (err) {
            alert("Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar cartCount={0} />
            <div className="container" style={{ marginTop: "100px", maxWidth: "800px", paddingBottom: '60px' }}>
                
                <MotivationalVideo 
                    title="Grow Your Pharmacy Business"
                    description="Partner with Swastik Medicare to digitize your pharmacy, reach thousands of local customers, and manage your inventory with state-of-the-art tools."
                    videoUrl="https://www.youtube.com/embed/eWORGelQMBM" // User provided retailer video
                    ctaText="Start Registration"
                    ctaLink="#registration-form"
                />

                <div style={{ background: '#ecfdf5', border: '1px solid #10b981', padding: '20px', borderRadius: '12px', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ fontSize: '2rem', color: '#059669' }}><i className="fa-solid fa-network-wired"></i></div>
                    <p style={{ margin: 0, color: '#065f46', fontWeight: 600, fontSize: '0.95rem' }}>{t('network_prompt')}</p>
                </div>

                <div id="registration-form" style={{ background: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #f0f0f0', maxWidth: '600px', margin: '0 auto' }}>
                    <h2 style={{ textAlign: "center", marginBottom: "30px", color: '#059669', fontWeight: 800 }}>Join as Pharmacy Partner</h2>
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, fontSize: '0.85rem', color: '#4b5563', textTransform: 'uppercase' }}>Shop Identity</label>
                        <input type="text" placeholder="Shop / Pharmacy Name" required
                            onChange={e => setFormData({ ...formData, shopName: e.target.value })}
                            style={{ padding: "12px", borderRadius: "8px", border: "1px solid #e5e7eb", width: '100%', fontSize: '1rem' }} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, fontSize: '0.85rem', color: '#4b5563', textTransform: 'uppercase' }}>Business Email</label>
                            <input type="email" placeholder="Email Address" required
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                style={{ padding: "12px", borderRadius: "8px", border: "1px solid #e5e7eb", width: '100%', fontSize: '1rem' }} />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, fontSize: '0.85rem', color: '#4b5563', textTransform: 'uppercase' }}>Contact Phone</label>
                            <input type="text" placeholder="Phone Number" required
                                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                style={{ padding: "12px", borderRadius: "8px", border: "1px solid #e5e7eb", width: '100%', fontSize: '1rem' }} />
                        </div>
                    </div>

                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, fontSize: '0.85rem', color: '#4b5563', textTransform: 'uppercase' }}>Secure Password</label>
                        <input type="password" placeholder="Choose a secure password" required
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            style={{ padding: "12px", borderRadius: "8px", border: "1px solid #e5e7eb", width: '100%', fontSize: '1rem' }} />
                    </div>

                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, fontSize: '0.85rem', color: '#4b5563', textTransform: 'uppercase' }}>Location Details</label>
                        <input type="text" placeholder="Complete Pharmacy Address" required
                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                            style={{ padding: "12px", borderRadius: "8px", border: "1px solid #e5e7eb", width: '100%', fontSize: '1rem' }} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, fontSize: '0.85rem', color: '#4b5563', textTransform: 'uppercase' }}>Drug License</label>
                            <input type="text" placeholder="License Number" required
                                onChange={e => setFormData({ ...formData, licenseNumber: e.target.value })}
                                style={{ padding: "12px", borderRadius: "8px", border: "1px solid #e5e7eb", width: '100%', fontSize: '1rem' }} />
                        </div>
                        <div style={{ position: 'relative' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, fontSize: '0.85rem', color: '#059669', textTransform: 'uppercase' }}>Referral Code (Optional)</label>
                            <input type="text" placeholder="Enter Code"
                                value={formData.referralCode}
                                onChange={e => setFormData({ ...formData, referralCode: e.target.value })}
                                style={{ padding: "12px", borderRadius: "8px", border: "2px solid #10b981", width: '100%', fontSize: '1rem', background: '#f0fdf4' }} />
                                {formData.referralCode && <i className="fa-solid fa-circle-check" style={{ position: 'absolute', right: '12px', top: '42px', color: '#059669' }}></i>}
                        </div>
                    </div>

                    <div style={{ padding: '15px', background: '#f0fdf4', border: '1px solid #bcf0da', borderRadius: '12px', fontSize: '13px', color: '#166534' }}>
                        <label style={{ display: 'flex', gap: '10px', cursor: 'pointer' }}>
                            <input type="checkbox" required checked={formData.agreedToTerms} 
                                onChange={e => setFormData({ ...formData, agreedToTerms: e.target.checked })}
                                style={{ marginTop: '4px' }}
                            />
                            <span>
                                <strong>Legal Accountability:</strong> Retailer acknowledges legal responsibility for all items properly packaged and sealed. Tamper-evident codes must be applied for all deliveries. Any breach leading to damage before delivery will hold the delivery agent responsible. Retailers remain liable for item accuracy, substitutions, or malpractice.
                            </span>
                        </label>
                    </div>

                    <button type="submit" disabled={loading}
                        style={{ padding: "15px", background: "#059669", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 800, fontSize: '1rem', marginTop: '10px', transition: '0.2s', boxShadow: '0 4px 12px rgba(5, 150, 105, 0.2)' }}
                        onMouseOver={(e) => e.currentTarget.style.background = '#047857'}
                        onMouseOut={(e) => e.currentTarget.style.background = '#059669'}
                    >
                        {loading ? "Establishing Partnership..." : "Register as Pharmacy Partner"}
                    </button>
                    <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#6b7280', marginTop: '10px' }}>
                        By registering, you agree to our <a href="/terms-conditions" className="text-emerald-600 font-bold">Terms of Service</a> and <a href="/privacy-policy" className="text-emerald-600 font-bold">Privacy Policy</a>
                    </p>
                    </form>
                </div>
            </div>
        </>
    );
}
