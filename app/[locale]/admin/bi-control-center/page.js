"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function BIControlCenter() {
    const { cartCount, toggleCart } = useCart();
    const { data: session, status } = useSession();
    const router = useRouter();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lastRefresh, setLastRefresh] = useState(null);

    useEffect(() => {
        if (status === 'unauthenticated') router.push('/login');
        else if (status === 'authenticated') {
            if (session?.user?.role !== 'ADMIN') { router.push('/'); return; }
            fetchData();
        }
    }, [status, router, session]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/bi-control-center');
            const json = await res.json();
            if (json.success) {
                setData(json.data);
                setLastRefresh(new Date());
            }
        } catch (e) {
            console.error('BI fetch failed:', e);
        } finally {
            setLoading(false);
        }
    };

    // Auto-refresh every 30 seconds
    useEffect(() => {
        if (!data) return;
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, [data]);

    const healthColor = (s) => s === 'GREEN' ? '#10B981' : s === 'YELLOW' ? '#F59E0B' : '#EF4444';
    const healthGlow = (s) => s === 'GREEN' ? 'rgba(16,185,129,0.3)' : s === 'YELLOW' ? 'rgba(245,158,11,0.3)' : 'rgba(239,68,68,0.3)';

    if (status === 'loading' || loading) {
        return (
            <div style={{ height: '100vh', background: '#060a13', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981', fontFamily: "'Inter', sans-serif" }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ width: 60, height: 60, border: '3px solid rgba(16,185,129,0.15)', borderTop: '3px solid #10B981', borderRadius: '50%', margin: '0 auto 24px', animation: 'spin 1s linear infinite' }} />
                    <div style={{ fontSize: '0.85rem', fontWeight: 800, letterSpacing: '3px', textTransform: 'uppercase' }}>Initializing BI Control Center...</div>
                    <style jsx>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </div>
            </div>
        );
    }

    const d = data || { revenue: {}, b2b: {}, logistics: {}, bioinformatics: {}, users: {}, operations: {}, activityFeed: [], systemHealth: {} };

    return (
        <>
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />
            <div style={{ minHeight: '100vh', background: 'radial-gradient(ellipse at top left, #0a1628 0%, #060a13 50%, #070d18 100%)', padding: '110px 20px 60px', fontFamily: "'Inter', sans-serif", color: '#f8fafc' }}>
                <main style={{ maxWidth: 1440, margin: '0 auto' }}>

                    {/* ── HEADER ──────────────────────────────────────────── */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 36 }}>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                                <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 12px rgba(16,185,129,0.6)', animation: 'pulse 2s ease-in-out infinite' }} />
                                <span style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '4px', textTransform: 'uppercase', color: '#10B981' }}>Live • Unified Intelligence</span>
                            </div>
                            <h1 style={{ fontSize: '2.2rem', fontWeight: 900, background: 'linear-gradient(135deg, #ffffff 0%, #34d399 50%, #06b6d4 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0, letterSpacing: '-1px' }}>
                                BI Control Center
                            </h1>
                            <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: 4 }}>
                                Cross-platform aggregation • Revenue · Logistics · B2B · Genomics · AI
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                            {lastRefresh && (
                                <span style={{ fontSize: '0.7rem', color: '#475569', fontWeight: 600 }}>
                                    Last sync: {lastRefresh.toLocaleTimeString()}
                                </span>
                            )}
                            <button onClick={fetchData} style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399', padding: '10px 20px', borderRadius: 12, fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', letterSpacing: '1px', textTransform: 'uppercase', transition: 'all 0.2s' }}>
                                ↻ Refresh
                            </button>
                            <Link href="/admin" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', padding: '10px 20px', borderRadius: 12, fontWeight: 600, fontSize: '0.75rem', textDecoration: 'none', transition: 'all 0.2s' }}>
                                ← Back to Admin
                            </Link>
                        </div>
                    </div>

                    {/* ── SYSTEM HEALTH MATRIX ────────────────────────────── */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 32 }}>
                        {Object.values(d.systemHealth).map((sys, i) => (
                            <div key={i} style={{ background: 'rgba(15,23,42,0.6)', border: `1px solid ${healthColor(sys.status)}33`, borderRadius: 16, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: `0 0 20px ${healthGlow(sys.status)}` }}>
                                <div style={{ width: 12, height: 12, borderRadius: '50%', background: healthColor(sys.status), boxShadow: `0 0 8px ${healthGlow(sys.status)}`, flexShrink: 0 }} />
                                <div>
                                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: healthColor(sys.status), letterSpacing: '0.5px' }}>{sys.status}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>{sys.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ── PRIMARY KPI CARDS ────────────────────────────────── */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 32 }}>
                        {[
                            { label: 'Total Revenue', value: `₹${(d.revenue.totalRevenue || 0).toLocaleString('en-IN')}`, sub: `This month: ₹${(d.revenue.monthRevenue || 0).toLocaleString('en-IN')}`, color: '#10B981', icon: '💰' },
                            { label: 'Total Orders', value: d.revenue.totalOrders || 0, sub: `Today: ${d.revenue.todayOrders || 0} • Pending: ${d.revenue.pendingOrders || 0}`, color: '#3B82F6', icon: '📦' },
                            { label: 'Delivery Rate', value: `${d.logistics.deliveryRate || 0}%`, sub: `${d.logistics.completedDeliveryJobs || 0} / ${d.logistics.totalDeliveryJobs || 0} jobs`, color: '#8B5CF6', icon: '🚀' },
                            { label: 'Active Riders', value: d.logistics.activeRiders || 0, sub: 'Currently online', color: '#06B6D4', icon: '🏍️' },
                            { label: 'B2B RFQs', value: d.b2b.rfqCount || 0, sub: `${d.b2b.activeRetailers || 0} verified retailers`, color: '#F59E0B', icon: '🏭' },
                            { label: 'Genomic Datasets', value: d.bioinformatics.totalDatasets || 0, sub: `${d.bioinformatics.processedDatasets || 0} processed • ${d.bioinformatics.activeJobs || 0} active`, color: '#EC4899', icon: '🧬' },
                        ].map((kpi, i) => (
                            <div key={i} style={{ background: 'linear-gradient(145deg, rgba(15,23,42,0.8), rgba(15,23,42,0.4))', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 24, position: 'relative', overflow: 'hidden' }}>
                                <div style={{ position: 'absolute', top: -10, right: -10, fontSize: '4rem', opacity: 0.06 }}>{kpi.icon}</div>
                                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: kpi.color, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 8 }}>{kpi.label}</div>
                                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-1px', lineHeight: 1 }}>{kpi.value}</div>
                                <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, marginTop: 8 }}>{kpi.sub}</div>
                            </div>
                        ))}
                    </div>

                    {/* ── TWO COLUMN: USERS/OPS + ACTIVITY FEED ──────────── */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 20, marginBottom: 32 }}>

                        {/* LEFT: Users & Operations */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {/* User Growth Card */}
                            <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 24 }}>
                                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#06B6D4', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 16 }}>👤 User Growth</div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                                    {[
                                        { label: 'Total', value: d.users.totalUsers || 0 },
                                        { label: 'Today', value: `+${d.users.newUsersToday || 0}` },
                                        { label: 'This Month', value: `+${d.users.newUsersMonth || 0}` },
                                    ].map((m, i) => (
                                        <div key={i} style={{ textAlign: 'center' }}>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff' }}>{m.value}</div>
                                            <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 700 }}>{m.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Operations Card */}
                            <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 24 }}>
                                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#F59E0B', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 16 }}>⚙️ Operations</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                    {[
                                        { label: 'Pending Prescriptions', value: d.operations.pendingRx || 0, color: '#8B5CF6' },
                                        { label: 'Active Ambulances', value: d.operations.activeAmbulances || 0, color: '#EF4444' },
                                        { label: 'Open Complaints', value: d.operations.openComplaints || 0, color: '#F43F5E' },
                                        { label: 'Delivered Orders', value: d.revenue.deliveredOrders || 0, color: '#10B981' },
                                    ].map((op, i) => (
                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                            <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>{op.label}</span>
                                            <span style={{ fontSize: '1.1rem', fontWeight: 900, color: op.color }}>{op.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Quick Links */}
                            <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 24 }}>
                                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#818CF8', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 14 }}>🔗 Quick Links</div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                    {[
                                        { label: 'Inventory', href: '/admin/inventory' },
                                        { label: 'Finance', href: '/admin/finance' },
                                        { label: 'Logistics', href: '/admin/logistics' },
                                        { label: 'AI Command', href: '/admin/ai-command-center' },
                                        { label: 'Riders', href: '/admin/riders' },
                                        { label: 'Settlements', href: '/admin/settlements' },
                                    ].map((lnk, i) => (
                                        <Link key={i} href={lnk.href} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '10px 14px', fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textDecoration: 'none', textAlign: 'center', transition: 'all 0.2s' }}>
                                            {lnk.label}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: Live Activity Feed */}
                        <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 24, display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#34D399', letterSpacing: '2px', textTransform: 'uppercase' }}>📡 Live Activity Feed</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', animation: 'pulse 2s ease-in-out infinite' }} />
                                    <span style={{ fontSize: '0.6rem', color: '#475569', fontWeight: 700 }}>STREAMING</span>
                                </div>
                            </div>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
                                {d.activityFeed.length === 0 ? (
                                    <div style={{ color: '#475569', fontSize: '0.8rem', textAlign: 'center', padding: '40px 0' }}>No recent activity</div>
                                ) : (
                                    d.activityFeed.map((event, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 16px', background: i % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'transparent', borderRadius: 12, transition: 'background 0.2s' }}>
                                            <div style={{ fontSize: '1.3rem', flexShrink: 0, marginTop: 2 }}>{event.icon}</div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontSize: '0.78rem', color: '#e2e8f0', fontWeight: 600, lineHeight: 1.4 }}>{event.message}</div>
                                                <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                                                    <span style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600 }}>{event.user}</span>
                                                    <span style={{ fontSize: '0.65rem', color: '#475569' }}>{new Date(event.time).toLocaleString()}</span>
                                                </div>
                                            </div>
                                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: event.type === 'ORDER' ? '#3B82F6' : event.type === 'BIO' ? '#EC4899' : '#10B981', flexShrink: 0, marginTop: 6 }} />
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── REVENUE VISUALIZATION BAR (CSS ONLY) ─────────── */}
                    <div style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 28, marginBottom: 32 }}>
                        <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#10B981', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: 20 }}>📊 Revenue & Platform Distribution</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                            {/* Revenue Breakdown */}
                            <div>
                                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', marginBottom: 12 }}>Order Value Distribution</div>
                                {[
                                    { label: 'Delivered', pct: d.revenue.totalOrders > 0 ? Math.round((d.revenue.deliveredOrders / d.revenue.totalOrders) * 100) : 0, color: '#10B981' },
                                    { label: 'Pending', pct: d.revenue.totalOrders > 0 ? Math.round((d.revenue.pendingOrders / d.revenue.totalOrders) * 100) : 0, color: '#F59E0B' },
                                    { label: 'B2B Volume', pct: d.revenue.totalOrders > 0 ? Math.min(100, Math.round((d.b2b.rfqCount / d.revenue.totalOrders) * 100)) : 0, color: '#8B5CF6' },
                                ].map((bar, i) => (
                                    <div key={i} style={{ marginBottom: 14 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: 700, color: '#64748b', marginBottom: 6 }}>
                                            <span>{bar.label}</span>
                                            <span style={{ color: bar.color }}>{bar.pct}%</span>
                                        </div>
                                        <div style={{ height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden' }}>
                                            <div style={{ height: '100%', width: `${bar.pct}%`, background: `linear-gradient(90deg, ${bar.color}, ${bar.color}88)`, borderRadius: 4, transition: 'width 1s ease' }} />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Logistics Split */}
                            <div>
                                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', marginBottom: 12 }}>Logistics Provider Split</div>
                                {[
                                    { label: 'Swastik Riders', pct: 65, color: '#10B981' },
                                    { label: 'External 3PL', pct: 20, color: '#3B82F6' },
                                    { label: 'Retailer Self-Delivery', pct: 10, color: '#F59E0B' },
                                    { label: 'Customer Pickup', pct: 5, color: '#64748b' },
                                ].map((bar, i) => (
                                    <div key={i} style={{ marginBottom: 14 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', fontWeight: 700, color: '#64748b', marginBottom: 6 }}>
                                            <span>{bar.label}</span>
                                            <span style={{ color: bar.color }}>{bar.pct}%</span>
                                        </div>
                                        <div style={{ height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden' }}>
                                            <div style={{ height: '100%', width: `${bar.pct}%`, background: `linear-gradient(90deg, ${bar.color}, ${bar.color}88)`, borderRadius: 4, transition: 'width 1s ease' }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div style={{ textAlign: 'center', color: '#334155', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', paddingTop: 20 }}>
                        Swastik Medicare • Unified Business Intelligence • {new Date().getFullYear()}
                    </div>

                </main>
            </div>
            <style jsx>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
            `}</style>
        </>
    );
}
