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
                                <tr style={{ borderBottom: '1px solid #eee', textAlign: 'left' }}>
                                    <th style={{ padding: '10px' }}>Order ID</th>
                                    <th style={{ padding: '10px' }}>Date</th>
                                    <th style={{ padding: '10px' }}>Total</th>
                                    <th style={{ padding: '10px' }}>Status</th>
                                    <th style={{ padding: '10px' }}>Tracking</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map(order => (
                                    <tr key={order.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '10px', fontWeight: 'bold' }}>{order.id.slice(-6).toUpperCase()}</td>
                                        <td style={{ padding: '10px' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td style={{ padding: '10px' }}>₹{order.total.toFixed(2)}</td>
                                        <td style={{ padding: '10px' }}>
                                            <span style={{
                                                padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold',
                                                background: order.status === 'Delivered' ? '#E8F5E9' : '#E3F2FD',
                                                color: order.status === 'Delivered' ? '#2E7D32' : '#1565C0'
                                            }}>
                                                {order.status.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td style={{ padding: '10px', display: 'flex', gap: '10px' }}>
                                            <button
                                                onClick={() => router.push(`/track/${order.id}`)}
                                                style={{ padding: '6px 12px', fontSize: '0.8rem', cursor: 'pointer', background: '#3B82F6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}
                                            >
                                                <i className="fa-solid fa-location-dot"></i> Track Map
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

