"use client";
import React, { useState, useEffect } from 'react';
import Navbar from "@/components/Navbar";

export default function PharmaDashboard() {
    const [ads, setAds] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        imageUrl: '',
        targetUrl: '',
        position: 'Home-Banner',
        price: 5000
    });

    useEffect(() => {
        // Fetch existing ads (mocked for now, or implement GET /api/ads/my)
    }, []);

    const createAd = async (e) => {
        e.preventDefault();
        const res = await fetch('/api/ads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        const data = await res.json();
        if (data.success) {
            alert("Ad Campaign Created!");
            setShowForm(false);
        } else {
            alert("Failed: " + data.error);
        }
    };

    return (
        <>
            <Navbar />
            <div className="container" style={{ marginTop: '120px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h1 style={{ color: '#4F46E5' }}>🏢 Pharma Dashboard</h1>
                    <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
                        + Create New Ad
                    </button>
                </div>

                {showForm && (
                    <div style={{ background: '#EEF2FF', padding: '30px', borderRadius: '12px', marginBottom: '30px' }}>
                        <h3>Launch New Campaign</h3>
                        <form onSubmit={createAd} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
                            <input type="text" placeholder="Ad Title (e.g. New Diabetes Drug)" className="input-field" required onChange={e => setFormData({ ...formData, title: e.target.value })} />
                            <input type="text" placeholder="Image URL (Banner)" className="input-field" required onChange={e => setFormData({ ...formData, imageUrl: e.target.value })} />
                            <input type="text" placeholder="Target URL (Product Page)" className="input-field" required onChange={e => setFormData({ ...formData, targetUrl: e.target.value })} />
                            <select className="input-field" onChange={e => setFormData({ ...formData, position: e.target.value })}>
                                <option value="Home-Banner">Home Page Banner (₹5000)</option>
                                <option value="Sidebar">Sidebar Ad (₹2000)</option>
                            </select>
                            <button type="submit" className="btn btn-primary" style={{ gridColumn: 'span 2' }}>Launch Campaign (Pay Later)</button>
                        </form>
                    </div>
                )}

                <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                    <div style={{ padding: '20px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                        <h3>Active Ads</h3>
                        <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>0</p>
                        <p style={{ color: '#666' }}>Campaigns running</p>
                    </div>
                </div>
            </div>
        </>
    );
}
