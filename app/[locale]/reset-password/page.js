"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function ResetPassword() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const router = useRouter();

    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [status, setStatus] = useState(""); // loading, success, error
    const [message, setMessage] = useState("");

    // Missing token security gate
    if (!token) {
        return (
            <>
                <Navbar cartCount={0} openCart={() => { }} />
                <div style={{ maxWidth: '400px', margin: '120px auto', padding: '40px', background: 'white', borderRadius: '16px', boxShadow: 'var(--shadow-md)', textAlign: 'center' }}>
                    <h2 style={{ color: 'red', marginBottom: '15px' }}>Invalid Access</h2>
                    <p style={{ marginBottom: '20px' }}>No secure reset token was provided in the URL link.</p>
                    <Link href="/forgot-password" className="btn btn-primary">Request New Link</Link>
                </div>
            </>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirm) {
            setStatus("error");
            setMessage("Passwords do not match!");
            return;
        }

        if (password.length < 6) {
            setStatus("error");
            setMessage("Password must be at least 6 characters.");
            return;
        }

        setStatus("loading");
        setMessage("");

        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, newPassword: password }),
            });

            const data = await res.json();

            if (res.ok) {
                setStatus("success");
                setMessage("Your password was updated successfully!");
                setTimeout(() => router.push("/login"), 3000);
            } else {
                setStatus("error");
                setMessage(data.error || "Failed to reset password");
            }
        } catch (error) {
            setStatus("error");
            setMessage("Failed to connect to the secure server.");
        }
    };

    return (
        <>
            <Navbar cartCount={0} openCart={() => { }} />
            <div style={{ maxWidth: '400px', margin: '120px auto', padding: '40px', background: 'white', borderRadius: '16px', boxShadow: 'var(--shadow-md)' }}>
                <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>Create New Password</h2>

                {status === "success" ? (
                    <div style={{ textAlign: 'center', padding: '20px', background: '#e8f5e9', color: '#2e7d32', borderRadius: '8px', border: '1px solid #c8e6c9' }}>
                        <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>{message}</p>
                        <p style={{ fontSize: '0.9rem' }}>Redirecting to login...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        {status === "error" && <div style={{ color: 'red', marginBottom: '15px', textAlign: 'center', fontSize: '0.9rem', background: '#ffebee', padding: '10px', borderRadius: '6px' }}>{message}</div>}

                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>New Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength="6"
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
                            />
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Confirm Password</label>
                            <input
                                type="password"
                                value={confirm}
                                onChange={(e) => setConfirm(e.target.value)}
                                required
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary full-width"
                            disabled={status === "loading"}
                            style={{ opacity: status === "loading" ? 0.7 : 1 }}
                        >
                            {status === "loading" ? "Encrypting..." : "Update Password"}
                        </button>
                    </form>
                )}
            </div>
        </>
    );
}
