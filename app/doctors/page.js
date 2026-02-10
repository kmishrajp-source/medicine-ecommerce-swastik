"use client";
import React, { useState, useEffect } from 'react';
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import Link from 'next/link';

export default function DoctorList() {
    const { cartCount, toggleCart } = useCart();
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/doctors')
            .then(res => res.json())
            .then(data => {
                if (data.success) setDoctors(data.doctors);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    return (
        <>
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />
            <div className="container" style={{ marginTop: '120px' }}>
                <h1 style={{ marginBottom: '20px' }}>Find a Doctor</h1>
                {loading ? <p>Loading doctors...</p> : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                        {doctors.map(doc => (
                            <div key={doc.id} style={{ border: '1px solid #eee', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                <h3>{doc.user.name}</h3>
                                <p style={{ color: '#666' }}>{doc.specialization}</p>
                                <p style={{ fontSize: '0.9rem' }}>🏥 {doc.hospital || 'Private Practice'}</p>
                                <p style={{ fontSize: '0.9rem' }}>⭐ {doc.experience} years experience</p>
                                <Link href={`/doctors/${doc.id}`} className="btn btn-primary" style={{ display: 'block', textAlign: 'center', marginTop: '15px' }}>
                                    View Profile & Book
                                </Link>
                            </div>
                        ))}
                        {doctors.length === 0 && <p>No doctors registered yet.</p>}
                    </div>
                )}
            </div>
        </>
    );
}
