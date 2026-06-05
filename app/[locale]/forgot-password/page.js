"use client";
import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState(""); // loading, success, error
    const [message, setMessage] = useState("");
    const [resetLink, setResetLink] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus("loading");
        setMessage("");
        setResetLink("");

        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (res.ok) {
                setStatus("success");
                setMessage(data.message || "Reset link generated successfully.");
                if (data.resetLink) {
                    setResetLink(data.resetLink);
                }
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
            <div style={{ maxWidth: '480px', margin: '120px auto', padding: '40px', background: 'white', borderRadius: '16px', boxShadow: 'var(--shadow-md)' }}>
                <h2 style={{ marginBottom: '10px', textAlign: 'center' }}>Reset Password</h2>
                <p style={{ textAlign: 'center', marginBottom: '20px', color: '#666', fontSize: '0.9rem' }}>
                    Enter your registered email address to get a password reset link.
                </p>

                {status === "success" ? (
                    <div>
                        <div style={{ textAlign: 'center', padding: '16px', background: '#e8f5e9', color: '#2e7d32', borderRadius: '8px', border: '1px solid #c8e6c9', marginBottom: '16px' }}>
                            <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>✅ Reset Link Ready!</p>
                            <p style={{ fontSize: '0.9rem' }}>{message}</p>
                        </div>

                        {resetLink && (
                            <div style={{ background: '#f3f4f6', borderRadius: '8px', padding: '16px', marginBottom: '16px', border: '1px solid #e5e7eb' }}>
                                <p style={{ fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '8px', color: '#374151' }}>
                                    🔗 Your Password Reset Link:
                                </p>
                                <a
                                    href={resetLink}
                                    style={{
                                        display: 'block',
                                        background: '#00796b',
                                        color: 'white',
                                        padding: '12px 20px',
                                        borderRadius: '8px',
                                        textDecoration: 'none',
                                        fontWeight: 'bold',
                                        textAlign: 'center',
                                        fontSize: '1rem',
                                        marginBottom: '10px'
                                    }}
                                >
                                    Click Here to Reset Password
                                </a>
                                <p style={{ fontSize: '0.75rem', color: '#6b7280', textAlign: 'center' }}>
                                    ⏰ This link expires in 1 hour
                                </p>
                            </div>
                        )}

                        <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#666' }}>
                            <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Return to Login</Link>
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        {status === "error" && (
                            <div style={{ color: 'red', marginBottom: '15px', textAlign: 'center', fontSize: '0.9rem', background: '#ffebee', padding: '10px', borderRadius: '6px' }}>
                                {message}
                            </div>
                        )}

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="name@example.com"
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary full-width"
                            disabled={status === "loading"}
                            style={{ opacity: status === "loading" ? 0.7 : 1, width: '100%' }}
                        >
                            {status === "loading" ? "Generating Reset Link..." : "Get Reset Link"}
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
