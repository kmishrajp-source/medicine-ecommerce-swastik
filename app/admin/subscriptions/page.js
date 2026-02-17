"use client";
import React, { useState, useEffect } from 'react';
import Navbar from "@/components/Navbar";

export default function AdminSubscriptions() {
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/subscription')
            .then(res => res.json())
            .then(data => {
                if (data.success) setSubscriptions(data.subscriptions);
                setLoading(false);
            });
    }, []);

    return (
        <>
            <Navbar />
            <div className="container" style={{ marginTop: '120px' }}>
                <h1 style={{ color: '#1F2937' }}>🔄 All Subscriptions</h1>

                {loading ? <p>Loading...</p> : (
                    <div style={{ overflowX: 'auto', background: 'white', borderRadius: '16px', marginTop: '20px', padding: '20px', border: '1px solid #eee' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '2px solid #f3f4f6' }}>
                                    <th style={{ padding: '15px' }}>User</th>
                                    <th style={{ padding: '15px' }}>Medicine</th>
                                    <th style={{ padding: '15px' }}>Frequency</th>
                                    <th style={{ padding: '15px' }}>Next Date</th>
                                    <th style={{ padding: '15px' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {subscriptions.map(sub => (
                                    <tr key={sub.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                        <td style={{ padding: '15px' }}>
                                            <div style={{ fontWeight: 600 }}>{sub.user?.name || "Unknown"}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#666' }}>{sub.user?.email}</div>
                                        </td>
                                        <td style={{ padding: '15px' }}>{sub.medicineName} (x{sub.quantity})</td>
                                        <td style={{ padding: '15px' }}>{sub.frequency}</td>
                                        <td style={{ padding: '15px' }}>{new Date(sub.nextDate).toLocaleDateString()}</td>
                                        <td style={{ padding: '15px' }}>
                                            <span style={{
                                                padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem',
                                                background: sub.status === 'Active' ? '#DEF7EC' : '#FDE8E8',
                                                color: sub.status === 'Active' ? '#03543F' : '#9B1C1C'
                                            }}>
                                                {sub.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {subscriptions.length === 0 && <div style={{ padding: '30px', textAlign: 'center', color: '#666' }}>No subscriptions found.</div>}
                    </div>
                )}
            </div>
        </>
    );
}
