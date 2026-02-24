"use client";
import React, { useState } from 'react';
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";

export default function RegisterAmbulance() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        driverName: '',
        vehicleNumber: '',
        vehicleType: 'Basic', // Basic, ICU
        city: '',
        phone: '',
        pricePerKm: 20
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await fetch('/api/ambulance/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        const data = await res.json();
        if (data.success) {
            router.push('/ambulance/dashboard');
        } else {
            alert(data.error);
        }
    };

    return (
        <>
            <Navbar />
            <div className="container" style={{ marginTop: '120px', maxWidth: '600px' }}>
                <div style={{ background: 'white', padding: '40px', borderRadius: '16px', boxShadow: 'var(--shadow-lg)' }}>
                    <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#DC2626' }}>🚑 Partner with Swastik</h2>
                    <p style={{ textAlign: 'center', marginBottom: '30px' }}>Register your Ambulance Service</p>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Driver Name</label>
                            <input type="text" className="input-field" required onChange={e => setFormData({ ...formData, driverName: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Vehicle Number</label>
                            <input type="text" className="input-field" required onChange={e => setFormData({ ...formData, vehicleNumber: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Type</label>
                            <select className="input-field" onChange={e => setFormData({ ...formData, vehicleType: e.target.value })}>
                                <option value="Basic">Basic Life Support</option>
                                <option value="ICU">Advanced ICU</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Base City</label>
                            <input type="text" className="input-field" required onChange={e => setFormData({ ...formData, city: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Phone</label>
                            <input type="tel" className="input-field" required onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%', background: '#DC2626' }}>Register Ambulance</button>
                    </form>
                </div>
            </div>
        </>
    );
}
