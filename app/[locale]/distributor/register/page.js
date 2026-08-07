"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function DistributorRegister() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        companyName: "",
        ownerName: "",
        email: "",
        password: "",
        phone: "",
        address: "",
        city: "",
        pincode: "",
        state: "Uttar Pradesh",
        drugLicenseNo: "",
        gstin: ""
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch("/api/distributor/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.success) {
                alert("Registration Successful! Please login.");
                router.push("/distributor/login");
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
            <div className="container" style={{ marginTop: "100px", maxWidth: "600px" }}>
                <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Distributor Registration</h2>
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                    <input type="text" placeholder="Company Name" required
                        onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                        style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }} />

                    <input type="text" placeholder="Owner Name (Optional)"
                        onChange={e => setFormData({ ...formData, ownerName: e.target.value })}
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

                    <input type="text" placeholder="Warehouse/Office Address" required
                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                        style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }} />

                    <input type="text" placeholder="City" required
                        onChange={e => setFormData({ ...formData, city: e.target.value })}
                        style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }} />

                    <input type="text" placeholder="Pincode"
                        onChange={e => setFormData({ ...formData, pincode: e.target.value })}
                        style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }} />

                    <input type="text" placeholder="State" defaultValue="Uttar Pradesh" required
                        onChange={e => setFormData({ ...formData, state: e.target.value })}
                        style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }} />

                    <input type="text" placeholder="Drug License No."
                        onChange={e => setFormData({ ...formData, drugLicenseNo: e.target.value })}
                        style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }} />

                    <input type="text" placeholder="GST Number"
                        onChange={e => setFormData({ ...formData, gstin: e.target.value })}
                        style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }} />

                    <button type="submit" disabled={loading}
                        style={{ padding: "12px", background: "#7C3AED", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
                        {loading ? "Registering..." : "Register Distributor"}
                    </button>
                </form>
            </div>
        </>
    );
}
