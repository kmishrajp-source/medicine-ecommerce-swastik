"use client";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { useSession } from "next-auth/react";
import { useCart } from "@/context/CartContext";

export default function RequestMedicine() {
    const { data: session } = useSession();
    const { cartCount, toggleCart } = useCart();
    const [formData, setFormData] = useState({
        name: "",
        quantity: "",
        phone: "",
        guestName: "",
        prescriptionUrl: "" // TODO: Implement file upload if needed, for now text or external link
    });
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const res = await fetch('/api/request-medicine', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (res.ok) {
            alert("Request submitted! We will contact you shortly.");
            setFormData({ name: "", quantity: "", phone: "", guestName: "", prescriptionUrl: "" });
        } else {
            alert("Failed to submit request.");
        }
        setSubmitting(false);
    };

    return (
        <>
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />
            <div className="container" style={{ marginTop: '120px', maxWidth: '600px' }}>
                <div className="glass" style={{ padding: '40px', borderRadius: '16px' }}>
                    <h1 style={{ textAlign: 'center', marginBottom: '10px' }}>💊 Request Medicine</h1>
                    <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>
                        Can't find what you need? Tell us, and we'll arrange it for you.
                    </p>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <label>Medicine Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                                placeholder="e.g. Dolo 650"
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
                            />
                        </div>

                        <div>
                            <label>Quantity</label>
                            <input
                                type="text"
                                value={formData.quantity}
                                onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                                required
                                placeholder="e.g. 2 strips"
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
                            />
                        </div>

                        {!session && (
                            <>
                                <div>
                                    <label>Your Name</label>
                                    <input
                                        type="text"
                                        value={formData.guestName}
                                        onChange={e => setFormData({ ...formData, guestName: e.target.value })}
                                        required
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
                                    />
                                </div>
                                <div>
                                    <label>Phone Number</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        required
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
                                    />
                                </div>
                            </>
                        )}

                        <button type="submit" disabled={submitting} className="btn btn-primary" style={{ padding: '15px' }}>
                            {submitting ? 'Submitting...' : 'Send Request'}
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
}
