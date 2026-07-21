"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { generateTallyXML } from "@/utils/tallyXmlGenerator";
import { hasPermission, ACTIONS } from "@/lib/rbac";

export default function AdminDashboard() {
    const { cartCount, toggleCart } = useCart();
    const { data: session, status } = useSession();
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [inventoryAlerts, setInventoryAlerts] = useState(null);
    const [pendingReturns, setPendingReturns] = useState(0);

    useEffect(() => {
        fetch("/api/admin/inventory-alerts?threshold=10")
            .then(r => r.json())
            .then(d => { if (d.success) setInventoryAlerts(d.summary); });
        fetch("/api/admin/returns?status=Pending")
            .then(r => r.json())
            .then(d => { if (d.success) setPendingReturns(d.returns.length); });
    }, []);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (status === 'authenticated') {
            // Customers cannot access the admin panel
            if (session?.user?.role === 'CUSTOMER') {
                router.push('/');
                return;
            }
            fetchOrders();
        }
    }, [status, router, session]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/orders');
            const data = await res.json();
            if (data.success) {
                setOrders(data.orders);
            } else {
                console.error("Failed to load orders:", data.error);
                alert("Failed to load orders: " + (data.error || "Unknown Error"));
            }
        } catch (error) {
            console.error("Failed to load orders", error);
            alert("Failed to connect to server: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleTallyExport = () => {
        if (!orders || orders.length === 0) {
            alert("No orders to export.");
            return;
        }

        try {
            const xmlContent = generateTallyXML(orders);
            const blob = new Blob([xmlContent], { type: "application/xml" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `orders-tally-${new Date().toISOString().slice(0, 10)}.xml`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Export failed", err);
            alert("Failed to generate Tally XML");
        }
    };

    if (status === 'loading' || loading) {
        return (
            <div style={{
                height: '100vh',
                background: '#090d16',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10B981',
                fontSize: '1.2rem',
                fontFamily: "'Inter', sans-serif",
                fontWeight: 'bold',
                letterSpacing: '1px'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '50px',
                        height: '50px',
                        border: '3px solid rgba(16, 185, 129, 0.1)',
                        borderTop: '3px solid #10B981',
                        borderRadius: '50%',
                        margin: '0 auto 20px',
                        animation: 'spin 1s linear infinite'
                    }} />
                    LOADING MANAGEMENT MATRIX...
                    <style jsx>{`
                        @keyframes spin {
                            to { transform: rotate(360deg); }
                        }
                    `}</style>
                </div>
            </div>
        );
    }

    return (
        <>
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />

            <div style={{
                minHeight: '100vh',
                background: 'radial-gradient(circle at top left, #052e16, #090d16, #05070f)',
                padding: '120px 20px 60px',
                fontFamily: "'Inter', sans-serif",
                color: '#f8fafc'
            }}>
                <main className="container" style={{ maxWidth: '1300px', margin: '0 auto' }}>
                    {/* Glowing Header Area */}
                    <div style={{
                        background: 'rgba(15, 23, 42, 0.45)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(16, 185, 129, 0.25)',
                        borderRadius: '24px',
                        padding: '30px',
                        marginBottom: '40px',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.3), 0 0 30px rgba(16, 185, 129, 0.05)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '20px'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                            <div>
                                <h1 style={{
                                    fontSize: '2rem',
                                    fontWeight: '800',
                                    background: 'linear-gradient(to right, #ffffff, #34d399)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    margin: 0,
                                    letterSpacing: '-0.5px'
                                }}>
                                    ADMIN DASHBOARD
                                </h1>
                                <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '5px 0 0 0' }}>
                                    System Command & Delivery Management Control Matrix
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    onClick={handleTallyExport}
                                    style={{
                                        background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                                        color: 'white',
                                        border: 'none',
                                        padding: '12px 20px',
                                        borderRadius: '12px',
                                        fontWeight: '700',
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 15px rgba(249, 115, 22, 0.2)',
                                        transition: 'all 0.3s'
                                    }}>
                                    Export to Tally
                                </button>
                                <button
                                    onClick={fetchOrders}
                                    style={{
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        color: 'white',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        padding: '12px 20px',
                                        borderRadius: '12px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s'
                                    }}>
                                    Refresh Matrix
                                </button>
                            </div>
                        </div>

                        {/* Navigation Grid */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                            gap: '10px'
                        }}>
                            {[
                                { name: "Inventory", path: "/admin/inventory", color: "#10B981", requiredAction: ACTIONS.VIEW_INVENTORY },
                                { name: "Approvals (Users)", path: "/admin/approvals", color: "#EF4444", requiredAction: ACTIONS.MANAGE_USERS },
                                { name: "👥 Staff Approvals", path: "/admin/staff-approvals", color: "#818cf8", requiredAction: ACTIONS.MANAGE_USERS },
                                { name: "Action Approvals", path: "/admin/action-approvals", color: "#EF4444", requiredAction: ACTIONS.MANAGE_PERMISSIONS },
                                { name: "Requests", path: "/admin/requests", color: "#3B82F6", requiredAction: ACTIONS.OVERSEE_SALES },
                                { name: "Subs", path: "/admin/subscriptions", color: "#059669", requiredAction: ACTIONS.OVERSEE_SALES },
                                { name: "Scripts", path: "/admin/prescriptions", color: "#8B5CF6", requiredAction: ACTIONS.VERIFY_PRESCRIPTIONS },
                                { name: "Finance", path: "/admin/finance", color: "#10B981", requiredAction: ACTIONS.MANAGE_FINANCES },
                                { name: "Analytics", path: "/admin/analytics", color: "#8B5CF6", requiredAction: ACTIONS.VIEW_ANALYTICS },
                                { name: "Insurance", path: "/admin/insurance", color: "#6366F1", requiredAction: ACTIONS.OVERSEE_SALES },
                                { name: "SMS History", path: "/admin/sms", color: "#F59E0B", requiredAction: ACTIONS.MANAGE_SETTINGS },
                                { name: "Sys Health", path: "/admin/system-health", color: "#EF4444", requiredAction: ACTIONS.MANAGE_SETTINGS },
                                { name: "Payouts", path: "/admin/withdrawals", color: "#1E3A8A", requiredAction: ACTIONS.MANAGE_FINANCES },
                                { name: "All Partners", path: "/admin/partners", color: "#8B5CF6", requiredAction: ACTIONS.MANAGE_USERS },
                                { name: `Returns ${pendingReturns > 0 ? `(${pendingReturns})` : ""}`, path: "/admin/returns", color: "#F43F5E", requiredAction: ACTIONS.PROCESS_APPROVED_RETURNS },
                                { name: "CRM", path: "/admin/crm", color: "#06B6D4", requiredAction: ACTIONS.VIEW_CUSTOMER_ORDERS },
                                { name: "B2B Leads", path: "/admin/b2b-leads", color: "#7C3AED", requiredAction: ACTIONS.OVERSEE_SALES },
                                { name: "📋 SOP Hub", path: "/admin/sop", color: "#10B981", requiredAction: ACTIONS.VIEW_ALL_REPORTS },
                                { name: "🛡️ BCP Board", path: "/admin/sop/bcp", color: "#8B5CF6", requiredAction: ACTIONS.VIEW_ALL_REPORTS },
                                { name: "📊 Reports", path: "/admin/sop/reports", color: "#6366f1", requiredAction: ACTIONS.VIEW_ALL_REPORTS },
                                { name: "ERP Hub", path: "/admin/erp/procurement", color: "#F59E0B", requiredAction: ACTIONS.VIEW_INVENTORY },
                                { name: "📈 Marketing", path: "/admin/bas/marketing/dashboard", color: "#EC4899", requiredAction: ACTIONS.VIEW_ANALYTICS },
                                { name: "🏷️ Coupons", path: "/admin/coupons", color: "#14B8A6", requiredAction: ACTIONS.OVERSEE_SALES },
                                { name: "📋 Audit Logs", path: "/admin/audit-logs", color: "#3B82F6", requiredAction: ACTIONS.VIEW_ALL_REPORTS },
                                { name: "👥 Staff Mgmt", path: "/admin/staff-management", color: "#6366F1", requiredAction: ACTIONS.MANAGE_USERS },
                                { name: "🛡️ Roles & Perms", path: "/admin/action-approvals", color: "#EF4444", requiredAction: ACTIONS.MANAGE_PERMISSIONS },
                                { name: "Appointments", path: "/admin/appointments", color: "#10B981", requiredAction: ACTIONS.OVERSEE_SALES },
                            ].filter(btn => !btn.requiredAction || hasPermission(session?.user?.role, btn.requiredAction)).map((btn) => (
                                <Link href={btn.path} key={btn.name} style={{
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    border: `1px solid rgba(255,255,255,0.06)`,
                                    borderRadius: '10px',
                                    padding: '10px',
                                    textAlign: 'center',
                                    color: 'white',
                                    textDecoration: 'none',
                                    fontSize: '0.85rem',
                                    fontWeight: '600',
                                    transition: 'all 0.3s'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.background = btn.color + '22';
                                    e.currentTarget.style.borderColor = btn.color;
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                                }}>
                                    {btn.name}
                                </Link>
                            ))}
                        </div>

                        {/* SOP Compliance Alert Widgets */}
                        {inventoryAlerts && (inventoryAlerts.critical > 0 || inventoryAlerts.low > 0) && (
                            <div style={{ marginTop: '20px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '16px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ width: '32px', height: '32px', background: 'rgba(239, 68, 68, 0.15)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444', fontSize: '14px' }}>⚠️</div>
                                    <span style={{ color: '#fca5a5', fontWeight: '700', fontSize: '0.85rem' }}>INVENTORY REORDER ALERTS</span>
                                </div>
                                {inventoryAlerts.critical > 0 && (
                                    <span style={{ background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', borderRadius: '8px', padding: '4px 12px', fontSize: '0.8rem', fontWeight: '700' }}>
                                        🔴 {inventoryAlerts.critical} OUT OF STOCK
                                    </span>
                                )}
                                {inventoryAlerts.low > 0 && (
                                    <span style={{ background: 'rgba(245, 158, 11, 0.2)', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b', borderRadius: '8px', padding: '4px 12px', fontSize: '0.8rem', fontWeight: '700' }}>
                                        🟡 {inventoryAlerts.low} LOW STOCK (≤5)
                                    </span>
                                )}
                                <Link href="/admin/inventory" style={{ marginLeft: 'auto', color: '#38bdf8', fontWeight: '700', fontSize: '0.8rem', textDecoration: 'none' }}>View All →</Link>
                            </div>
                        )}
                    </div>

                    {/* Table Container */}
                    <div style={{
                        background: 'rgba(15, 23, 42, 0.4)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '24px',
                        boxShadow: '0 20px 45px rgba(0,0,0,0.4)',
                        overflow: 'hidden'
                    }}>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                                        <th style={{ padding: '20px', fontSize: '0.85rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Order ID</th>
                                        <th style={{ padding: '20px', fontSize: '0.85rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Customer</th>
                                        <th style={{ padding: '20px', fontSize: '0.85rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Items & Value</th>
                                        <th style={{ padding: '20px', fontSize: '0.85rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Shipping Address</th>
                                        <th style={{ padding: '20px', fontSize: '0.85rem', fontWeight: '700', color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Secret Code</th>
                                        <th style={{ padding: '20px', fontSize: '0.85rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status Matrix</th>
                                        <th style={{ padding: '20px', fontSize: '0.85rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Invoice</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                                                No active orders detected in the network.
                                            </td>
                                        </tr>
                                    ) : (
                                        orders.map((order, idx) => (
                                            <tr key={order.id} style={{
                                                borderBottom: '1px solid rgba(255,255,255,0.05)',
                                                background: idx % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent',
                                                transition: 'background 0.2s'
                                            }}>
                                                <td style={{ padding: '20px', fontSize: '0.85rem', color: '#38bdf8', fontFamily: 'monospace' }}>
                                                    {order.id.slice(-8)}...
                                                </td>
                                                <td style={{ padding: '20px' }}>
                                                    <div style={{ fontWeight: '700', color: 'white' }}>{order.customer}</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '3px' }}>{order.phone}</div>
                                                </td>
                                                <td style={{ padding: '20px' }}>
                                                    <div style={{ fontWeight: '600', color: '#e2e8f0', fontSize: '0.9rem' }}>{order.items}</div>
                                                    <div style={{ color: '#10b981', fontWeight: '700', marginTop: '4px', fontSize: '0.95rem' }}>₹{order.total}</div>
                                                </td>
                                                <td style={{ padding: '20px', maxWidth: '250px', fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.4' }}>
                                                    {order.address}
                                                </td>
                                                <td style={{ padding: '20px' }}>
                                                    {order.deliveryCode ? (
                                                        <span style={{
                                                            background: 'rgba(16, 185, 129, 0.12)',
                                                            border: '1px solid rgba(16, 185, 129, 0.3)',
                                                            color: '#34d399',
                                                            padding: '6px 12px',
                                                            borderRadius: '8px',
                                                            fontFamily: 'monospace',
                                                            fontWeight: 'bold',
                                                            fontSize: '1rem',
                                                            letterSpacing: '1px'
                                                        }}>
                                                            {order.deliveryCode}
                                                        </span>
                                                    ) : (
                                                        <span style={{ color: '#64748b', fontSize: '0.85rem' }}>Verified ✓</span>
                                                    )}
                                                </td>
                                                <td style={{ padding: '20px' }}>
                                                    <span style={{
                                                        padding: '6px 12px',
                                                        borderRadius: '30px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: '700',
                                                        textTransform: 'uppercase',
                                                        letterSpacing: '0.5px',
                                                        background: order.status === 'Processing' ? 'rgba(245, 158, 11, 0.12)' : order.status === 'Delivered' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(59, 130, 246, 0.12)',
                                                        border: order.status === 'Processing' ? '1px solid rgba(245, 158, 11, 0.3)' : order.status === 'Delivered' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(59, 130, 246, 0.3)',
                                                        color: order.status === 'Processing' ? '#fbbf24' : order.status === 'Delivered' ? '#34d399' : '#60a5fa'
                                                    }}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '20px' }}>
                                                    <button
                                                        onClick={() => window.open(`/order/${order.id}/invoice`, '_blank')}
                                                        style={{
                                                            padding: '8px 14px',
                                                            fontSize: '0.8rem',
                                                            cursor: 'pointer',
                                                            background: 'rgba(255,255,255,0.06)',
                                                            color: 'white',
                                                            border: '1px solid rgba(255,255,255,0.1)',
                                                            borderRadius: '8px',
                                                            fontWeight: '600',
                                                            transition: 'all 0.3s'
                                                        }}
                                                        onMouseOver={(e) => {
                                                            e.currentTarget.style.background = 'white';
                                                            e.currentTarget.style.color = 'black';
                                                        }}
                                                        onMouseOut={(e) => {
                                                            e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                                                            e.currentTarget.style.color = 'white';
                                                        }}>
                                                        View
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}
