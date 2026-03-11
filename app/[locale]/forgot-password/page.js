"use client";
import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState(""); // loading, success, error
    const [message, setMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus("loading");
        setMessage("");

        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (res.ok) {
                setStatus("success");
                setMessage("Check your email! We sent a secure link to reset your password.");
            } else {
                setStatus("error");
                setMessage(data.error || "An error occurred");
            }
        } catch (error) {
            setStatus("error");
            setMessage("Failed to connect to the server.");
        }
    };

    return (
        <>
            <Navbar cartCount={0} openCart={() => { }} />
            <div style={{ maxWidth: '400px', margin: '120px auto', padding: '40px', background: 'white', borderRadius: '16px', boxShadow: 'var(--shadow-md)' }}>
                <h2 style={{ marginBottom: '10px', textAlign: 'center' }}>Reset Password</h2>
                <p style={{ textAlign: 'center', marginBottom: '20px', color: '#666', fontSize: '0.9rem' }}>
                    Enter your email address and we will send you a link to reset your password.
                </p>

                {status === "success" ? (
                    <div style={{ textAlign: 'center', padding: '20px', background: '#e8f5e9', color: '#2e7d32', borderRadius: '8px', border: '1px solid #c8e6c9' }}>
                        <p style={{ fontWeight: 'bold', marginBottom: '15px' }}>{message}</p>
                        <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Return to Login</Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        {status === "error" && <div style={{ color: 'red', marginBottom: '15px', textAlign: 'center', fontSize: '0.9rem' }}>{message}</div>}

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="name@example.com"
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary full-width"
                            disabled={status === "loading"}
                            style={{ opacity: status === "loading" ? 0.7 : 1 }}
                        >
                            {status === "loading" ? "Sending Protocol..." : "Send Reset Link"}
                        </button>
                    </form>
                )}

                <p style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem' }}>
                    Remember your password? <Link href="/login" style={{ color: 'var(--primary)' }}>Log back in</Link>
                </p>
            </div>
        </>
    );
}
