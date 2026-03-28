"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { Link } from "@/i18n/navigation";
import { useParams } from "next/navigation";

export default function DoctorDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const params = useParams();

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    if (status === 'loading') return <div>Loading...</div>;

    return (
        <>
            <Navbar cartCount={0} />
            <div className="container" style={{ marginTop: "100px" }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h2>Doctor Dashboard</h2>
                    <div style={{ background: '#ecfdf5', padding: '10px 20px', borderRadius: '12px', border: '1px solid #10b981', color: '#047857', fontWeight: 'bold' }}>
                        <i className="fa-solid fa-wallet" style={{ marginRight: '8px' }}></i>
                        Earnings: ₹0.00
                    </div>
                </div>
                
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>

                    {/* Card 1: Review Prescriptions */}
                    <div style={{ padding: "20px", border: "1px solid #ddd", borderRadius: "10px", textAlign: "center", background: 'white' }}>
                        <i className="fa-solid fa-file-medical" style={{ fontSize: '2rem', color: '#0D8ABC', marginBottom: '15px' }}></i>
                        <h3>Review Prescriptions</h3>
                        <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '20px' }}>Verify patient uploads and issue digital E-Rx.</p>
                        <button onClick={() => router.push('/doctor/prescriptions')} style={{ padding: "10px", background: "#0D8ABC", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", width: '100%', fontWeight: 'bold' }}>
                            Open Portal
                        </button>
                    </div>

                    {/* Card 2: Wallet & Payouts */}
                    <div style={{ padding: "20px", border: "1px solid #ddd", borderRadius: "10px", textAlign: "center", background: 'white' }}>
                        <i className="fa-solid fa-money-bill-transfer" style={{ fontSize: '2rem', color: '#059669', marginBottom: '15px' }}></i>
                        <h3>Wallet & Payouts</h3>
                        <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '20px' }}>Track your consultation earnings and request withdrawals.</p>
                        <button onClick={() => router.push('/partner/wallet')} style={{ padding: "10px", background: "#059669", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", width: '100%', fontWeight: 'bold' }}>
                            View Wallet
                        </button>
                    </div>

                    {/* Card 3: Profile */}
                    <div style={{ padding: "20px", border: "1px solid #ddd", borderRadius: "10px", textAlign: "center", background: 'white' }}>
                        <i className="fa-solid fa-user-md" style={{ fontSize: '2rem', color: '#4338ca', marginBottom: '15px' }}></i>
                        <h3>My Profile</h3>
                        <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '20px' }}>Update your specialization, clinic details and availability.</p>
                        <button onClick={() => router.push('/profile')} style={{ padding: "10px", background: "#4338ca", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", width: '100%', fontWeight: 'bold' }}>
                            Edit Profile
                        </button>
                    </div>

                </div>

                <div style={{ marginTop: '40px' }}>
                    <h3>Upcoming Appointments</h3>
                    <div style={{ background: 'white', borderRadius: '10px', padding: '20px', border: '1px solid #ddd', marginTop: '10px' }}>
                        <AppointmentsList />
                    </div>
                </div>
            </div>
        </>
    );
}

function AppointmentsList() {
    const [appointments, setAppointments] = useState([]);
    const params = useParams();

    useEffect(() => {
        fetch('/api/appointments').then(res => res.json()).then(data => {
            if (data.success) setAppointments(data.appointments);
        });
    }, []);

    if (appointments.length === 0) return <p style={{ textAlign: 'center', padding: '20px', color: '#666' }}>No scheduled appointments found.</p>;

    return (
        <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '1px solid #eee' }}>
                        <th style={{ padding: '12px' }}>Patient</th>
                        <th style={{ padding: '12px' }}>Date & Time</th>
                        <th style={{ padding: '12px' }}>Status</th>
                        <th style={{ padding: '12px' }}>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {appointments.map(appt => (
                        <tr key={appt.id} style={{ borderBottom: '1px solid #f9f9f9' }}>
                            <td style={{ padding: '12px' }}>{appt.patient?.name || 'Guest User'}</td>
                            <td style={{ padding: '12px' }}>{new Date(appt.date).toLocaleString()}</td>
                            <td style={{ padding: '12px' }}>
                                <span style={{ padding: '4px 8px', borderRadius: '4px', background: '#fef3c7', color: '#d97706', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                    {appt.status}
                                </span>
                            </td>
                            <td style={{ padding: '12px' }}>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <Link href={`/meet/${appt.id}`} style={{
                                        background: '#7C3AED', color: 'white', padding: '6px 12px',
                                        borderRadius: '4px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 'bold'
                                    }}>
                                        <i className="fa-solid fa-video"></i> Join
                                    </Link>
                                    <Link href={`/${params.locale}/doctor/appointments/${appt.id}/prescribe`} style={{
                                        background: '#16A34A', color: 'white', padding: '6px 12px',
                                        borderRadius: '4px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 'bold'
                                    }}>
                                        <i className="fa-solid fa-file-prescription"></i> Prescribe
                                    </Link>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
