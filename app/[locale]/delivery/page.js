"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function DeliveryLogin() {
    const [orderId, setOrderId] = useState("");
    const [code, setCode] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleVerify = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        try {
            const res = await fetch("/api/verify-delivery", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId, code }),
            });

            const data = await res.json();

            if (data.success) {
                setMessage(data.message);
                setOrderId("");
                setCode("");
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError("Verification failed. Check network.");
        }
    };

    return (
        <>
            <Navbar cartCount={0} openCart={() => { }} />
            <div style={{ maxWidth: '400px', margin: '120px auto', padding: '40px', background: 'white', borderRadius: '16px', boxShadow: 'var(--shadow-md)' }}>
                <h2 style={{ marginBottom: '20px', textAlign: 'center', color: 'var(--primary)' }}>Delivery Agent Portal</h2>

                {message && <div style={{ color: 'green', background: '#E8F5E9', padding: '10px', borderRadius: '8px', marginBottom: '15px', textAlign: 'center' }}>{message}</div>}
                {error && <div style={{ color: 'red', background: '#FFEBEE', padding: '10px', borderRadius: '8px', marginBottom: '15px', textAlign: 'center' }}>{error}</div>}

                <form onSubmit={handleVerify}>
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Order ID</label>
                        <input
                            type="text"
                            value={orderId}
                            onChange={(e) => setOrderId(e.target.value)}
                            placeholder="e.g. clx..."
                            required
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
                        />
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Secret Delivery Code</label>
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="e.g. 1234"
                            required
                            maxLength="4"
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '1.2rem', letterSpacing: '2px' }}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary full-width" style={{ padding: '12px', fontSize: '1rem' }}>Verify Delivery</button>
                </form>

                <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #eee', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '15px' }}>Want to earn with us?</p>
                    <Link href="/agent/register" className="btn" style={{
                        background: '#E8F5E9',
                        color: '#2E7D32',
                        border: '1px solid #2E7D32',
                        width: '100%',
                        display: 'block',
                        textDecoration: 'none',
                        padding: '10px',
                        fontWeight: 'bold'
                    }}>
                        <i className="fa-solid fa-motorcycle" style={{ marginRight: '8px' }}></i>
                        Join as Delivery Partner
                    </Link>
                </div>
            </div>
        </>
    );
}
