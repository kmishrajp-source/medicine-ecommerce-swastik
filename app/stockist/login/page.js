"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function StockistLogin() {
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
            router.push("/stockist/dashboard");
        }
    };

    return (
        <>
            <Navbar cartCount={0} />
            <div className="container" style={{ marginTop: "100px", maxWidth: "400px" }}>
                <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Stockist Login</h2>
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                    <input type="email" placeholder="Email" required
                        onChange={e => setEmail(e.target.value)}
                        style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }} />

                    <input type="password" placeholder="Password" required
                        onChange={e => setPassword(e.target.value)}
                        style={{ padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }} />

                    <button type="submit" disabled={loading}
                        style={{ padding: "12px", background: "#B91C1C", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
                        {loading ? "Logging in..." : "Login"}
                    </button>

                    <p style={{ textAlign: "center", marginTop: "10px" }}>
                        New Stockist? <Link href="/stockist/register" style={{ color: "#B91C1C" }}>Register Here</Link>
                    </p>
                </form>
            </div>
        </>
    );
}
