"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SMSLogs() {
    const { cartCount, toggleCart } = useCart();
    const { data: session, status } = useSession();
    const router = useRouter();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        } else {
            fetchLogs();
        }
    }, [status, router]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/sms-logs');
            const data = await res.json();
            if (data.success) {
                setLogs(data.logs);
            } else {
                alert("Failed to load logs: " + data.error);
            }
        } catch (error) {
            console.error("Failed to load logs", error);
        } finally {
            setLoading(false);
        }
    };

    if (status === 'loading') return <div>Loading...</div>;

    return (
        <>
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />
            <div className="container" style={{ marginTop: '100px', maxWidth: '1000px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <h2>SMS Communication History</h2>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <Link href="/admin" className="btn btn-secondary">Back to Dashboard</Link>
                        <button onClick={fetchLogs} className="btn btn-primary" disabled={loading}>
                            {loading ? 'Refreshing...' : 'Refresh Logs'}
                        </button>
                    </div>
                </div>

                <div style={{ background: 'white', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: 'var(--bg-light)', textAlign: 'left' }}>
                            <tr>
                                <th style={{ padding: '16px' }}>Time</th>
                                <th style={{ padding: '16px' }}>Phone</th>
                                <th style={{ padding: '16px' }}>Message</th>
                                <th style={{ padding: '16px' }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.length === 0 ? (
                                <tr><td colSpan="4" style={{ padding: '20px', textAlign: 'center' }}>No SMS logs found.</td></tr>
                            ) : (
                                logs.map(log => (
                                    <tr key={log.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '16px', whiteSpace: 'nowrap', fontSize: '0.85rem' }}>
                                            {new Date(log.createdAt).toLocaleString()}
                                        </td>
                                        <td style={{ padding: '16px', fontWeight: 'bold' }}>{log.phone}</td>
                                        <td style={{ padding: '16px', fontSize: '0.9rem', maxWidth: '400px' }}>{log.message}</td>
                                        <td style={{ padding: '16px' }}>
                                            <span style={{
                                                padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                                                background: log.status === 'Sent' ? '#D1FAE5' : log.status === 'Mock' ? '#FEF3C7' : '#FEE2E2',
                                                color: log.status === 'Sent' ? '#059669' : log.status === 'Mock' ? '#D97706' : '#DC2626'
                                            }}>
                                                {log.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
