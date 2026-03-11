"use client";
import React, { useState } from 'react';
import Navbar from "@/components/Navbar";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function GrowthPartnerApply() {
    const { data: session } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: session?.user?.name || "",
        company: "",
        region: "",
        phone: ""
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/growth-partner/apply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.success) {
                alert("Welcome to the Swastik Growth Network! Your application is under review. You can start sharing your referral link immediately.");
                router.push('/partner-growth');
            } else {
                alert(data.error);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '60px' }}>
            <Navbar />
            <div className="container" style={{ marginTop: '100px', maxWidth: '600px' }}>
                <div style={{ background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
                    <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                        <div style={{ background: '#fef3c7', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto', color: '#d97706', fontSize: '2rem' }}>
                            <i className="fa-solid fa-handshake"></i>
                        </div>
                        <h2 style={{ color: '#0f172a', margin: '0 0 10px 0' }}>Become a Growth Partner</h2>
                        <p style={{ color: '#64748b', fontSize: '1rem', margin: 0 }}>Register as a Medical Representative to unlock B2B referral tools, leaderboard access, and unlimited recurring commissions.</p>
                    </div>

                    {!session?.user ? (
                        <div style={{ background: '#fee2e2', color: '#991b1b', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                            <i className="fa-solid fa-lock" style={{ marginRight: '8px' }}></i> Please <a href="/login" style={{ color: '#dc2626', fontWeight: 'bold' }}>Log In</a> or Register a free account first before applying.
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', fontWeight: 'bold', color: '#475569', marginBottom: '8px' }}>Full Name (As per KYC)</label>
                                <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} placeholder="Dr. John Doe / Mr. Smith" />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', fontWeight: 'bold', color: '#475569', marginBottom: '8px' }}>Pharma Company</label>
                                    <input type="text" required value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} placeholder="e.g. Sun Pharma" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontWeight: 'bold', color: '#475569', marginBottom: '8px' }}>Coverage Region</label>
                                    <input type="text" required value={formData.region} onChange={e => setFormData({ ...formData, region: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} placeholder="e.g. South Delhi" />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontWeight: 'bold', color: '#475569', marginBottom: '8px' }}>Official WhatsApp Number</label>
                                <input type="tel" required value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} placeholder="+91 99999 99999" />
                                <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '5px' }}>We will use this to verify payouts and send lead alerts.</p>
                            </div>

                            <button type="submit" disabled={loading} style={{ background: '#f59e0b', color: 'white', border: 'none', padding: '16px', borderRadius: '12px', fontWeight: 'bold', fontSize: '1.1rem', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, marginTop: '10px' }}>
                                {loading ? 'Submitting Application...' : 'Submit KYC Application'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
