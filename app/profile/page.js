"use client";
import Navbar from "@/components/Navbar";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Profile() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (session) {
            // In real app, fetch from DB using session.user.id
            // For now, loading from localStorage mimic
            const allOrders = JSON.parse(localStorage.getItem('swastik_orders') || '[]');
            setOrders(allOrders); // Showing all orders for demo purpose or filter by ID if we stored it
        }
    }, [status, session]);

    if (status === 'loading') return <div>Loading...</div>;

    if (!session) return null;

    return (
        <>
            <Navbar cartCount={0} openCart={() => { }} />
            <div className="container" style={{ marginTop: '100px' }}>
                <h2 style={{ marginBottom: '20px' }}>My Order History</h2>
                <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                    {orders.length === 0 ? (
                        <p>No orders found.</p>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #eee', textAlign: 'left' }}>
                                    <th style={{ padding: '10px' }}>Order ID</th>
                                    <th style={{ padding: '10px' }}>Date</th>
                                    <th style={{ padding: '10px' }}>Total</th>
                                    <th style={{ padding: '10px' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(order => (
                                    <tr key={order.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '10px' }}>{order.id}</td>
                                        <td style={{ padding: '10px' }}>{order.date}</td>
                                        <td style={{ padding: '10px' }}>₹{order.total.toFixed(2)}</td>
                                        <td style={{ padding: '10px' }}>
                                            <span style={{
                                                padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem',
                                                background: '#E0F2F1', color: '#0D8ABC'
                                            }}>{order.status}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </>
    );
}
