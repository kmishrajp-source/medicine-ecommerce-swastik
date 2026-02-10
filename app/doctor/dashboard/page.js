"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Navbar from "../../components/Navbar";
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
            </div>
        </>
    );
}
