"use client";
import Navbar from "@/components/Navbar";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";

export default function Profile() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { addToCart } = useCart();
    const [orders, setOrders] = useState([]);
    const [profile, setProfile] = useState(null);
    const [prescriptions, setPrescriptions] = useState([]);

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

            // Fetch Real-Time Order History from Postgres
            fetch('/api/user/orders')
                .then(res => res.json())
                .then(data => {
                    if (data.success) setOrders(data.orders);
                });

            // Fetch E-Prescriptions
            fetch('/api/user/prescriptions')
                .then(res => res.json())
                .then(data => {
                    if (data.success) setPrescriptions(data.prescriptions);
                });
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

                <h2 style={{ marginBottom: '20px' }}>📄 My E-Prescriptions</h2>
                <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: 'var(--shadow-sm)', marginBottom: '40px' }}>
                    {prescriptions.length === 0 ? (
                        <p>No prescriptions uploaded.</p>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                            {prescriptions.map(rx => {
                                let meds = [];
                                if (rx.medicines) {
                                    try {
                                        meds = JSON.parse(rx.medicines);
                                        if (!Array.isArray(meds)) meds = [meds];
                                    } catch(e) {
                                        meds = [rx.medicines];
                                    }
                                }
                                return (
                                    <div key={rx.id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', position: 'relative' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                            <strong>{new Date(rx.createdAt).toLocaleDateString()}</strong>
                                            <span style={{ 
                                                fontSize: '0.8rem', padding: '4px 8px', borderRadius: '12px', fontWeight: 'bold',
                                                background: rx.status === 'Processed' ? '#dcfce7' : '#fef3c7',
                                                color: rx.status === 'Processed' ? '#166534' : '#d97706'
                                            }}>{rx.status}</span>
                                        </div>
                                        {rx.doctor && <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '15px' }}>Reviewed by: Dr. {rx.doctor.user?.name}</p>}
                                        
                                        {rx.status === 'Processed' && meds.length > 0 ? (
                                            <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', marginBottom: '15px' }}>
                                                <strong style={{ fontSize: '0.9rem' }}>Prescribed Medicines:</strong>
                                                <ul style={{ paddingLeft: '20px', fontSize: '0.9rem', color: '#334155', marginTop: '5px' }}>
                                                    {meds.map((m, idx) => (
                                                        <li key={idx}>{m}</li>
                                                    ))}
                                                </ul>
                                                <button 
                                                    onClick={() => {
                                                        // Auto-add to cart - simulate searching for product by name or just adding as generic items
                                                        meds.forEach(med => {
                                                            addToCart({
                                                                id: `rx-${rx.id}-${med.substring(0,5)}`,
                                                                name: med,
                                                                price: 0, // Requires manual price update by admin/pharmacist later, or fuzzy search
                                                                image: "https://via.placeholder.com/150?text=Rx+Med",
                                                                isRx: true
                                                            });
                                                        });
                                                        router.push('/cart');
                                                        alert("Medicines added to cart! A pharmacist will verify prices before final billing.");
                                                    }}
                                                    style={{ width: '100%', background: '#2563eb', color: 'white', padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}>
                                                    <i className="fa-solid fa-cart-plus"></i> Auto-Add to Cart
                                                </button>
                                            </div>
                                        ) : (
                                            <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Pending doctor review.</p>
                                        )}
                                        <a href={rx.imageUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'block', textAlign: 'center', color: '#3b82f6', fontSize: '0.9rem', textDecoration: 'none', fontWeight: 'bold' }}>
                                            <i className="fa-solid fa-file-image"></i> View Document
                                        </a>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <h2 style={{ marginBottom: '20px' }}>📦 My Order History</h2>
                <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                    {orders.length === 0 ? (
                        <p>No orders found.</p>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #E2E8F0', textAlign: 'left', background: '#F8FAFC' }}>
                                    <th style={{ padding: '12px 10px', fontSize: '0.82em', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Order ID</th>
                                    <th style={{ padding: '12px 10px', fontSize: '0.82em', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Date</th>
                                    <th style={{ padding: '12px 10px', fontSize: '0.82em', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Items Total</th>
                                    <th style={{ padding: '12px 10px', fontSize: '0.82em', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>🚚 Delivery</th>
                                    <th style={{ padding: '12px 10px', fontSize: '0.82em', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Grand Total</th>
                                    <th style={{ padding: '12px 10px', fontSize: '0.82em', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Status</th>
                                    <th style={{ padding: '12px 10px', fontSize: '0.82em', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(order => {
                                    const deliveryFee = order.deliveryFee ?? 0;
                                    const itemsTotal = order.total - deliveryFee;
                                    return (
                                        <tr key={order.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                            <td style={{ padding: '12px 10px', fontWeight: '700', color: '#1E293B' }}>SM{order.id.slice(-6).toUpperCase()}</td>
                                            <td style={{ padding: '12px 10px', color: '#64748B', fontSize: '0.88em' }}>
                                                {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td style={{ padding: '12px 10px', fontWeight: '600' }}>₹{itemsTotal.toFixed(2)}</td>
                                            <td style={{ padding: '12px 10px', fontWeight: '600', color: deliveryFee === 0 ? '#16A34A' : '#B45309' }}>
                                                {deliveryFee === 0 ? '✅ FREE' : `₹${deliveryFee.toFixed(2)}`}
                                            </td>
                                            <td style={{ padding: '12px 10px', fontWeight: '800', color: '#0D8ABC', fontSize: '1em' }}>₹{order.total.toFixed(2)}</td>
                                            <td style={{ padding: '12px 10px' }}>
                                                <span style={{
                                                    padding: '4px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: '700',
                                                    background: order.status === 'Delivered' ? '#DCFCE7' : '#DBEAFE',
                                                    color: order.status === 'Delivered' ? '#15803D' : '#1D4ED8'
                                                }}>
                                                    {order.status.replace(/_/g, ' ')}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px 10px' }}>
                                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                    <button
                                                        onClick={() => router.push(`/order/${order.id}/invoice`)}
                                                        style={{ padding: '6px 12px', fontSize: '0.78rem', cursor: 'pointer', background: '#0D8ABC', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', whiteSpace: 'nowrap' }}
                                                    >
                                                        📄 Invoice
                                                    </button>
                                                    <button
                                                        onClick={() => router.push(`/track/${order.id}`)}
                                                        style={{ padding: '6px 12px', fontSize: '0.78rem', cursor: 'pointer', background: '#3B82F6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', whiteSpace: 'nowrap' }}
                                                    >
                                                        📍 Track
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
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

