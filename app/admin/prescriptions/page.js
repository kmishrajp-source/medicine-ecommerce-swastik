"use client";
import React, { useState, useEffect } from 'react';
import Navbar from "@/components/Navbar";

export default function AdminPrescriptions() {
    const [prescriptions, setPrescriptions] = useState([]);
    const [products, setProducts] = useState([]); // Inventory to select from
    const [selectedPrescription, setSelectedPrescription] = useState(null);
    const [cart, setCart] = useState([]); // Items admin is adding to this order
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
        fetchProducts();
    }, []);

    const fetchData = () => {
        fetch('/api/prescription/upload')
            .then(res => res.json())
            .then(data => {
                if (data.success) setPrescriptions(data.prescriptions);
                setLoading(false);
            });
    };

    const fetchProducts = () => {
        fetch('/api/products')
            .then(res => res.json())
            .then(data => { if (data.success) setProducts(data.products); });
    };

    const addToOrder = (product) => {
        setCart([...cart, { ...product, quantity: 1 }]);
    };

    const handleProcess = async () => {
        if (!selectedPrescription || cart.length === 0) return;

        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        const res = await fetch('/api/prescription/process', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                prescriptionId: selectedPrescription.id,
                items: cart,
                total,
                patientId: selectedPrescription.patientId
            })
        });

        const data = await res.json();
        if (data.success) {
            alert(`Order Created! Secret Code: ${data.deliveryCode}. SMS sent to customer.`);
            setSelectedPrescription(null);
            setCart([]);
            fetchData();
        } else {
            alert("Failed to process.");
        }
    };

    return (
        <>
            <Navbar />
            <div className="container" style={{ marginTop: '120px' }}>
                <h1 style={{ color: '#1F2937' }}>🩺 Prescription Processing</h1>

                {selectedPrescription ? (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                        {/* Left: Image */}
                        <div>
                            <button onClick={() => setSelectedPrescription(null)} style={{ marginBottom: '10px' }}>&larr; Back</button>
                            <img src={selectedPrescription.imageUrl} alt="Script" style={{ width: '100%', borderRadius: '8px', border: '1px solid #ddd' }} />
                        </div>

                        {/* Right: Order Builder */}
                        <div>
                            <h3>Create Order for {selectedPrescription.patient?.name}</h3>
                            <div style={{ height: '200px', overflowY: 'scroll', border: '1px solid #eee', padding: '10px', marginBottom: '20px' }}>
                                {products.map(p => (
                                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px', borderBottom: '1px solid #eee' }}>
                                        <span>{p.name} (₹{p.price})</span>
                                        <button onClick={() => addToOrder(p)}>+</button>
                                    </div>
                                ))}
                            </div>

                            <h4>Selected Items (Total: ₹{cart.reduce((s, i) => s + i.price, 0).toFixed(2)})</h4>
                            <ul>
                                {cart.map((item, idx) => (
                                    <li key={idx}>{item.name} - ₹{item.price}</li>
                                ))}
                            </ul>

                            <button onClick={handleProcess} className="btn btn-primary" style={{ marginTop: '20px', width: '100%' }}>
                                Create Order & Send Invoice
                            </button>
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px', marginTop: '30px' }}>
                        {prescriptions.length === 0 && <p>No pending prescriptions.</p>}
                        {prescriptions.map(p => (
                            <div key={p.id} style={{ background: 'white', padding: '15px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                <img src={p.imageUrl} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '4px' }} />
                                <div style={{ marginTop: '10px' }}>
                                    <div style={{ fontWeight: 'bold' }}>{p.patient?.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#666' }}>{new Date(p.createdAt).toLocaleDateString()}</div>
                                    <button onClick={() => setSelectedPrescription(p)} className="btn btn-primary" style={{ marginTop: '10px', width: '100%' }}>Process</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
