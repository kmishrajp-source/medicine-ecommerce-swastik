"use client";
import Navbar from "@/components/Navbar";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Profile() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [orders, setOrders] = useState([]);
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (session) {
            // Fetch User Profile (Wallet, Code)
            fetch('/api/user/me')
                .then(res => res.json())
                .then(data => {
                    if (data.success) setProfile(data.user);
                });

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
                {profile && (
                    <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: 'white', padding: '30px', borderRadius: '16px', marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                        <div>
                            <h2 style={{ fontSize: '2rem', marginBottom: '5px' }}>Hello, {profile.name}</h2>
                            <p style={{ opacity: 0.8 }}>{profile.email}</p>
                        </div>
                        <div style={{ display: 'flex', gap: '30px' }}>
                            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '15px 25px', borderRadius: '12px' }}>
                                <div style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '5px' }}>Wallet Balance</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#4ade80' }}>₹{profile.walletBalance.toFixed(2)}</div>
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '15px 25px', borderRadius: '12px' }}>
                                <div style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '5px' }}>Your Referral Code</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', letterSpacing: '1px', color: '#fbbf24' }}>
                                    {profile.referralCode || 'Generating...'}
                                </div>
                                <div style={{ fontSize: '0.7rem', opacity: 0.6, marginTop: '5px' }}>Share this to earn ₹50!</div>
                            </div>
                        </div>
                    </div>
                )}

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
                                    <th style={{ padding: '10px' }}>Invoice</th>
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
                                        <td style={{ padding: '10px' }}>
                                            <button
                                                onClick={() => window.open(`/order/${order.id}/invoice`, '_blank')}
                                                style={{ padding: '6px 12px', fontSize: '0.8rem', cursor: 'pointer', background: '#333', color: 'white', border: 'none', borderRadius: '4px' }}
                                            >
                                                View Bill
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <h2 style={{ marginBottom: '20px', marginTop: '40px' }}>My Appointments</h2>
                <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                    <PatientAppointments />
                </div>
            </div>
        </>
    );
}

function PatientAppointments() {
    const [appointments, setAppointments] = useState([]);

    useEffect(() => {
        fetch('/api/appointments').then(res => res.json()).then(data => {
            if (data.success) setAppointments(data.appointments);
        });
    }, []);

    if (appointments.length === 0) return <p>No scheduled appointments.</p>;

    return (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid #eee' }}>
                    <th style={{ padding: '10px' }}>Doctor</th>
                    <th style={{ padding: '10px' }}>Date</th>
                    <th style={{ padding: '10px' }}>Status</th>
                    <th style={{ padding: '10px' }}>Action</th>
                </tr>
            </thead>
            <tbody>
                {appointments.map(appt => (
                    <tr key={appt.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '10px' }}>Dr. {appt.doctor?.user?.name}</td>
                        <td style={{ padding: '10px' }}>{new Date(appt.date).toLocaleString()}</td>
                        <td style={{ padding: '10px' }}>{appt.status}</td>
                        <td style={{ padding: '10px' }}>
                            <button onClick={() => window.location.href = `/meet/${appt.id}`} style={{
                                background: '#7C3AED', color: 'white', padding: '6px 12px',
                                borderRadius: '4px', textDecoration: 'none', fontSize: '0.9rem', border: 'none', cursor: 'pointer'
                            }}>
                                <i className="fa-solid fa-video"></i> Join Call
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

