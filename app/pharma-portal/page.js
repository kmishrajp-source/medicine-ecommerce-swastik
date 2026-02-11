"use client";
import React from 'react';
import Navbar from "@/components/Navbar";

export default function PharmaDashboard() {
    return (
        <>
            <Navbar />
            <div className="container" style={{ marginTop: '120px' }}>
                <h1 style={{ color: '#4F46E5' }}>🏢 Pharma Dashboard</h1>
                <p>Welcome, [Company Name]</p>

                <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '30px' }}>
                    <div style={{ padding: '20px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                        <h3>Active Ads</h3>
                        <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>0</p>
                        <button className="btn-small">Create New Ad</button>
                    </div>
                    <div style={{ padding: '20px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                        <h3>Product Impressions</h3>
                        <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>1.2k</p>
                    </div>
                </div>
            </div>
        </>
    );
}
