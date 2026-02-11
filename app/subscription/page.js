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
            <div className="container" style={{ marginTop: '120px', maxWidth: '800px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h1>📅 My Subscriptions</h1>
                    <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
                        {showForm ? 'Close' : '+ New Subscription'}
                    </button>
                </div>

                {showForm && (
                    <div className="glass" style={{ padding: '30px', marginBottom: '30px', borderRadius: '16px' }}>
                        <h3>Subscribe to a Medicine</h3>
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
