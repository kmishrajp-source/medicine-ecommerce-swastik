"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function LabRegister() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: "", // Lab Name
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
            const res = await fetch("/api/lab/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.success) {
                alert("Registration Successful! Please login.");
                router.push("/lab/login");
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
                <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Lab / Diagnostic Centre Registration</h2>
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                    <input type="text" placeholder="Lab Name" required
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }} />

                    <input type="email" placeholder="Official Email" required
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }} />

                    <input type="password" placeholder="Password" required
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                        style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }} />

                    <input type="text" placeholder="Contact Phone" required
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }} />

                    <input type="text" placeholder="Full Address" required
                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                        style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }} />

                    <input type="text" placeholder="License Number" required
                        onChange={e => setFormData({ ...formData, licenseNumber: e.target.value })}
                        style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }} />

                    <button type="submit" disabled={loading}
                        style={{ padding: "12px", background: "#7C3AED", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
                        {loading ? "Registering..." : "Register Lab"}
                    </button>
                </form>
            </div>
        </>
    );
}
