"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Navbar from "@/components/Navbar";

export default function RetailerDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/retailer/login');
        } else if (session && session.user.role !== 'RETAILER') {
            // alert("Access Denied: Retailers Only");
        }
    }, [status, session, router]);

    if (status === 'loading') return <div>Loading...</div>;

    return (
        <>
            <Navbar cartCount={0} />
            <div className="container" style={{ marginTop: "100px" }}>
                <h2>Retailer Dashboard</h2>
                <p>Welcome, {session?.user?.name}</p>

                <div style={{ marginTop: "20px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "20px" }}>

                    {/* Card 1: View Orders */}
                    <div style={{ padding: "20px", border: "1px solid #ddd", borderRadius: "10px", textAlign: "center", background: "#ECFDF5" }}>
                        <h3>Local Orders</h3>
                        <p>View orders in your area to fulfill.</p>
                        <button style={{ padding: "10px", background: "#059669", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
                            View Orders
                        </button>
                    </div>

                    {/* Card 2: Request Stock */}
                    <div style={{ padding: "20px", border: "1px solid #ddd", borderRadius: "10px", textAlign: "center" }}>
                        <h3>Restock Inventory</h3>
                        <p>Order bulk medicines from Stockists.</p>
                        <button style={{ padding: "10px", background: "#333", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
                            Place Bulk Order
                        </button>
                    </div>

                    {/* Card 3: Profile */}
                    <div style={{ padding: "20px", border: "1px solid #ddd", borderRadius: "10px", textAlign: "center" }}>
                        <h3>Shop Profile</h3>
                        <p>Update license and address details.</p>
                        <button style={{ padding: "10px", background: "#333", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
                            Edit Profile
                        </button>
                    </div>

                </div>
            </div>
        </>
    );
}
