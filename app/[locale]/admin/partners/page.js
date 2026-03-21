"use client";
import { useState, useEffect } from 'react';
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";

export default function PartnerManagement() {
    const { cartCount, toggleCart } = useCart();
    const [hospitals, setHospitals] = useState([]);
    const [insurance, setInsurance] = useState([]);
    const [manufacturers, setManufacturers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPartners();
    }, []);

    const fetchPartners = async () => {
        try {
            const res = await fetch('/api/admin/partners');
            const data = await res.json();
            if (data.success) {
                setHospitals(data.hospitals);
                setInsurance(data.insurance);
                setManufacturers(data.manufacturers);
            }
        } catch (error) {
            console.error("Failed to fetch partners:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ padding: '100px', textAlign: 'center' }}>Loading Partner Data...</div>;

    return (
        <>
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />
            <main className="container" style={{ marginTop: '100px', padding: '20px' }}>
                <h1 style={{ marginBottom: '40px' }}>Partner Ecosystem Management</h1>

                <div style={{ display: 'grid', gap: '40px' }}>
                    {/* Hospitals */}
                    <div style={sectionStyle}>
                        <h2>Hospital Partners</h2>
                        <table style={tableStyle}>
                            <thead>
                                <tr><th>Name</th><th>License</th><th>Status</th><th>Actions</th></tr>
                            </thead>
                            <tbody>
                                {hospitals.map(h => (
                                    <tr key={h.id}>
                                        <td>{h.name}</td>
                                        <td>{h.licenseNumber}</td>
                                        <td>{h.verified ? '✅ Verified' : '⏳ Pending'}</td>
                                        <td><button className="btn" style={{ fontSize: '0.7rem' }}>Verify</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Manufacturers */}
                    <div style={sectionStyle}>
                        <h2>Manufacturers & Distributors</h2>
                        <table style={tableStyle}>
                            <thead>
                                <tr><th>Company</th><th>Contact</th><th>Status</th><th>Actions</th></tr>
                            </thead>
                            <tbody>
                                {manufacturers.map(m => (
                                    <tr key={m.id}>
                                        <td>{m.companyName}</td>
                                        <td>{m.contactPerson}</td>
                                        <td>{m.verified ? '✅ Verified' : '⏳ Pending'}</td>
                                        <td><button className="btn" style={{ fontSize: '0.7rem' }}>Verify</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Insurance */}
                    <div style={sectionStyle}>
                        <h2>Insurance Providers</h2>
                        <table style={tableStyle}>
                            <thead>
                                <tr><th>Company</th><th>Fee (₹)</th><th>Status</th><th>Actions</th></tr>
                            </thead>
                            <tbody>
                                {insurance.map(i => (
                                    <tr key={i.id}>
                                        <td>{i.companyName}</td>
                                        <td>{i.handlingFee}</td>
                                        <td>{i.verified ? '✅ Verified' : '⏳ Pending'}</td>
                                        <td><button className="btn" style={{ fontSize: '0.7rem' }}>Verify</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </>
    );
}

const sectionStyle = {
    background: 'white',
    padding: '25px',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
};

const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '15px'
};
