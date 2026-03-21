"use client";
import { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function ManufacturerDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [stats, setStats] = useState({
        totalProducts: 0,
        lowStockCount: 0,
        totalRevenue: 0,
        platformDeduction: 0,
        netPayout: 0
    });
    const [products, setProducts] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (session?.user?.role === "MANUFACTURER") {
            fetchDashboardData();
        }
    }, [status, session]);

    const fetchDashboardData = async () => {
        try {
            const res = await fetch('/api/manufacturer/dashboard');
            const data = await res.json();
            if (data.success) {
                setStats(data.stats);
                setProducts(data.products);
                setRecentOrders(data.recentOrders);
            }
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    if (status === "loading" || loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading Supply Chain Dashboard...</div>;
    }

    return (
        <>
            <Navbar cartCount={0} />
            <div className="container" style={{ marginTop: '100px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h1>Manufacturer Dashboard</h1>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button style={actionButtonStyle('#1B5E20')}>
                            <i className="fa-solid fa-file-import" style={{ marginRight: '8px' }}></i>
                            Bulk CSV Upload
                        </button>
                        <div style={{ background: '#f0fdf4', padding: '10px 20px', borderRadius: '10px', color: '#166534', border: '1px solid #bbf7d0' }}>
                            <strong>Account Type:</strong> Direct Supplier
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', margin: '40px 0' }}>
                    <div style={statCardStyle}>
                        <h3>Catalog Items</h3>
                        <p style={statValueStyle}>{stats.totalProducts}</p>
                    </div>
                    <div style={statCardStyle}>
                        <h3>Low Stock Alerts</h3>
                        <p style={{ ...statValueStyle, color: '#DC2626' }}>{stats.lowStockCount}</p>
                    </div>
                    <div style={{ ...statCardStyle, background: '#1B5E20', color: 'white' }}>
                        <h3>Estimated Revenue</h3>
                        <p style={statValueStyle}>₹{stats.totalRevenue.toLocaleString()}</p>
                    </div>
                    <div style={statCardStyle}>
                        <h3>Net Settlement (90%)</h3>
                        <p style={{ ...statValueStyle, color: '#1B5E20' }}>₹{stats.netPayout.toLocaleString()}</p>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
                    {/* Catalog */}
                    <div style={sectionCardStyle}>
                        <h2 style={{ marginBottom: '20px' }}>Your Product Catalog</h2>
                        {products.length > 0 ? (
                            <table style={tableStyle}>
                                <thead>
                                    <tr style={{ borderBottom: '2px solid #eee' }}>
                                        <th style={{ textAlign: 'left', padding: '10px' }}>Medicine</th>
                                        <th style={{ textAlign: 'left', padding: '10px' }}>Price</th>
                                        <th style={{ textAlign: 'left', padding: '10px' }}>Stock</th>
                                        <th style={{ textAlign: 'right', padding: '10px' }}>Manage</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map(p => (
                                        <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: '12px' }}>{p.name}</td>
                                            <td style={{ padding: '12px' }}>₹{p.price}</td>
                                            <td style={{ padding: '12px' }}>
                                                <span style={{ color: p.stock < 20 ? 'red' : 'inherit', fontWeight: p.stock < 20 ? 'bold' : 'normal' }}>
                                                    {p.stock}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px', textAlign: 'right' }}>
                                                <button style={{ ...actionButtonStyle('#666'), padding: '4px 8px', fontSize: '0.7rem' }}>Edit</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : <p style={{ textAlign: 'center', color: '#666', padding: '40px' }}>Catalog is empty. Upload your medicines to begin.</p>}
                    </div>

                    {/* Recent Activities */}
                    <div style={sectionCardStyle}>
                        <h2 style={{ marginBottom: '20px' }}>Recent Distribution</h2>
                        {recentOrders.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {recentOrders.map((item, idx) => (
                                    <div key={idx} style={{ padding: '15px', background: '#F9F9F9', borderRadius: '10px', border: '1px solid #eee' }}>
                                        <p style={{ fontWeight: 'bold', margin: '0' }}>{item.product.name}</p>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#666' }}>
                                            <span>Qty: {item.quantity}</span>
                                            <span>Amt: ₹{item.price * item.quantity}</span>
                                        </div>
                                        <small style={{ color: '#999' }}>Order ID: {item.order.id.slice(-8)}</small>
                                    </div>
                                ))}
                            </div>
                        ) : <p style={{ textAlign: 'center', color: '#666', padding: '40px' }}>No recent distribution activity.</p>}
                    </div>
                </div>
            </div>
        </>
    );
}

const statCardStyle = {
    padding: '25px',
    background: '#fff',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    textAlign: 'center'
};

const statValueStyle = {
    fontSize: '2.5rem',
    fontWeight: '800',
    margin: '10px 0 0 0'
};

const sectionCardStyle = {
    padding: '25px',
    background: '#fff',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    minHeight: '400px'
};

const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.95rem'
};

const actionButtonStyle = (color) => ({
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    background: color,
    color: 'white',
    fontSize: '0.9rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center'
});
