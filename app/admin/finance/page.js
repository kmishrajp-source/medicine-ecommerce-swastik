"use client";
import React, { useState, useEffect } from 'react';
import Navbar from "@/components/Navbar";

export default function AdminFinance() {
    const [data, setData] = useState(null);

    useEffect(() => {
        fetch('/api/admin/finance')
            .then(res => res.json())
            .then(res => {
                if (res.success) setData(res.data);
            });
    }, []);

    const Card = ({ title, amount, color }) => (
        <div style={{ background: 'white', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderLeft: `5px solid ${color}` }}>
            <h3 style={{ color: '#666', fontSize: '0.9rem', textTransform: 'uppercase' }}>{title}</h3>
            <p style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: '10px 0', color: '#1F2937' }}>₹{amount?.toLocaleString() || 0}</p>
            <span style={{ fontSize: '0.8rem', color: '#10B981' }}>+ 10% Commission</span>
        </div>
    );

    if (!data) return <div className="container" style={{ marginTop: '120px' }}>Loading Financial Data...</div>;

    return (
        <>
            <Navbar />
            <div className="container" style={{ marginTop: '120px' }}>
                <h1 style={{ color: '#1F2937' }}>💰 Financial Overview</h1>
                <p>Platform Earnings & Commissions (10% Model)</p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px', marginTop: '30px' }}>
                    <div style={{ background: '#10B981', padding: '30px', borderRadius: '16px', color: 'white', gridColumn: '1 / -1' }}>
                        <h2>Total Net Revenue</h2>
                        <div style={{ fontSize: '3rem', fontWeight: 'bold' }}>₹{data.totalRevenue.toLocaleString()}</div>
                        <p>Aggregated from all ecosystem services.</p>
                    </div>

                    <Card title="Medicine Sales (10%)" amount={data.medicineCommission} color="#3B82F6" />
                    <Card title="Doctor Bookings" amount={data.doctorCommission} color="#8B5CF6" />
                    <Card title="Lab Tests" amount={data.labCommission} color="#F59E0B" />
                    <Card title="Ambulance Trips" amount={data.ambulanceCommission} color="#EF4444" />
                    <Card title="Ad Campaigns" amount={data.adRevenue} color="#6366F1" />
                </div>
            </div>
        </>
    );
}
