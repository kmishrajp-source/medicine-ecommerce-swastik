"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Navbar from "@/components/Navbar";

export default function LabDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/lab/login');
        } else if (session && session.user.role !== 'LAB') {
            // alert("Access Denied: Labs Only");
        }
    }, [status, session, router]);

    if (status === 'loading') return <div>Loading...</div>;

    return (
        <>
            <Navbar cartCount={0} />
            <div className="container" style={{ marginTop: "100px" }}>
                <h2>Lab Dashboard</h2>
                <p>Welcome, {session?.user?.name}</p>

                <div style={{ marginTop: "20px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>

                    {/* Card 1: Add Test */}
                    <div style={{ padding: "20px", border: "1px solid #ddd", borderRadius: "10px", textAlign: "center", background: "#F3E8FF" }}>
                        <h3>Add New Test</h3>
                        <p>Detailed Blood Test, X-Ray, etc.</p>
                        <button style={{ padding: "10px", background: "#7C3AED", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
                            + Add Test
                        </button>
                    </div>

                    {/* Card 2: View Bookings */}
                    <div style={{ padding: "20px", border: "1px solid #ddd", borderRadius: "10px", textAlign: "center" }}>
                        <h3>Recent Bookings</h3>
                        <p>View patient bookings & upload reports.</p>
                        <button style={{ padding: "10px", background: "#333", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
                            Manage Bookings
                        </button>
                    </div>

                    {/* Card 3: Upload Report */}
                    <div style={{ padding: "20px", border: "1px solid #ddd", borderRadius: "10px", textAlign: "center" }}>
                        <h3>Upload Report</h3>
                        <p>Upload PDF reports for completed tests.</p>
                        <button style={{ padding: "10px", background: "#059669", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
                            Upload PDF
                        </button>
                    </div>

                </div>
            </div>
        </>
    );
}
