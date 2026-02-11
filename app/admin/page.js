"use client";
import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import { useCart } from "../../context/CartContext";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminDashboard() {
    const { cartCount, toggleCart } = useCart();
    const { data: session, status } = useSession(); // Access session properly
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Temporarily allow all logged-in users to see dashboard for testing
        if (status === 'unauthenticated') {
            router.push('/login');
        } else {
            fetchOrders();
        }
    }, [status, router]);

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

    const updateStatus = async (id, newStatus) => {
        // TODO: Implement API for status update
        // For now just update UI locally to show interaction
        const updatedOrders = orders.map(o => o.id === id ? { ...o, status: newStatus } : o);
        setOrders(updatedOrders);
        alert(`Order ${id} marked as ${newStatus} (Local update only for now)`);
    };

    if (status === 'loading' || loading) return <div style={{ padding: '100px', textAlign: 'center' }}>Loading Admin Panel...</div>;

    return (
        <>
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />

            <main className="container" style={{ marginTop: '100px', paddingBottom: '60px', maxWidth: '1200px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h2 style={{ fontSize: '2rem' }}>Delivery Management Dashboard</h2>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <Link href="/admin/inventory" className="btn btn-primary">Manage Inventory</Link>
                        <Link href="/admin/approvals" className="btn btn-primary" style={{ background: '#DC2626' }}>Approvals</Link>
                        <Link href="/admin/requests" className="btn btn-primary" style={{ background: '#2563EB' }}>Requests</Link>
                        <Link href="/admin/subscriptions" className="btn btn-primary" style={{ background: '#059669' }}>Subs</Link>
                        <Link href="/admin/prescriptions" className="btn btn-primary" style={{ background: '#7C3AED' }}>Scripts</Link>
                        <Link href="/admin/finance" className="btn btn-primary" style={{ background: '#10B981' }}>Finance</Link>
                        <Link href="/admin/analytics" className="btn btn-primary" style={{ background: '#7C3AED' }}>Analytics</Link>
                        <Link href="/admin/sms" className="btn btn-primary" style={{ background: '#F59E0B', color: 'black' }}>SMS History</Link>
                        <button
                            onClick={fetchOrders}
                            className="btn btn-secondary"
                            disabled={loading}
                        >
                            {loading ? 'Refreshing...' : 'Refresh'}
                        </button>
                    </div>
                </div>

                {/* Orders Table */}
                <div style={{ background: 'white', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
                        <thead style={{ background: 'var(--bg-light)', textAlign: 'left' }}>
                            <tr>
                                <th style={{ padding: '16px' }}>Order ID</th>
                                <th style={{ padding: '16px' }}>Customer</th>
                                <th style={{ padding: '16px' }}>Items & Total</th>
                                <th style={{ padding: '16px' }}>Delivery Address</th>
                                <th style={{ padding: '16px', color: 'red' }}>Secret Code</th>
                                <th style={{ padding: '16px' }}>Status</th>
                                <th style={{ padding: '16px' }}>Invoice</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.length === 0 ? (
                                <tr><td colSpan="6" style={{ padding: '20px', textAlign: 'center' }}>No orders found in Database.</td></tr>
                            ) : (
                                orders.map(order => (
                                    <tr key={order.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '16px', fontSize: '0.85rem', color: '#666' }}>{order.id.slice(-6)}...</td>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ fontWeight: 'bold' }}>{order.customer}</div>
                                            <div style={{ fontSize: '0.85rem', color: '#666' }}>{order.phone}</div>
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ fontWeight: 'bold' }}>{order.items}</div>
                                            <div style={{ color: 'var(--primary)' }}>₹{order.total}</div>
                                        </td>
                                        <td style={{ padding: '16px', maxWidth: '250px', fontSize: '0.9rem' }}>
                                            {order.address}
                                        </td>
                                        <td style={{ padding: '16px', fontWeight: 'bold', fontSize: '1.2rem', color: '#D32F2F' }}>
                                            {order.deliveryCode || "N/A"}
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <span style={{
                                                padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600,
                                                background: order.status === 'Processing' ? '#FEF3C7' : order.status === 'Delivered' ? '#D1FAE5' : '#E0F2F1',
                                                color: order.status === 'Processing' ? '#D97706' : order.status === 'Delivered' ? '#059669' : '#0D8ABC'
                                            }}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <button
                                                onClick={() => window.open(`/order/${order.id}/invoice`, '_blank')}
                                                style={{ padding: '6px 12px', fontSize: '0.8rem', cursor: 'pointer', background: '#333', color: 'white', border: 'none', borderRadius: '4px' }}
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </>
    );
}
