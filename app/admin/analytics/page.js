"use client";
import Navbar from "../../../components/Navbar";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Analytics() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [error, setError] = useState(null);
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
            } else {
                setError(json.error || "Unknown API Error");
            }
        } catch (error) {
            console.error("Analytics Load Error", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ padding: '100px', textAlign: 'center' }}>Loading Analytics...</div>;
    if (error) return (
        <div style={{ padding: '100px', textAlign: 'center', color: 'red' }}>
            <h2>Failed to load data</h2>
            <p>Error: {error}</p>
            <button onClick={() => window.location.reload()} className="btn btn-primary" style={{ marginTop: '20px' }}>Retry</button>
        </div>
    );
    if (!data) return <div style={{ padding: '100px', textAlign: 'center' }}>No data available.</div>;

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

                {/* Detailed Sales Report */}
                <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: 'var(--shadow-sm)', marginBottom: '30px' }}>
                    <h3>Detailed Sales Report</h3>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', marginTop: '15px', borderCollapse: 'collapse' }}>
                            <thead style={{ background: '#f8f9fa' }}>
                                <tr>
                                    <th style={{ padding: '12px', textAlign: 'left' }}>Date</th>
                                    <th style={{ padding: '12px', textAlign: 'left' }}>Product</th>
                                    <th style={{ padding: '12px', textAlign: 'center' }}>Qty</th>
                                    <th style={{ padding: '12px', textAlign: 'right' }}>Buying Price</th>
                                    <th style={{ padding: '12px', textAlign: 'right' }}>Selling Price</th>
                                    <th style={{ padding: '12px', textAlign: 'right', color: 'green' }}>Profit</th>
                                    <th style={{ padding: '12px', textAlign: 'center' }}>Remaining Stock</th>
                                    <th style={{ padding: '12px', textAlign: 'center' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.salesReport?.length === 0 ? (
                                    <tr><td colSpan="8" style={{ padding: '20px', textAlign: 'center' }}>No sales data found.</td></tr>
                                ) : (
                                    data.salesReport?.map(item => (
                                        <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: '12px', fontSize: '0.9rem' }}>{new Date(item.date).toLocaleDateString()}</td>
                                            <td style={{ padding: '12px', fontWeight: '500' }}>{item.productName}</td>
                                            <td style={{ padding: '12px', textAlign: 'center' }}>{item.quantity}</td>
                                            <td style={{ padding: '12px', textAlign: 'right' }}>₹{item.buyingPrice}</td>
                                            <td style={{ padding: '12px', textAlign: 'right' }}>₹{item.sellingPrice}</td>
                                            <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', color: item.profit >= 0 ? 'green' : 'red' }}>
                                                ₹{item.profit.toFixed(2)}
                                            </td>
                                            <td style={{ padding: '12px', textAlign: 'center', color: item.remainingStock < 10 ? 'red' : 'inherit' }}>
                                                {item.remainingStock}
                                            </td>
                                            <td style={{ padding: '12px', textAlign: 'center' }}>
                                                <span style={{
                                                    padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem',
                                                    background: item.status === 'Delivered' ? '#D1FAE5' : '#FEF3C7',
                                                    color: item.status === 'Delivered' ? '#065F46' : '#92400E'
                                                }}>
                                                    {item.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
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
