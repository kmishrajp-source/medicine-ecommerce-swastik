"use client";
import React, { useState, useEffect } from 'react';
import Navbar from "@/components/Navbar";

export default function AdminApprovals() {
    const [pending, setPending] = useState({ doctors: [], labs: [], pharmas: [], mrs: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/approvals')
            .then(res => res.json())
            .then(data => {
                if (data.success) setPending(data.pending);
                setLoading(false);
            });
    }, []);

    const handleAction = async (type, id, action) => {
        const res = await fetch('/api/admin/approvals', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type, id, action })
        });
        if (res.ok) {
            alert(`User ${action}d`);
            window.location.reload();
        }
    };

    const Section = ({ title, items, type }) => (
        <div style={{ marginBottom: '30px' }}>
            <h3>{title} ({items?.length || 0})</h3>
            {items?.length === 0 ? <p style={{ color: '#666' }}>No pending requests.</p> : (
                <div style={{ display: 'grid', gap: '15px' }}>
                    {items.map(item => (
                        <div key={item.id} style={{ background: 'white', padding: '15px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                            <div>
                                <strong>{item.name || item.companyName || item.driverName}</strong>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>{item.licenseNumber || item.specialization || item.region}</p>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button onClick={() => handleAction(type, item.id, 'approve')} className="btn-small" style={{ background: '#10B981', color: 'white' }}>Approve</button>
                                <button onClick={() => handleAction(type, item.id, 'reject')} className="btn-small" style={{ background: '#EF4444', color: 'white' }}>Reject</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <>
            <Navbar />
            <div className="container" style={{ marginTop: '120px' }}>
                <h1 style={{ color: '#1F2937' }}>🛡️ Admin Approvals</h1>
                <p>Authorize new partners before they can operate.</p>
                <div style={{ marginTop: '30px' }}>
                    {loading ? <p>Loading requests...</p> : (
                        <>
                            <Section title="Doctors" items={pending.doctors} type="doctor" />
                            <Section title="Labs" items={pending.labs} type="lab" />
                            <Section title="Pharma Companies" items={pending.pharmas} type="pharma" />
                            <Section title="Medical Reps" items={pending.mrs} type="mr" />
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
