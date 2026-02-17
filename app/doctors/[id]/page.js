"use client";
import { useState, useEffect } from 'react';
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";

export default function DoctorProfile() {
    const { id } = useParams();
    const { data: session } = useSession();
    const router = useRouter();
    const { cartCount, toggleCart } = useCart();
    const [doctor, setDoctor] = useState(null);
    const [date, setDate] = useState("");
    const [reason, setReason] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetch(`/api/doctors/${id}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) setDoctor(data.doctor);
            });
    }, [id]);

    const handleBook = async (e) => {
        e.preventDefault();
        if (!session) return router.push('/login');
        setLoading(true);

        const res = await fetch('/api/appointments', {
            method: 'POST',
            body: JSON.stringify({ doctorId: id, date, reason })
        });
        const data = await res.json();
        if (data.success) {
            alert("Appointment Booked Successfully!");
            router.push('/profile'); // Redirect to user profile to see bookings
        } else {
            alert("Error: " + data.error);
        }
        setLoading(false);
    };

    if (!doctor) return <div>Loading...</div>;

    return (
        <>
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />
            <div className="container" style={{ marginTop: '120px', maxWidth: '800px' }}>
                <div style={{ border: '1px solid #ddd', padding: '30px', borderRadius: '16px' }}>
                    <h1>Dr. {doctor.user.name}</h1>
                    <p style={{ fontSize: '1.2rem', color: '#666' }}>{doctor.specialization}</p>
                    <hr style={{ margin: '20px 0' }} />
                    <p><strong>Hospital:</strong> {doctor.hospital || 'N/A'}</p>
                    <p><strong>Experience:</strong> {doctor.experience} Years</p>

                    <h3 style={{ marginTop: '30px' }}>Book Appointment</h3>
                    {session ? (
                        <form onSubmit={handleBook} style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '400px', marginTop: '15px' }}>
                            <input type="datetime-local" required onChange={e => setDate(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
                            <textarea placeholder="Reason for visit..." onChange={e => setReason(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}></textarea>
                            <button type="submit" disabled={loading} className="btn btn-primary">{loading ? "Booking..." : "Confirm Booking"}</button>
                        </form>
                    ) : (
                        <p>Please <a href="/login" style={{ color: 'blue' }}>Login</a> to book an appointment.</p>
                    )}
                </div>
            </div>
        </>
    );
}
