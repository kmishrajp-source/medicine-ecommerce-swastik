"use client";
import { useState, useEffect } from 'react';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function HospitalDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [stats, setStats] = useState({
        totalAppointments: 0,
        pendingAppointments: 0,
        totalRevenue: 0,
        platformDeduction: 0,
        netPayout: 0
    });
    const [appointments, setAppointments] = useState([]);
    const [labBookings, setLabBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
        } else if (session?.user?.role === "HOSPITAL") {
            fetchDashboardData();
        }
    }, [status, session]);

    const fetchDashboardData = async () => {
        try {
            const res = await fetch('/api/hospital/dashboard');
            const data = await res.json();
            if (data.success) {
                setStats(data.stats);
                setAppointments(data.appointments);
                setLabBookings(data.labBookings);
            }
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    if (status === "loading" || loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading Dashboard...</div>;
    }

    return (
        <>
            <Navbar cartCount={0} />
            <div className="container" style={{ marginTop: '100px', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h1>Hospital Dashboard</h1>
                    <div style={{ background: '#f8d7da', padding: '10px 20px', borderRadius: '10px', color: '#721c24' }}>
                        <strong>Live Status:</strong> Active & Monitored by AI
                    </div>
                </div>

                {/* Quick Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                    <div style={statCardStyle}>
                        <h3>Total Appointments</h3>
                        <p style={statValueStyle}>{stats.totalAppointments}</p>
                    </div>
                    <div style={statCardStyle}>
                        <h3>Pending Tasks</h3>
                        <p style={{ ...statValueStyle, color: '#DC2626' }}>{stats.pendingAppointments}</p>
                    </div>
                    <div style={{ ...statCardStyle, background: '#1B5E20', color: 'white' }}>
                        <h3>Total Earnings</h3>
                        <p style={statValueStyle}>₹{stats.totalRevenue.toLocaleString()}</p>
                    </div>
                    <div style={statCardStyle}>
                        <h3>Net Settlement (90%)</h3>
                        <p style={{ ...statValueStyle, color: '#1B5E20' }}>₹{stats.netPayout.toLocaleString()}</p>
                    </div>
                </div>

                {/* Appointments & Lab Bookings */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                    <div style={sectionCardStyle}>
                        <h2 style={{ marginBottom: '20px' }}>Recent Appointments</h2>
                        {appointments.length > 0 ? (
                            <table style={tableStyle}>
                                <thead>
                                    <tr>
                                        <th>Patient</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {appointments.map(app => (
                                        <tr key={app.id}>
                                            <td>{app.patient?.name || 'Guest'}</td>
                                            <td>{new Date(app.date).toLocaleDateString()}</td>
                                            <td><span style={statusBadgeStyle(app.status)}>{app.status}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : <p style={{ textAlign: 'center', color: '#666' }}>No appointments yet.</p>}
                    </div>

                    <div style={sectionCardStyle}>
                        <h2 style={{ marginBottom: '20px' }}>Shared Lab Bookings</h2>
                        {labBookings.length > 0 ? (
                            <table style={tableStyle}>
                                <thead>
                                    <tr>
                                        <th>Test Name</th>
                                        <th>Patient</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {labBookings.map(bk => (
                                        <tr key={bk.id}>
                                            <td>{bk.test?.name}</td>
                                            <td>{bk.patient?.name}</td>
                                            <td><span style={statusBadgeStyle(bk.status)}>{bk.status}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : <p style={{ textAlign: 'center', color: '#666' }}>No lab bookings assigned.</p>}
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

const statusBadgeStyle = (status) => ({
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '0.8rem',
    fontWeight: '600',
    background: status === 'Confirmed' || status === 'Completed' ? '#D1FAE5' : '#FEE2E2',
    color: status === 'Confirmed' || status === 'Completed' ? '#065F46' : '#991B1B'
});
