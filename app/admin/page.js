"use client";
import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import { useCart } from "../../context/CartContext";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminDashboard() {
    const { cartCount, toggleCart } = useCart();
    const { data: session, status } = useSession() || {};
    const router = useRouter();
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (session?.user?.role !== 'ADMIN') {
            // router.push('/'); // Optional: redirect non-admins
        } else {
            loadOrders();
        }
    }, [status, session, router]);

    const loadOrders = () => {
        const savedOrders = JSON.parse(localStorage.getItem('swastik_orders') || '[]');
        setOrders(savedOrders);
    };

    const updateStatus = (id, newStatus) => {
        const updatedOrders = orders.map(o => o.id === id ? { ...o, status: newStatus } : o);
        setOrders(updatedOrders);
        localStorage.setItem('swastik_orders', JSON.stringify(updatedOrders));
    };

    if (status === 'loading') return <div style={{ padding: '100px', textAlign: 'center' }}>Loading...</div>;

    if (!session || session.user.role !== 'ADMIN') {
        return (
            <>
                <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />
                <main className="container" style={{ marginTop: '100px', textAlign: 'center' }}>
                    <h2>Access Denied</h2>
                    <p>You need admin privileges to view this page.</p>
                </main>
            </>
        );
    }

    return (
        <>
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />

            <main className="container" style={{ marginTop: '100px', paddingBottom: '60px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h2 style={{ fontSize: '2rem' }}>Admin Dashboard</h2>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <Link href="/admin/inventory" className="btn btn-secondary">Manage Inventory</Link>
                    </div>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                    <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }}>
                        <h4 style={{ color: 'var(--text-light)', marginBottom: '10px' }}>Total Orders</h4>
                        <div style={{ fontSize: '2rem', fontWeight: 700 }}>{orders.length}</div>
                    </div>
                    <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }}>
                        <h4 style={{ color: 'var(--text-light)', marginBottom: '10px' }}>Pending Delivery</h4>
                        <div style={{ fontSize: '2rem', fontWeight: 700, color: '#F59E0B' }}>{orders.filter(o => o.status !== 'Delivered').length}</div>
                    </div>
                </div>

                {/* Orders Table */}
                <div style={{ background: 'white', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
                    <div style={{ padding: '20px', borderBottom: '1px solid #eee', fontWeight: 700 }}>Recent Orders</div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                            <thead style={{ background: 'var(--bg-light)', textAlign: 'left' }}>
                                <tr>
                                    <th style={{ padding: '16px' }}>Order ID</th>
                                    <th style={{ padding: '16px' }}>Date</th>
                                    <th style={{ padding: '16px' }}>Total</th>
                                    <th style={{ padding: '16px' }}>Status</th>
                                    <th style={{ padding: '16px' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.length === 0 ? (
                                    <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center' }}>No orders yet.</td></tr>
                                ) : (
                                    orders.map(order => (
                                        <tr key={order.id} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: '16px' }}>{order.id}</td>
                                            <td style={{ padding: '16px' }}>{order.date}</td>
                                            <td style={{ padding: '16px' }}>₹{order.total.toFixed(2)}</td>
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
                                                {order.status !== 'Delivered' && (
                                                    <button
                                                        onClick={() => updateStatus(order.id, 'Delivered')}
                                                        style={{ color: 'var(--primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
                                                    >
                                                        Mark Delivered
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
            </main>
        </>
    );
}
