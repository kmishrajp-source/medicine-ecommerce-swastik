"use client";
import React, { useState, useEffect } from 'react';
import Navbar from "@/components/Navbar";
import { useSession } from "next-auth/react";

export default function Subscriptions() {
    const { data: session } = useSession();
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ medicineName: "", quantity: 1, frequency: "Monthly" });

    useEffect(() => {
        if (session) fetchSubs();
    }, [session]);

    const fetchSubs = () => {
        fetch('/api/subscription')
            .then(res => res.json())
            .then(data => {
                if (data.success) setSubscriptions(data.subscriptions);
                setLoading(false);
            });
    };

    const handleSubscribe = async (e) => {
        e.preventDefault();
        const res = await fetch('/api/subscription', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        if (res.ok) {
            alert("Subscribed successfully!");
            setShowForm(false);
            fetchSubs();
            setFormData({ medicineName: "", quantity: 1, frequency: "Monthly" });
        } else {
            alert("Failed to subscribe.");
        }
    };

    return (
        <>
            <Navbar />
            <div className="container" style={{ marginTop: '120px', maxWidth: '1000px' }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>Your Health, Simplified.</h1>
                    <p style={{ color: '#666', fontSize: '1.1rem' }}>Choose a plan that fits your needs. Cancel anytime.</p>
                </div>

                {/* --- Health Plans Section --- */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginBottom: '60px' }}>

                    {/* Diabetes Plan */}
                    <div className="glass" style={{ padding: '30px', borderRadius: '24px', border: '1px solid #e0f2fe', background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)' }}>
                        <div style={{ background: '#0284c7', color: 'white', padding: '5px 12px', borderRadius: '20px', fontSize: '0.8rem', width: 'fit-content', marginBottom: '15px' }}>DIABETES CARE</div>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Sugar Control Plan</h3>
                        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '20px' }}>
                            ₹499<span style={{ fontSize: '1rem', color: '#64748b', fontWeight: 'normal' }}>/mo</span>
                        </div>
                        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 30px 0', color: '#334155' }}>
                            <li style={{ marginBottom: '10px' }}>✅ Monthly Medicines (Metformin/Insulin)</li>
                            <li style={{ marginBottom: '10px' }}>✅ Diet Chart for Diabetics</li>
                            <li style={{ marginBottom: '10px' }}>✅ Sugar Test Kit Refill</li>
                        </ul>
                        <button
                            onClick={(e) => {
                                setFormData({ medicineName: "Diabetes Care Plan", quantity: 1, frequency: "Monthly" });
                                handleSubscribe(e);
                            }}
                            className="btn btn-primary" style={{ width: '100%', background: '#0284c7' }}>
                            Subscribe Now
                        </button>
                    </div>

                    {/* BP Plan */}
                    <div className="glass" style={{ padding: '30px', borderRadius: '24px', border: '1px solid #fecaca', background: 'linear-gradient(135deg, #ffffff 0%, #fef2f2 100%)' }}>
                        <div style={{ background: '#dc2626', color: 'white', padding: '5px 12px', borderRadius: '20px', fontSize: '0.8rem', width: 'fit-content', marginBottom: '15px' }}>HEART HEALTH</div>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>BP Control Plan</h3>
                        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '20px' }}>
                            ₹399<span style={{ fontSize: '1rem', color: '#64748b', fontWeight: 'normal' }}>/mo</span>
                        </div>
                        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 30px 0', color: '#334155' }}>
                            <li style={{ marginBottom: '10px' }}>✅ Daily BP Medicine (Amlodipine etc.)</li>
                            <li style={{ marginBottom: '10px' }}>✅ Monthly BP Monitor Check</li>
                            <li style={{ marginBottom: '10px' }}>✅ Doctor Consultation (1/mo)</li>
                        </ul>
                        <button
                            onClick={(e) => {
                                setFormData({ medicineName: "BP Care Plan", quantity: 1, frequency: "Monthly" });
                                handleSubscribe(e);
                            }}
                            className="btn btn-primary" style={{ width: '100%', background: '#dc2626' }}>
                            Subscribe Now
                        </button>
                    </div>

                    {/* Senior Citizen Plan */}
                    <div className="glass" style={{ padding: '30px', borderRadius: '24px', border: '1px solid #dcfce7', background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)' }}>
                        <div style={{ background: '#16a34a', color: 'white', padding: '5px 12px', borderRadius: '20px', fontSize: '0.8rem', width: 'fit-content', marginBottom: '15px' }}>ELDERLY CARE</div>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>Senior Citizen Plus</h3>
                        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#0f172a', marginBottom: '20px' }}>
                            ₹999<span style={{ fontSize: '1rem', color: '#64748b', fontWeight: 'normal' }}>/mo</span>
                        </div>
                        <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 30px 0', color: '#334155' }}>
                            <li style={{ marginBottom: '10px' }}>✅ All Prescribed Medicines</li>
                            <li style={{ marginBottom: '10px' }}>✅ Full Body Checkup (Quarterly)</li>
                            <li style={{ marginBottom: '10px' }}>✅ 24/7 Priority Support & Delivery</li>
                        </ul>
                        <button
                            onClick={(e) => {
                                setFormData({ medicineName: "Senior Citizen Care Plan", quantity: 1, frequency: "Monthly" });
                                handleSubscribe(e);
                            }}
                            className="btn btn-primary" style={{ width: '100%', background: '#16a34a' }}>
                            Subscribe Now
                        </button>
                    </div>

                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h2>📅 My Subscriptions</h2>
                    <button onClick={() => setShowForm(!showForm)} className="btn btn-secondary">
                        {showForm ? 'Close Form' : '+ Custom Subscription'}
                    </button>
                </div>

                {showForm && (
                    <div className="glass" style={{ padding: '30px', marginBottom: '30px', borderRadius: '16px' }}>
                        <h3>Subscribe to a Specific Medicine</h3>
                        <p style={{ color: '#666', marginBottom: '20px' }}>Get automatic deliveries and save 5%.</p>
                        <form onSubmit={handleSubscribe} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <input
                                type="text"
                                placeholder="Medicine Name (e.g. Metformin)"
                                value={formData.medicineName}
                                onChange={e => setFormData({ ...formData, medicineName: e.target.value })}
                                style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
                                required
                            />
                            <div style={{ display: 'flex', gap: '20px' }}>
                                <input
                                    type="number"
                                    min="1"
                                    placeholder="Quantity"
                                    value={formData.quantity}
                                    onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                                    style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
                                    required
                                />
                                <select
                                    value={formData.frequency}
                                    onChange={e => setFormData({ ...formData, frequency: e.target.value })}
                                    style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
                                >
                                    <option value="Monthly">Monthly</option>
                                    <option value="Weekly">Weekly</option>
                                </select>
                            </div>
                            <button type="submit" className="btn btn-primary">Start Subscription</button>
                        </form>
                    </div>
                )}

                {loading ? <p>Loading...</p> : (
                    subscriptions.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '50px', color: '#666' }}>
                            <i className="fa-solid fa-box-open" style={{ fontSize: '3rem', marginBottom: '20px', opacity: 0.5 }}></i>
                            <p>No active subscriptions.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: '20px' }}>
                            {subscriptions.map(sub => (
                                <div key={sub.id} style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h3 style={{ margin: '0 0 5px 0' }}>{sub.medicineName}</h3>
                                        <div style={{ color: '#666', fontSize: '0.9rem' }}>
                                            {sub.quantity} pack(s) • {sub.frequency}
                                        </div>
                                        <div style={{ marginTop: '5px', fontSize: '0.8rem', color: '#059669' }}>
                                            Next Delivery: {new Date(sub.nextDate).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <span style={{
                                        padding: '5px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold',
                                        background: sub.status === 'Active' ? '#d1fae5' : '#fee2e2',
                                        color: sub.status === 'Active' ? '#047857' : '#b91c1c'
                                    }}>
                                        {sub.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )
                )}
            </div>
        </>
    );
}
