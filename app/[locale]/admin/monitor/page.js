"use client";
import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function SystemMonitor() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, critical: 0, resolved: 0 });

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const res = await fetch('/api/admin/system-logs');
            const data = await res.json();
            if (data.success) {
                setLogs(data.logs);
                calculateStats(data.logs);
            }
        } catch (err) {
            console.error("Failed to fetch logs", err);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (logData) => {
        const total = logData.length;
        const critical = logData.filter(l => l.errorType === 'security' || l.errorType === 'payment_gateway').length;
        const resolved = logData.filter(l => l.isResolved).length;
        setStats({ total, critical, resolved });
    };

    const getStatusColor = (type) => {
        switch (type) {
            case 'security': return '#ef4444'; // Red
            case 'payment_gateway': return '#f59e0b'; // Orange
            case 'validation': return '#3b82f6'; // Blue
            default: return '#6b7280';
        }
    };

    return (
        <div style={{ background: '#f9fafb', minHeight: '100vh' }}>
            <Navbar />
            <div className="container" style={{ paddingTop: '120px', paddingBottom: '60px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <div>
                        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#111827' }}>System Improvement Monitor</h1>
                        <p style={{ color: '#6b7280' }}>Track and resolve platform failures with AI assistance.</p>
                    </div>
                    <button 
                        onClick={fetchLogs}
                        style={{ background: 'white', border: '1px solid #d1d5db', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}
                    >
                        <i className="fa-solid fa-rotate"></i> Refresh
                    </button>
                </div>

                {/* Stats Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                    <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <div style={{ color: '#6b7280', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Failures</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827' }}>{stats.total}</div>
                    </div>
                    <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <div style={{ color: '#ef4444', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Critical Issues</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#ef4444' }}>{stats.critical}</div>
                    </div>
                    <div style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <div style={{ color: '#10b981', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Resolved</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#10b981' }}>{stats.resolved}</div>
                    </div>
                </div>

                {/* Logs Table */}
                <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ background: '#f3f4f6', color: '#374151', fontSize: '0.875rem', fontWeight: '600' }}>
                            <tr>
                                <th style={{ padding: '16px' }}>Timestamp</th>
                                <th style={{ padding: '16px' }}>Action / Role</th>
                                <th style={{ padding: '16px' }}>Error Type</th>
                                <th style={{ padding: '16px' }}>Message</th>
                                <th style={{ padding: '16px' }}>AI Suggestion</th>
                                <th style={{ padding: '16px' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody style={{ fontSize: '0.875rem', color: '#4b5563' }}>
                            {loading ? (
                                <tr><td colSpan="6" style={{ padding: '40px', textAlign: 'center' }}>Loading logs...</td></tr>
                            ) : logs.length === 0 ? (
                                <tr><td colSpan="6" style={{ padding: '40px', textAlign: 'center' }}>No failures detected. System healthy! 🚀</td></tr>
                            ) : logs.map((log) => (
                                <tr key={log.id} style={{ borderTop: '1px solid #e5e7eb' }}>
                                    <td style={{ padding: '16px' }}>{new Date(log.createdAt).toLocaleString()}</td>
                                    <td style={{ padding: '16px' }}>
                                        <div style={{ fontWeight: '600', color: '#111827' }}>{log.actionType}</div>
                                        <div style={{ fontSize: '0.75rem' }}>{log.userRole || 'Unknown'}</div>
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <span style={{ 
                                            background: getStatusColor(log.errorType) + '15', 
                                            color: getStatusColor(log.errorType),
                                            padding: '4px 10px',
                                            borderRadius: '9999px',
                                            fontSize: '0.75rem',
                                            fontWeight: '600'
                                        }}>
                                            {log.errorType}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px', maxWidth: '300px' }}>
                                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={log.errorMessage}>
                                            {log.errorMessage}
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px', maxWidth: '300px' }}>
                                        <div style={{ fontSize: '0.8rem', color: '#047857', background: '#ecfdf5', padding: '8px', borderRadius: '6px' }}>
                                            <i className="fa-solid fa-robot"></i> {log.aiSuggestion || "AI analyzing pattern..."}
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        {log.isResolved ? (
                                            <span style={{ color: '#10b981' }}><i className="fa-solid fa-circle-check"></i> Fixed</span>
                                        ) : (
                                            <span style={{ color: '#bcbcbc' }}><i className="fa-solid fa-circle"></i> Pending</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <Footer />
        </div>
    );
}
