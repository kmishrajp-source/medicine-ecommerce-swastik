"use client";
import React, { useState, useEffect } from 'react';
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LabList() {
    const { cartCount, toggleCart } = useCart();
    const { data: session } = useSession();
    const router = useRouter();
    const [labs, setLabs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/labs')
            .then(res => res.json())
            .then(data => {
                if (data.success) setLabs(data.labs);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const handleBook = async (labId, testId) => {
        if (!session) return router.push('/login');
        if (!confirm("Confirm booking for this test?")) return;

        try {
            const res = await fetch('/api/labs/book', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ testId })
            });
            const data = await res.json();
            if (data.success) {
                alert("Lab Test Booked Successfully!");
                router.push('/profile');
            } else {
                alert("Error: " + data.error);
            }
        } catch (err) {
            alert("Booking failed");
        }
    };

    return (
        <>
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />
            <div className="container" style={{ marginTop: '120px' }}>
                <h1 style={{ marginBottom: '20px' }}>Book Diagnostic Tests</h1>
                {loading ? <p>Loading labs...</p> : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                        {labs.map(lab => (
                            <div key={lab.id} style={{ border: '1px solid #eee', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                    <div>
                                        <h2 style={{ margin: 0 }}>{lab.name}</h2>
                                        <p style={{ color: '#666', margin: 0 }}>📍 {lab.address}</p>
                                    </div>
                                    <span style={{ background: '#E0E7FF', color: '#4338CA', padding: '5px 10px', borderRadius: '20px', fontSize: '0.8rem' }}>Verified Lab</span>
                                </div>

                                <h4>Available Tests:</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px', marginTop: '10px' }}>
                                    {lab.tests.map(test => (
                                        <div key={test.id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '10px', background: '#FAFAFA' }}>
                                            <div style={{ fontWeight: 'bold' }}>{test.name}</div>
                                            <div style={{ fontSize: '0.9rem', color: '#666' }}>{test.description}</div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                                                <div style={{ fontWeight: 'bold', color: '#10B981' }}>₹{test.price}</div>
                                                <button onClick={() => handleBook(lab.id, test.id)} className="btn btn-primary" style={{ padding: '5px 10px', fontSize: '0.8rem' }}>
                                                    Book Now
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {lab.tests.length === 0 && <p style={{ color: '#999', fontStyle: 'italic' }}>No tests listed yet.</p>}
                                </div>
                            </div>
                        ))}
                        {labs.length === 0 && <p>No labs registered yet.</p>}
                    </div>
                )}
            </div>
        </>
    );
}
