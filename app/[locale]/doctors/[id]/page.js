"use client";
import { useState, useEffect } from 'react';
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import Script from "next/script";

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

        try {
            // 1. Create a Razorpay Order
            const orderRes = await fetch('/api/appointments/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ doctorId: id })
            });
            const orderData = await orderRes.json();

            if (!orderData.success) {
                alert("Error setting up payment: " + orderData.error);
                setLoading(false);
                return;
            }

            // 2. Open Razorpay Checkout Modal
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "Swastik Medicare - Doctor Consultation",
                description: `Consultation with Dr. ${doctor.user.name}`,
                order_id: orderData.id,
                handler: async function (response) {
                    // 3. Send payment proof to save the booking
                    const verifyRes = await fetch('/api/appointments', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            doctorId: id,
                            date,
                            reason,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpayOrderId: response.razorpay_order_id,
                            razorpaySignature: response.razorpay_signature
                        })
                    });
                    const verifyData = await verifyRes.json();

                    if (verifyData.success) {
                        alert("Appointment Booked Successfully!");
                        router.push('/profile');
                    } else {
                        alert("Payment verification failed: " + verifyData.error);
                    }
                },
                prefill: {
                    name: session.user.name || "Patient",
                    email: session.user.email || "",
                },
                theme: { color: "#4338ca" }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                alert("Payment Failed. Reason: " + response.error.description);
            });
            rzp.open();

        } catch (error) {
            console.error(error);
            alert("Checkout Failed");
        }

        setLoading(false);
    };

    if (!doctor) return <div>Loading...</div>;

    return (
        <>
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />
            <div className="container" style={{ marginTop: '120px', maxWidth: '800px' }}>
                <div style={{ border: '1px solid #ddd', padding: '30px', borderRadius: '16px' }}>
                    <h1>Dr. {doctor.user.name}</h1>
                    <p style={{ fontSize: '1.2rem', color: '#666' }}>{doctor.specialization}</p>
                    <hr style={{ margin: '20px 0' }} />
                    <p><strong>Hospital:</strong> {doctor.hospital || 'N/A'}</p>
                    <p><strong>Experience:</strong> {doctor.experience} Years</p>
                    <p><strong>Consultation Fee:</strong> ₹{doctor.consultationFee || 500}</p>

                    <h3 style={{ marginTop: '30px' }}>Book Appointment</h3>
                    {session ? (
                        <form onSubmit={handleBook} style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '400px', marginTop: '15px' }}>
                            <input type="datetime-local" required onChange={e => setDate(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
                            <textarea placeholder="Reason for visit..." onChange={e => setReason(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}></textarea>
                            <button type="submit" disabled={loading} className="btn btn-primary" style={{ background: '#4338ca', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                                {loading ? "Processing..." : `Pay ₹${doctor.consultationFee || 500} & Book`}
                            </button>
                        </form>
                    ) : (
                        <p>Please <a href="/login" style={{ color: 'blue' }}>Login</a> to book an appointment.</p>
                    )}
                </div>
            </div>
        </>
    );
}
