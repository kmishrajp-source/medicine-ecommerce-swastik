"use client";
import React, { useState, useEffect } from 'react';
import Navbar from "@/components/Navbar";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function PartnerGrowthDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({ referrals: [], metrics: {}, leaderboard: [] });

    useEffect(() => {
        if (status === 'unauthenticated') router.push('/login');
        if (status === 'authenticated') fetchData();
    }, [status]);

    const fetchData = async () => {
        try {
            const res = await fetch('/api/partner-growth');
            const json = await res.json();
            if (json.success) setData(json);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '60px' }}>
            <Navbar />
            <div className="container" style={{ marginTop: '100px', maxWidth: '1200px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', marginBottom: '40px' }}>
                    <div>
                        <h1 style={{ color: '#0f172a', fontWeight: 'bold', margin: 0 }}>Swastik Growth Partner</h1>
                        <p style={{ color: '#64748b', fontSize: '1.1rem', margin: '5px 0 0 0' }}>Build your healthcare network. Earn passive income for every transaction.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <button onClick={() => {
                            navigator.clipboard.writeText(`https://swastikmedicare.vercel.app/register?ref=${session?.user?.referralCode}`);
                            alert("Growth Link copied!");
                        }} style={{ background: '#e0e7ff', color: '#4338ca', border: '1px solid #6366f1', padding: '10px 20px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                            <i className="fa-solid fa-link"></i> Copy Referral Link
                        </button>
                    </div>
                </div>

                {/* --- Pending KYC Alert --- */}
                {session?.user?.role === "CUSTOMER" && (
                    <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '20px', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <i className="fa-solid fa-certificate" style={{ color: '#f59e0b', fontSize: '2rem' }}></i>
                            <div>
                                <h3 style={{ margin: '0 0 5px 0', color: '#92400e' }}>Upgrade to Business Partner</h3>
                                <p style={{ margin: '0', color: '#b45309', fontSize: '0.9rem' }}>You are currently on the basic consumer tier. Register as a Medical Representative to unlock B2B retailer payouts.</p>
                            </div>
                        </div>
                        <button onClick={() => router.push('/partner-growth/apply')} style={{ background: '#f59e0b', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                            Apply for KYC
                        </button>
                    </div>
                )}

                {/* --- Top Metrics Row --- */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                    <div style={{ background: 'white', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', borderBottom: '4px solid #10b981' }}>
                        <p style={{ color: '#64748b', margin: '0 0 5px 0', fontSize: '1rem', fontWeight: 600 }}>Lifetime Network Earnings</p>
                        <h2 style={{ margin: 0, fontSize: '2.5rem', color: '#10b981' }}>₹{data.metrics.totalLifetimeEarned?.toFixed(2) || "0.00"}</h2>
                    </div>
                    <div style={{ background: 'white', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', borderBottom: '4px solid #3b82f6' }}>
                        <p style={{ color: '#64748b', margin: '0 0 5px 0', fontSize: '1rem', fontWeight: 600 }}>Active Network Partners</p>
                        <h2 style={{ margin: 0, fontSize: '2.5rem', color: '#3b82f6' }}>{data.metrics.activePartners || 0}</h2>
                        <p style={{ margin: '5px 0 0 0', color: '#94a3b8', fontSize: '0.85rem' }}>+ {data.metrics.pendingPayouts || 0} pending activation</p>
                    </div>
                    <div style={{ background: 'white', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', borderBottom: '4px solid #f59e0b' }}>
                        <p style={{ color: '#64748b', margin: '0 0 5px 0', fontSize: '1rem', fontWeight: 600 }}>Total Network Size</p>
                        <h2 style={{ margin: 0, fontSize: '2.5rem', color: '#f59e0b' }}>{data.metrics.totalNetworkSize || 0}</h2>
                        <p style={{ margin: '5px 0 0 0', color: '#94a3b8', fontSize: '0.85rem' }}>Across all 5 facility types</p>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px', alignItems: 'start' }}>

                    {/* Left Column: Network Tree & Breakdown */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                        {/* Network Composition */}
                        <div style={{ background: 'white', padding: '30px', borderRadius: '24px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
                            <h3 style={{ margin: '0 0 20px 0', color: '#1e293b' }}><i className="fa-solid fa-chart-pie" style={{ color: '#64748b', marginRight: '10px' }}></i> Your Network Composition</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '15px' }}>
                                <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '12px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                                    <div style={{ color: '#3b82f6', fontSize: '1.5rem', marginBottom: '5px' }}><i className="fa-solid fa-user-doctor"></i></div>
                                    <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{data.metrics.breakdown?.DOCTOR || 0}</div>
                                    <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Doctors</div>
                                </div>
                                <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '12px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                                    <div style={{ color: '#10b981', fontSize: '1.5rem', marginBottom: '5px' }}><i className="fa-solid fa-shop"></i></div>
                                    <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{data.metrics.breakdown?.RETAILER || 0}</div>
                                    <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Retailers</div>
                                </div>
                                <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '12px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                                    <div style={{ color: '#8b5cf6', fontSize: '1.5rem', marginBottom: '5px' }}><i className="fa-solid fa-microscope"></i></div>
                                    <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{data.metrics.breakdown?.LAB || 0}</div>
                                    <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Labs</div>
                                </div>
                                <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '12px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                                    <div style={{ color: '#f59e0b', fontSize: '1.5rem', marginBottom: '5px' }}><i className="fa-solid fa-boxes-stacked"></i></div>
                                    <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{data.metrics.breakdown?.STOCKIST || 0}</div>
                                    <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Stockists</div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Referrals List */}
                        <div style={{ background: 'white', padding: '30px', borderRadius: '24px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
                            <h3 style={{ margin: '0 0 20px 0', color: '#1e293b' }}><i className="fa-solid fa-users" style={{ color: '#64748b', marginRight: '10px' }}></i> Referred Partners</h3>

                            {data.referrals.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
                                    <i className="fa-solid fa-user-plus" style={{ fontSize: '3rem', marginBottom: '15px', opacity: 0.5 }}></i>
                                    <p>You haven't referred anyone yet. Share your link to start earning!</p>
                                </div>
                            ) : (
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
                                                <th style={{ padding: '12px 0' }}>Partner Name</th>
                                                <th style={{ padding: '12px 0' }}>Facility Type</th>
                                                <th style={{ padding: '12px 0' }}>Status</th>
                                                <th style={{ padding: '12px 0', textAlign: 'right' }}>Earned So Far</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.referrals.map((conn) => (
                                                <tr key={conn.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                    <td style={{ padding: '15px 0', fontWeight: 500 }}>{conn.referee?.name || conn.referee?.email}</td>
                                                    <td style={{ padding: '15px 0' }}>
                                                        <span style={{ background: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 600 }}>{conn.refereeRole}</span>
                                                    </td>
                                                    <td style={{ padding: '15px 0' }}>
                                                        {conn.status === 'Active' ? (
                                                            <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '5px' }}><i className="fa-solid fa-circle-check"></i> Producing</span>
                                                        ) : (
                                                            <span style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '5px' }}><i className="fa-solid fa-clock"></i> Pending Threshold</span>
                                                        )}
                                                    </td>
                                                    <td style={{ padding: '15px 0', textAlign: 'right', fontWeight: 'bold', color: conn.totalEarned > 0 ? '#10b981' : '#94a3b8' }}>
                                                        ₹{conn.totalEarned.toFixed(2)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Gamified Leaderboard */}
                    <div style={{ background: 'white', padding: '30px', borderRadius: '24px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
                        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                            <i className="fa-solid fa-trophy" style={{ fontSize: '2.5rem', color: '#fbbf24', marginBottom: '10px' }}></i>
                            <h3 style={{ margin: '0', color: '#1e293b' }}>Top Earners Leaderboard</h3>
                            <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '5px 0 0 0' }}>The most successful Growth Partners</p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {data.leaderboard.length === 0 && <p style={{ textAlign: 'center', color: '#94a3b8' }}>Leaderboard calculating...</p>}
                            {data.leaderboard.map((earner, idx) => (
                                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px', background: earner.isMe ? '#eff6ff' : '#f8fafc', border: earner.isMe ? '1px solid #bfdbfe' : '1px solid transparent', borderRadius: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: idx === 0 ? '#fef08a' : idx === 1 ? '#e2e8f0' : idx === 2 ? '#ffedd5' : 'transparent', color: idx === 0 ? '#ca8a04' : idx === 1 ? '#64748b' : idx === 2 ? '#c2410c' : '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1rem' }}>
                                            #{idx + 1}
                                        </div>
                                        <div style={{ fontWeight: earner.isMe ? 'bold' : 'normal', color: earner.isMe ? '#1d4ed8' : '#334155' }}>
                                            {earner.name} {earner.isMe && "(You)"}
                                        </div>
                                    </div>
                                    <div style={{ fontWeight: 'bold', color: '#10b981' }}>
                                        ₹{earner.earned.toFixed(0)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
