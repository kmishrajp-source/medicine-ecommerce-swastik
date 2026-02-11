"use client";
import React, { useState } from 'react';
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";

export default function RegisterPharma() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        companyName: '',
        licenseNumber: '',
        address: '',
        phone: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await fetch('/api/pharma/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        const data = await res.json();
        if (data.success) {
            alert("Registration Successful!");
            router.push('/pharma-portal');
        } else {
            alert(data.error);
        }
    };

    return (
        <>
            <Navbar />
            <div className="container" style={{ marginTop: '120px', maxWidth: '600px' }}>
                <div style={{ background: 'white', padding: '40px', borderRadius: '16px', boxShadow: 'var(--shadow-lg)' }}>
                    <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#4F46E5' }}>🏢 Partner with Swastik</h2>
                    <p style={{ textAlign: 'center', marginBottom: '30px' }}>Register Pharma Company</p>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Company Name</label>
                            <input type="text" className="input-field" required onChange={e => setFormData({ ...formData, companyName: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>License Number (DL)</label>
                            <input type="text" className="input-field" required onChange={e => setFormData({ ...formData, licenseNumber: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Headquarter Address</label>
                            <input type="text" className="input-field" required onChange={e => setFormData({ ...formData, address: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Contact Phone</label>
                            <input type="tel" className="input-field" required onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: '100%', background: '#4F46E5' }}>Register Company</button>
                    </form>
                </div>
            </div>
        </>
    );
}
