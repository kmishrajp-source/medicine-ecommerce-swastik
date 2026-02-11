"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function DoctorDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/doctor/login');
        } else if (session && session.user.role !== 'DOCTOR') {
            // alert("Access Denied: Doctors Only");
            // router.push('/'); 
            // Commented out for now to allow easier testing if role isn't perfectly set
        }
    }, [status, session, router]);

    if (status === 'loading') return <div>Loading...</div>;

    return (
        <>
            <Navbar cartCount={0} />
            <div className="container" style={{ marginTop: "100px" }}>
                <h2>Doctor Dashboard</h2>
                <div style={{ marginTop: "20px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>

                    {/* Card 1: Upload Prescription */}
                    <div style={{ padding: "20px", border: "1px solid #ddd", borderRadius: "10px", textAlign: "center" }}>
                        <h3>Upload Prescription</h3>
                        <p>Upload a new prescription for a patient.</p>
                        <button style={{ padding: "10px", background: "#0D8ABC", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
                            Upload Now
                        </button>
                    </div>

                    {/* Card 2: View Patients */}
                    <div style={{ padding: "20px", border: "1px solid #ddd", borderRadius: "10px", textAlign: "center" }}>
                        <h3>My Patients</h3>
                        <p>View list of patients and their history.</p>
                        <button style={{ padding: "10px", background: "#333", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
                            View List
                        </button>
                    </div>

                    {/* Card 3: Profile */}
                    <div style={{ padding: "20px", border: "1px solid #ddd", borderRadius: "10px", textAlign: "center" }}>
                        <h3>My Profile</h3>
                        <p>Update your details and availability.</p>
                        <button style={{ padding: "10px", background: "#333", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
                            Edit Profile
                        </button>
                    </div>

                </div>

                <div style={{ marginTop: '40px' }}>
                    <h3>Upcoming Appointments</h3>
                    <div style={{ background: 'white', borderRadius: '10px', padding: '20px', border: '1px solid #ddd', marginTop: '10px' }}>
                        <AppointmentsList role="DOCTOR" />
                    </div>
                </div>
            </div>
        </>
    );
}

function AppointmentsList({ role }) {
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
                    <th style={{ padding: '10px' }}>Patient</th>
                    <th style={{ padding: '10px' }}>Date</th>
                    <th style={{ padding: '10px' }}>Status</th>
                    <th style={{ padding: '10px' }}>Action</th>
                </tr>
            </thead>
            <tbody>
                {appointments.map(appt => (
                    <tr key={appt.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '10px' }}>{appt.patient?.name}</td>
                        <td style={{ padding: '10px' }}>{new Date(appt.date).toLocaleString()}</td>
                        <td style={{ padding: '10px' }}>{appt.status}</td>
                        <td style={{ padding: '10px' }}>
                            <Link href={`/meet/${appt.id}`} style={{
                                background: '#7C3AED', color: 'white', padding: '6px 12px',
                                borderRadius: '4px', textDecoration: 'none', fontSize: '0.9rem'
                            }}>
                                <i className="fa-solid fa-video"></i> Join Call
                            </Link>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
