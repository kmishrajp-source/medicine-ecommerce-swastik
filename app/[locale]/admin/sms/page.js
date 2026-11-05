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
    const [metrics, setMetrics] = useState(null);
    const [connection, setConnection] = useState(null);
    const [balanceInfo, setBalanceInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    // Controlled Admin Test State
    const [testPhone, setTestPhone] = useState("");
    const [testMsg, setTestMsg] = useState("");
    const [testingSending, setTestingSending] = useState(false);
    const [testResult, setTestResult] = useState(null);

    // Retrying state
    const [retryingId, setRetryingId] = useState(null);

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
                setLogs(data.logs || []);
                setMetrics(data.metrics || null);
                setConnection(data.connection || null);
                setBalanceInfo(data.balance || null);
            } else {
                alert("Failed to load logs: " + data.error);
            }
        } catch (error) {
            console.error("Failed to load logs", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSendTestSMS = async (e) => {
        e.preventDefault();
        setTestResult(null);
        setTestingSending(true);

        try {
            const res = await fetch('/api/admin/sms-logs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    testPhone,
                    message: testMsg || undefined
                })
            });
            const data = await res.json();
            setTestResult(data);
            fetchLogs();
        } catch (err) {
            setTestResult({ success: false, error: err.message });
        } finally {
            setTestingSending(false);
        }
    };

    const handleRetry = async (logItem) => {
        if (!confirm(`Retry sending SMS to ${logItem.maskedPhone}?`)) return;
        setRetryingId(logItem.id);
        try {
            const res = await fetch('/api/admin/sms-logs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    testPhone: logItem.phone,
                    message: logItem.message,
                    isRetry: true,
                    logId: logItem.id
                })
            });
            const data = await res.json();
            if (data.success) {
                alert("✓ Retried successfully! Provider Request ID: " + data.providerRequestId);
            } else {
                alert("✗ Retry failed: " + (data.error || "Unknown error"));
            }
            fetchLogs();
        } catch (e) {
            alert("Retry exception: " + e.message);
        } finally {
            setRetryingId(null);
        }
    };

    if (status === 'loading') return <div>Loading...</div>;

    return (
        <>
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />
            <div className="container" style={{ marginTop: '100px', maxWidth: '1200px', paddingBottom: '60px' }}>
                
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '15px' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0, color: '#111827' }}>
                                MSG91 SMS Gateway &amp; Delivery Monitor
                            </h1>
                            <span style={{
                                padding: '4px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '700',
                                background: connection?.configured ? '#DCFCE7' : '#FEF3C7',
                                color: connection?.configured ? '#166534' : '#92400E'
                            }}>
                                ● {connection?.status || "Checking..."}
                            </span>
                        </div>
                        <p style={{ color: '#6B7280', fontSize: '0.9rem', marginTop: '4px' }}>
                            Account: <strong>{connection?.account || "swastik17"}</strong> | Sender ID: <strong>{connection?.senderId || "SWASTIK"}</strong>
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <Link href="/admin" className="btn btn-secondary" style={{ padding: '8px 16px', borderRadius: '8px', textDecoration: 'none' }}>
                            Back to Admin
                        </Link>
                        <button onClick={fetchLogs} className="btn btn-primary" disabled={loading} style={{ padding: '8px 16px', borderRadius: '8px' }}>
                            {loading ? 'Refreshing...' : '↻ Refresh Logs'}
                        </button>
                    </div>
                </div>

                {/* Status Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                    {/* Total Dispatched */}
                    <div style={{ background: 'white', padding: '18px', borderRadius: '14px', border: '1px solid #E5E7EB', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase' }}>Total Submissions</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#111827', marginTop: '6px' }}>{metrics?.total || 0}</div>
                        <div style={{ fontSize: '0.75rem', color: '#059669', marginTop: '4px', fontWeight: '600' }}>
                            ✓ {metrics?.sent || 0} Accepted by Gateway
                        </div>
                    </div>

                    {/* Invalid Number Rejections */}
                    <div style={{ background: 'white', padding: '18px', borderRadius: '14px', border: '1px solid #FEE2E2', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#DC2626', textTransform: 'uppercase' }}>Invalid Numbers Caught</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#DC2626', marginTop: '6px' }}>{metrics?.rejected || 0}</div>
                        <div style={{ fontSize: '0.75rem', color: '#991B1B', marginTop: '4px' }}>
                            Blocked before provider (Error 202 Prevention)
                        </div>
                    </div>

                    {/* Provider Failures */}
                    <div style={{ background: 'white', padding: '18px', borderRadius: '14px', border: '1px solid #E5E7EB', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase' }}>Provider Failures</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#4B5563', marginTop: '6px' }}>{metrics?.failed || 0}</div>
                        <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '4px' }}>
                            Gateway errors (e.g. 203, 301)
                        </div>
                    </div>

                    {/* Balance Info */}
                    <div style={{ background: '#F0FDF4', padding: '18px', borderRadius: '14px', border: '1px solid #BBF7D0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: '700', color: '#166534', textTransform: 'uppercase' }}>Dashboard Wallet</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: '800', color: '#166534', marginTop: '6px' }}>Active ₹25.50</div>
                        <a href="https://control.msg91.com" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', color: '#2563EB', textDecoration: 'underline', display: 'inline-block', marginTop: '4px', fontWeight: '600' }}>
                            Manage on MSG91 Dashboard ↗
                        </a>
                    </div>
                </div>

                {/* Diagnostic Highlights Box */}
                {(metrics?.lastSuccess || metrics?.lastFailure) && (
                    <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: '14px', padding: '16px 20px', marginBottom: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                        <div>
                            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#059669', textTransform: 'uppercase' }}>Last Successful Submission</div>
                            {metrics?.lastSuccess ? (
                                <div style={{ marginTop: '4px', fontSize: '0.85rem', color: '#374151' }}>
                                    <strong>{metrics.lastSuccess.phone}</strong> &bull; {new Date(metrics.lastSuccess.time).toLocaleTimeString()}
                                    <div style={{ fontSize: '0.78rem', color: '#6B7280' }}>Req ID: <code>{metrics.lastSuccess.requestId}</code></div>
                                </div>
                            ) : <div style={{ fontSize: '0.85rem', color: '#9CA3AF' }}>None recorded yet</div>}
                        </div>

                        <div>
                            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#DC2626', textTransform: 'uppercase' }}>Last Gateway / Validation Failure</div>
                            {metrics?.lastFailure ? (
                                <div style={{ marginTop: '4px', fontSize: '0.85rem', color: '#374151' }}>
                                    <strong>{metrics.lastFailure.phone}</strong> &bull; {new Date(metrics.lastFailure.time).toLocaleTimeString()}
                                    <div style={{ fontSize: '0.78rem', color: '#DC2626', fontWeight: '600' }}>
                                        [{metrics.lastFailure.code}] {metrics.lastFailure.desc}
                                    </div>
                                </div>
                            ) : <div style={{ fontSize: '0.85rem', color: '#059669' }}>No recent failures ✓</div>}
                        </div>
                    </div>
                )}

                {/* Controlled Diagnostic Test Form (Admin Test Only) */}
                <div style={{ background: '#F8FAFC', border: '1px solid #CBD5E1', borderRadius: '16px', padding: '24px', marginBottom: '28px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0F172A', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>⚡</span> Send Controlled Test SMS
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '16px' }}>
                        Test mobile number normalization and verify MSG91 provider acceptance directly without sending to real customers.
                    </p>

                    <form onSubmit={handleSendTestSMS} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr)) 160px', gap: '12px', alignItems: 'flex-start' }}>
                        <div>
                            <input
                                type="text"
                                placeholder="Enter Test Mobile Number (e.g. 9555053405, +91 95550 53405)"
                                value={testPhone}
                                onChange={(e) => setTestPhone(e.target.value)}
                                required
                                style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
                            />
                            <span style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px', display: 'block' }}>
                                Accepts 10 digits, +91, spaces, hyphens. Rejects invalid formats.
                            </span>
                        </div>

                        <div>
                            <input
                                type="text"
                                placeholder="Optional custom test message"
                                value={testMsg}
                                onChange={(e) => setTestMsg(e.target.value)}
                                style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '0.9rem' }}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={testingSending}
                            style={{
                                padding: '12px 20px',
                                background: testingSending ? '#94A3B8' : '#2563EB',
                                color: 'white',
                                border: 'none',
                                borderRadius: '10px',
                                fontWeight: '700',
                                fontSize: '0.9rem',
                                cursor: testingSending ? 'not-allowed' : 'pointer',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {testingSending ? "Validating & Sending..." : "Run Test SMS"}
                        </button>
                    </form>

                    {/* Test Result Inspector */}
                    {testResult && (
                        <div style={{
                            marginTop: '16px', padding: '14px 18px', borderRadius: '12px', fontSize: '0.85rem',
                            background: testResult.success ? '#ECFDF5' : '#FEF2F2',
                            border: `1px solid ${testResult.success ? '#A7F3D0' : '#FECACA'}`,
                            color: testResult.success ? '#065F46' : '#991B1B'
                        }}>
                            <div style={{ fontWeight: '700', fontSize: '0.92rem', marginBottom: '6px' }}>
                                {testResult.success ? "✓ Test SMS Accepted by MSG91 Gateway" : "✗ Test SMS Failed / Rejected"}
                            </div>
                            {testResult.success ? (
                                <div>
                                    <div>Provider Request ID: <code>{testResult.providerRequestId}</code></div>
                                    <div>Recipient (E.164): <strong>{testResult.normalized?.formatted}</strong></div>
                                    <div style={{ fontSize: '0.78rem', color: '#047857', marginTop: '4px' }}>
                                        MSG91 accepted this submission into the carrier queue.
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <div>Error Code: <strong>{testResult.errorCode || "202"}</strong></div>
                                    <div>Description: {testResult.error || testResult.details?.error}</div>
                                    {testResult.validationError && (
                                        <div style={{ marginTop: '4px', fontStyle: 'italic' }}>
                                            The central validator safely rejected this request before calling the MSG91 API to prevent Error 202.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Audit Logs Table */}
                <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #E5E7EB', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflowX: 'auto' }}>
                    <div style={{ padding: '16px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: '700', margin: 0, color: '#1E293B' }}>
                            Live SMS Submission Logs (Last 100)
                        </h2>
                        <span style={{ fontSize: '0.8rem', color: '#64748B' }}>
                            Masked for privacy compliance
                        </span>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                        <thead style={{ background: '#F8FAFC', textAlign: 'left', borderBottom: '1px solid #E2E8F0' }}>
                            <tr>
                                <th style={{ padding: '12px 16px', color: '#475569' }}>Timestamp</th>
                                <th style={{ padding: '12px 16px', color: '#475569' }}>Recipient</th>
                                <th style={{ padding: '12px 16px', color: '#475569' }}>Event</th>
                                <th style={{ padding: '12px 16px', color: '#475569' }}>Message</th>
                                <th style={{ padding: '12px 16px', color: '#475569' }}>Gateway Status</th>
                                <th style={{ padding: '12px 16px', color: '#475569' }}>Provider Request ID</th>
                                <th style={{ padding: '12px 16px', color: '#475569' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{ padding: '30px', textAlign: 'center', color: '#64748B' }}>
                                        No SMS logs recorded yet.
                                    </td>
                                </tr>
                            ) : (
                                logs.map(log => (
                                    <tr key={log.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                        <td style={{ padding: '12px 16px', whiteSpace: 'nowrap', fontSize: '0.8rem', color: '#64748B' }}>
                                            {new Date(log.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                                        </td>
                                        <td style={{ padding: '12px 16px', fontWeight: '600', color: '#0F172A', whiteSpace: 'nowrap' }}>
                                            {log.maskedPhone}
                                        </td>
                                        <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                                            <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: '700', background: '#F1F5F9', color: '#475569' }}>
                                                {log.event}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px 16px', color: '#334155', maxWidth: '320px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={log.message}>
                                            {log.message}
                                        </td>
                                        <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                                            <span style={{
                                                padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700',
                                                background: log.status === 'Sent' ? '#DCFCE7' : log.status === 'Mock' ? '#FEF3C7' : log.status === 'Rejected' ? '#FEE2E2' : '#FFE4E6',
                                                color: log.status === 'Sent' ? '#166534' : log.status === 'Mock' ? '#92400E' : log.status === 'Rejected' ? '#991B1B' : '#BE123C'
                                            }}>
                                                {log.status === 'Rejected' ? '✗ Pre-Validated / Blocked' : log.status}
                                            </span>
                                            {log.errorDescription && (
                                                <div style={{ fontSize: '0.72rem', color: '#DC2626', marginTop: '3px', maxWidth: '240px' }} title={log.errorDescription}>
                                                    {log.errorCode ? `[${log.errorCode}] ` : ''}{log.errorDescription.slice(0, 45)}...
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: '0.78rem', color: '#475569' }}>
                                            {log.providerRequestId}
                                        </td>
                                        <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                                            {log.retryEligible && (
                                                <button
                                                    onClick={() => handleRetry(log)}
                                                    disabled={retryingId === log.id}
                                                    style={{
                                                        padding: '4px 10px', fontSize: '0.75rem', fontWeight: '600',
                                                        background: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE',
                                                        borderRadius: '6px', cursor: 'pointer'
                                                    }}
                                                >
                                                    {retryingId === log.id ? "Retrying..." : "Retry"}
                                                </button>
                                            )}
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
