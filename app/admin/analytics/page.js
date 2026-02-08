"use client";
import Navbar from "../../../components/Navbar";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Analytics() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === 'loading') return;
        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (session?.user?.role === 'ADMIN') {
            fetchAnalytics();
        } else {
            router.push('/');
        }
    }, [status, session]);

    const fetchAnalytics = async () => {
        try {
            const res = await fetch('/api/admin/analytics');
            const json = await res.json();
            if (json.success) {
                setData(json.analytics);
            }
        } catch (error) {
            console.error("Analytics Load Error", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ padding: '100px', textAlign: 'center' }}>Loading Analytics...</div>;
    if (!data) return <div style={{ padding: '100px', textAlign: 'center' }}>Failed to load data.</div>;

    return (
        <>
            <Navbar cartCount={0} openCart={() => { }} />
            <div className="container" style={{ marginTop: '100px', paddingBottom: '60px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h2>Analytics & Reports</h2>
                    <Link href="/admin" className="btn btn-secondary">Back to Dashboard</Link>
                </div>

                {/* KPI Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                    <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }}>
                        <h4 style={{ color: '#666', fontSize: '0.9rem' }}>Total Sales (Revenue)</h4>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#059669' }}>₹{data.totalRevenue.toFixed(2)}</div>
                    </div>
                    <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }}>
                        <h4 style={{ color: '#666', fontSize: '0.9rem' }}>Total Investment (Stock)</h4>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#D97706' }}>₹{data.totalInvestment.toFixed(2)}</div>
                    </div>
                    <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }}>
                        <h4 style={{ color: '#666', fontSize: '0.9rem' }}>Estimated Profit</h4>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2563EB' }}>₹{data.profit.toFixed(2)}</div>
                        <div style={{ fontSize: '0.8rem', color: '#888' }}>*Approx calculation</div>
                    </div>
                    <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }}>
                        <h4 style={{ color: '#666', fontSize: '0.9rem' }}>Total Orders</h4>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{data.totalOrders}</div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                    {/* Recent Sales */}
                    <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                        <h3>Recent Sales</h3>
                        <table style={{ width: '100%', marginTop: '10px' }}>
                            <tbody>
                                {data.recentSales.length === 0 ? <p>No sales yet.</p> : data.recentSales.map(order => (
                                    <tr key={order.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '10px' }}>{order.user?.name || 'Guest'}</td>
                                        <td style={{ padding: '10px', textAlign: 'right' }}>₹{order.total}</td>
                                        <td style={{ padding: '10px', fontSize: '0.8rem', color: '#888' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Low Stock Alerts */}
                    <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
                        <h3 style={{ color: '#DC2626' }}>Low Stock Alerts</h3>
                        <ul style={{ paddingLeft: '20px', marginTop: '10px' }}>
                            {data.lowStockProducts.length === 0 ? <p>Stock levels are good.</p> : data.lowStockProducts.map((p, i) => (
                                <li key={i} style={{ marginBottom: '8px' }}>
                                    <strong>{p.name}</strong>: {p.stock} units left
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </>
    );
}
