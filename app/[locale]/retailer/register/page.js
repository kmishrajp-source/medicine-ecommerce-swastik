"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import MotivationalVideo from "@/components/MotivationalVideo";

export default function RetailerRegister() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        shopName: "",
        email: "",
        password: "",
        phone: "",
        address: "",
        licenseNumber: ""
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch("/api/retailer/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.success) {
                alert("Registration Successful! Please login.");
                router.push("/retailer/login");
            } else {
                alert("Error: " + data.error);
            }
        } catch (err) {
            alert("Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar cartCount={0} />
            <div className="container" style={{ marginTop: "100px", maxWidth: "800px" }}>
                
                <MotivationalVideo 
                    title="Grow Your Pharmacy Business"
                    description="Partner with Swastik Medicare to digitize your pharmacy, reach thousands of local customers, and manage your inventory with state-of-the-art tools."
                    videoUrl="https://www.youtube.com/embed/eWORGelQMBM" // User provided retailer video
                    ctaText="Start Registration"
                    ctaLink="#registration-form"
                />

                <div id="registration-form" style={{ background: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', maxWidth: '600px', margin: '0 auto' }}>
                    <h2 style={{ textAlign: "center", marginBottom: "20px", color: '#059669' }}>Join as Pharmacy Partner</h2>
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                    <input type="text" placeholder="Shop / Pharmacy Name" required
                        onChange={e => setFormData({ ...formData, shopName: e.target.value })}
                        style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }} />

                    <input type="email" placeholder="Business Email" required
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }} />

                    <input type="password" placeholder="Password" required
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                        style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }} />

                    <input type="text" placeholder="Contact Phone" required
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }} />

                    <input type="text" placeholder="Shop Address" required
                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                        style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }} />

                    <input type="text" placeholder="Drug License Number" required
                        onChange={e => setFormData({ ...formData, licenseNumber: e.target.value })}
                        style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }} />

                    <button type="submit" disabled={loading}
                        style={{ padding: "12px", background: "#059669", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
                        {loading ? "Registering..." : "Register Partner"}
                    </button>
                    </form>
                </div>
            </div>
        </>
    );
}
