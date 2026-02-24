"use client";
import React, { useState, useEffect } from 'react';
import Navbar from "@/components/Navbar";

export default function AdminRequests() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/request-medicine')
            .then(res => res.json())
            .then(data => {
                if (data.success) setRequests(data.requests);
                setLoading(false);
            });
    }, []);

    return (
        <>
            <Navbar />
            <div className="container" style={{ marginTop: '120px' }}>
                <h1 style={{ color: '#1F2937' }}>📋 Medicine Requests</h1>
                <p>Special orders requested by users.</p>

                <div style={{ marginTop: '30px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#f9fafb' }}>
                            <tr>
                                <th style={{ padding: '15px', textAlign: 'left' }}>Date</th>
                                <th style={{ padding: '15px', textAlign: 'left' }}>User / Contact</th>
                                <th style={{ padding: '15px', textAlign: 'left' }}>Medicine</th>
                                <th style={{ padding: '15px', textAlign: 'left' }}>Quantity</th>
                                <th style={{ padding: '15px', textAlign: 'left' }}>Status</th>
                                <th style={{ padding: '15px', textAlign: 'left' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map(req => (
                                <tr key={req.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '15px' }}>{new Date(req.createdAt).toLocaleDateString()}</td>
                                    <td style={{ padding: '15px' }}>
                                        <div style={{ fontWeight: 'bold' }}>{req.user?.name || req.guestName || "Guest"}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#666' }}>{req.user?.email || req.guestPhone}</div>
                                    </td>
                                    <td style={{ padding: '15px', fontWeight: 'bold' }}>{req.medicineName}</td>
                                    <td style={{ padding: '15px' }}>{req.quantity}</td>
                                    <td style={{ padding: '15px' }}>
                                        <span style={{ padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem', background: req.status === 'Pending' ? '#FEF3C7' : '#D1FAE5', color: req.status === 'Pending' ? '#D97706' : '#047857' }}>
                                            {req.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '15px' }}>
                                        <button className="btn-small" style={{ background: '#3B82F6', color: 'white' }}>Call User</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {requests.length === 0 && <div style={{ padding: '30px', textAlign: 'center', color: '#666' }}>No requests found.</div>}
                </div>
            </div>
        </>
    );
}
