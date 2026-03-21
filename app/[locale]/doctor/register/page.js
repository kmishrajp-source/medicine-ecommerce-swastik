"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import MotivationalVideo from "@/components/MotivationalVideo";

export default function DoctorRegister() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        specialization: "",
        hospital: "",
        experience: "",
        claimId: "" // Added to track claim
    });
    const [loading, setLoading] = useState(false);

    // Support for Pre-filling via Claim Flow
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            setFormData(prev => ({
                ...prev,
                name: params.get('name') || "",
                specialization: params.get('specialization') || "",
                hospital: params.get('hospital') || "",
                claimId: params.get('claimId') || ""
            }));
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch("/api/doctor/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.success) {
                alert("Registration Successful! Please login.");
                router.push("/doctor/login");
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
                    title="Empowering Doctors, Transforming Care"
                    description="Join India's most advanced digital health network. Reach more patients, manage your practice seamlessly, and lead the future of healthcare."
                    videoUrl="https://www.youtube.com/embed/-6iM6bNX-cM" // User provided doctor video (Short)
                    ctaText="Start Registration"
                    ctaLink="#registration-form"
                />

                <div id="registration-form" style={{ background: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', maxWidth: '500px', margin: '0 auto' }}>
                    <h2 style={{ textAlign: "center", marginBottom: "20px", color: '#0D8ABC' }}>Doctor Registration</h2>
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                    <input type="text" placeholder="Full Name" required
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }} />

                    <input type="email" placeholder="Email" required
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }} />

                    <input type="password" placeholder="Password" required
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                        style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }} />

                    <input type="text" placeholder="Phone Number" required
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }} />

                    <input type="text" placeholder="Specialization (e.g. Cardiologist)" required
                        value={formData.specialization}
                        onChange={e => setFormData({ ...formData, specialization: e.target.value })}
                        style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }} />

                    <input type="text" placeholder="Hospital / Clinic Name" required
                        value={formData.hospital}
                        onChange={e => setFormData({ ...formData, hospital: e.target.value })}
                        style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }} />

                    <input type="number" placeholder="Experience (Years)" required
                        onChange={e => setFormData({ ...formData, experience: e.target.value })}
                        style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }} />

                    <button type="submit" disabled={loading}
                        style={{ padding: "12px", background: "#0D8ABC", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
                        {loading ? "Registering..." : "Register as Doctor"}
                    </button>
                </form>
                </div>
            </div>
        </>
    );
}
