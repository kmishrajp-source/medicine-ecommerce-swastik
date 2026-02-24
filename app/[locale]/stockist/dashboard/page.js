"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Navbar from "@/components/Navbar";

export default function StockistDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/stockist/login');
        } else if (session && session.user.role !== 'STOCKIST') {
            // alert("Access Denied: Stockists Only");
        }
    }, [status, session, router]);

    if (status === 'loading') return <div>Loading...</div>;

    return (
        <>
            <Navbar cartCount={0} />
            <div className="container" style={{ marginTop: "100px" }}>
                <h2>Stockist Dashboard</h2>
                <p>Welcome, {session?.user?.name}</p>

                <div style={{ marginTop: "20px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>

                    {/* Card 1: Incoming Bulk Orders */}
                    <div style={{ padding: "20px", border: "1px solid #ddd", borderRadius: "10px", textAlign: "center", background: "#FEF2F2" }}>
                        <h3>Retailer Requests</h3>
                        <p>View incoming bulk orders from retailers.</p>
                        <button style={{ padding: "10px", background: "#B91C1C", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
                            View Requests
                        </button>
                    </div>

                    {/* Card 2: Bulk Inventory */}
                    <div style={{ padding: "20px", border: "1px solid #ddd", borderRadius: "10px", textAlign: "center" }}>
                        <h3>Warehouse Inventory</h3>
                        <p>Manage bulk stock and distribution.</p>
                        <button style={{ padding: "10px", background: "#333", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
                            Manage Stock
                        </button>
                    </div>

                    {/* Card 3: Agency Profile */}
                    <div style={{ padding: "20px", border: "1px solid #ddd", borderRadius: "10px", textAlign: "center" }}>
                        <h3>Agency Profile</h3>
                        <p>Update GST and warehouse details.</p>
                        <button style={{ padding: "10px", background: "#333", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
                            Edit Profile
                        </button>
                    </div>

                </div>
            </div>
        </>
    );
}
