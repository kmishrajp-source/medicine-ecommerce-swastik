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

                    <Card title="Medicine Sales (Platform Margin)" amount={data.medicineCommission} color="#3B82F6" />
                    <Card title="Doctor Bookings" amount={data.doctorCommission} color="#8B5CF6" />
                    <Card title="Lab Tests" amount={data.labCommission} color="#F59E0B" />
                    <Card title="Ambulance Trips" amount={data.ambulanceCommission} color="#EF4444" />
                    <Card title="Ad Campaigns" amount={data.adRevenue} color="#6366F1" />
                </div>

                <div style={{ marginTop: '50px' }}>
                    <h2 style={{ color: '#1F2937', marginBottom: '20px' }}>🧾 Recent Retailer Invoices (Auto-Generated)</h2>
                    <div style={{ overflowX: 'auto', background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ background: '#F3F4F6', color: '#4B5563', textTransform: 'uppercase', fontSize: '0.8rem' }}>
                                    <th style={{ padding: '15px 20px', borderBottom: '2px solid #E5E7EB' }}>Invoice ID</th>
                                    <th style={{ padding: '15px 20px', borderBottom: '2px solid #E5E7EB' }}>Retailer</th>
                                    <th style={{ padding: '15px 20px', borderBottom: '2px solid #E5E7EB' }}>Customer Paid (Total)</th>
                                    <th style={{ padding: '15px 20px', borderBottom: '2px solid #E5E7EB' }}>Platform Margin %</th>
                                    <th style={{ padding: '15px 20px', borderBottom: '2px solid #E5E7EB', color: '#EF4444' }}>Platform Fee</th>
                                    <th style={{ padding: '15px 20px', borderBottom: '2px solid #E5E7EB', color: '#10B981' }}>Retailer Settlement</th>
                                    <th style={{ padding: '15px 20px', borderBottom: '2px solid #E5E7EB' }}>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.recentInvoices && data.recentInvoices.map(invoice => (
                                    <tr key={invoice.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                                        <td style={{ padding: '15px 20px', fontSize: '0.9rem', color: '#6B7280' }}>#{invoice.id.slice(-6).toUpperCase()}</td>
                                        <td style={{ padding: '15px 20px', fontWeight: 600 }}>{invoice.subOrder?.retailer?.shopName || 'N/A'}</td>
                                        <td style={{ padding: '15px 20px', fontWeight: 700 }}>₹{invoice.customerTotal?.toLocaleString()}</td>
                                        <td style={{ padding: '15px 20px' }}><span style={{ background: '#DBEAFE', color: '#1E40AF', padding: '4px 8px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700 }}>{invoice.platformMarginPerc}%</span></td>
                                        <td style={{ padding: '15px 20px', color: '#EF4444', fontWeight: 700 }}>₹{invoice.platformFee?.toLocaleString()}</td>
                                        <td style={{ padding: '15px 20px', color: '#10B981', fontWeight: 800 }}>₹{invoice.retailerAmount?.toLocaleString()}</td>
                                        <td style={{ padding: '15px 20px', fontSize: '0.85rem', color: '#9CA3AF' }}>{new Date(invoice.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                                {(!data.recentInvoices || data.recentInvoices.length === 0) && (
                                    <tr>
                                        <td colSpan="7" style={{ padding: '30px', textAlign: 'center', color: '#9CA3AF' }}>No invoices generated yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}
