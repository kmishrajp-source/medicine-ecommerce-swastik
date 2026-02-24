"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function DoctorLogin() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const res = await signIn("credentials", {
            redirect: false,
            email,
            password
        });

        if (res?.error) {
            alert("Login Failed: " + res.error);
            setLoading(false);
        } else {
            // Redirect will be handled by useEffect or manually here
            // We need to check if they are actually a doctor in the session, 
            // but for now let's just push to dashboard
            router.push("/doctor/dashboard");
        }
    };

    return (
        <>
            <Navbar cartCount={0} />
            <div className="container" style={{ marginTop: "100px", maxWidth: "400px" }}>
                <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Doctor Login</h2>
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                    <input type="email" placeholder="Email" required
                        onChange={e => setEmail(e.target.value)}
                        style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }} />

                    <input type="password" placeholder="Password" required
                        onChange={e => setPassword(e.target.value)}
                        style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }} />

                    <button type="submit" disabled={loading}
                        style={{ padding: "12px", background: "#0D8ABC", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
                        {loading ? "Logging in..." : "Login"}
                    </button>

                    <p style={{ textAlign: "center", marginTop: "10px" }}>
                        New Doctor? <Link href="/doctor/register" style={{ color: "#0D8ABC" }}>Register Here</Link>
                    </p>
                </form>
            </div>
        </>
    );
}
