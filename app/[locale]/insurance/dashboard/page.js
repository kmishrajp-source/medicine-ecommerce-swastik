"use client";
import { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function InsuranceDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [stats, setStats] = useState({
        totalClaims: 0,
        pendingClaims: 0,
        approvedClaims: 0,
        totalFees: 0,
        handlingFee: 0
    });
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [verifyId, setVerifyId] = useState('');
    const [verificationResult, setVerificationResult] = useState(null);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (session?.user?.role === "INSURANCE") {
            fetchDashboardData();
        }
    }, [status, session]);

    const fetchDashboardData = async () => {
        try {
            const res = await fetch('/api/insurance/dashboard');
            const data = await res.json();
            if (data.success) {
                setStats(data.stats);
                setClaims(data.claims);
            }
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (claimId, newStatus) => {
        try {
            const res = await fetch('/api/insurance/dashboard', {
                method: 'POST',
                body: JSON.stringify({ claimId, status: newStatus }),
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await res.json();
            if (data.success) {
                alert(`Claim ${newStatus} successfully!`);
                fetchDashboardData();
            }
        } catch (error) {
            alert("Failed to update claim");
        }
    };

    const handleVerify = async () => {
        if (!verifyId) return;
        setLoading(true);
        // Simulation of policy verification
        setTimeout(() => {
            setVerificationResult({
                status: 'ACTIVE',
                name: 'Test Patient',
                policy: verifyId,
                coverage: '90% of OPD & Medicines'
            });
            setLoading(false);
        }, 800);
    };

    if (status === "loading" || loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Processing Insurance Portal...</div>;
    }

    return (
        <>
            <Navbar cartCount={0} />
            <div className="container" style={{ marginTop: '100px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h1>Insurance Provider Portal</h1>
                    <div style={{ background: '#e0f2fe', padding: '10px 20px', borderRadius: '10px', color: '#0369a1', border: '1px solid #bae6fd' }}>
                        <strong>Partner Tier:</strong> Premium Insurance Provider
                    </div>
                </div>

                {/* Verification Tool */}
                <div style={sectionCardStyle}>
                    <h2 style={{ marginBottom: '15px', color: '#1E40AF' }}>Quick Coverage Verification</h2>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                        <input 
                            type="text" 
                            placeholder="Enter Policy Number or PHR ID" 
                            value={verifyId} 
                            onChange={(e) => setVerifyId(e.target.value)} 
                            style={{ ...inputStyle, flex: 1 }} 
                        />
                        <button onClick={handleVerify} style={{ background: '#1E40AF', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Verify Now</button>
                    </div>
                    {verificationResult && (
                        <div style={{ background: '#f0f9ff', padding: '15px', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                            <p><strong>Patient Name:</strong> {verificationResult.name}</p>
                            <p><strong>Status:</strong> <span style={{ color: 'green', fontWeight: 'bold' }}>{verificationResult.status} ✅</span></p>
                            <p><strong>Details:</strong> {verificationResult.coverage}</p>
                        </div>
                    )}
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', margin: '40px 0' }}>
                    <div style={statCardStyle}>
                        <h3>Total Claims</h3>
                        <p style={statValueStyle}>{stats.totalClaims}</p>
                    </div>
                    <div style={statCardStyle}>
                        <h3>Awaiting Decision</h3>
                        <p style={{ ...statValueStyle, color: '#1E40AF' }}>{stats.pendingClaims}</p>
                    </div>
                    <div style={{ ...statCardStyle, background: '#1E3A8A', color: 'white' }}>
                        <h3>Total Earnings</h3>
                        <p style={statValueStyle}>₹{stats.totalFees.toLocaleString()}</p>
                    </div>
                    <div style={statCardStyle}>
                        <h3>Fee per Claim</h3>
                        <p style={{ ...statValueStyle, color: '#1B5E20' }}>₹{stats.handlingFee}</p>
                    </div>
                </div>

                {/* Claims List */}
                <div style={sectionCardStyle}>
                    <h2 style={{ marginBottom: '20px' }}>Pending Claim Settlements</h2>
                    {claims.length > 0 ? (
                        <table style={tableStyle}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #eee' }}>
                                    <th style={{ textAlign: 'left', padding: '10px' }}>Patient</th>
                                    <th style={{ textAlign: 'left', padding: '10px' }}>Policy #</th>
                                    <th style={{ textAlign: 'left', padding: '10px' }}>Amount</th>
                                    <th style={{ textAlign: 'left', padding: '10px' }}>Status</th>
                                    <th style={{ textAlign: 'right', padding: '10px' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {claims.map(claim => (
                                    <tr key={claim.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '12px' }}>{claim.user?.name || claim.patientName}</td>
                                        <td style={{ padding: '12px' }}>{claim.policyNumber}</td>
                                        <td style={{ padding: '12px' }}>₹{claim.amount.toLocaleString()}</td>
                                        <td style={{ padding: '12px' }}><span style={statusBadgeStyle(claim.status)}>{claim.status}</span></td>
                                        <td style={{ padding: '12px', textAlign: 'right' }}>
                                            {claim.status === 'PENDING' && (
                                                <>
                                                    <button onClick={() => handleUpdateStatus(claim.id, 'APPROVED')} style={actionButtonStyle('#059669')}>Approve</button>
                                                    <button onClick={() => handleUpdateStatus(claim.id, 'REJECTED')} style={actionButtonStyle('#DC2626')}>Reject</button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : <p style={{ textAlign: 'center', color: '#666', padding: '40px' }}>No pending claims found.</p>}
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
    marginBottom: '30px'
};

const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.95rem'
};

const statusBadgeStyle = (status) => ({
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '0.8rem',
    fontWeight: '600',
    background: status === 'APPROVED' ? '#D1FAE5' : status === 'PENDING' ? '#FEF3C7' : '#FEE2E2',
    color: status === 'APPROVED' ? '#065F46' : status === 'PENDING' ? '#92400E' : '#991B1B'
});

const actionButtonStyle = (color) => ({
    padding: '6px 12px',
    borderRadius: '6px',
    border: 'none',
    background: color,
    color: 'white',
    fontSize: '0.85rem',
    fontWeight: 'bold',
    marginLeft: '5px',
    cursor: 'pointer'
});

const inputStyle = {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '1rem'
};
