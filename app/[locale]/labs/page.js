"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";

export default function LabDirectory() {
    const [labs, setLabs] = useState([]);
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToCart, cartCount, toggleCart } = useCart();
    const router = useRouter();

    useEffect(() => {
        fetchLabData();
    }, []);

    const fetchLabData = async () => {
        setLoading(true);
        try {
            // Check if we need to auto-seed
            await fetch('/api/seed-labs', { method: 'GET' }).catch(() => {});
            
            // Fetch the tests from API (we need an API route for this)
            const res = await fetch('/api/labs/tests');
            const data = await res.json();
            if (data.success) {
                setTests(data.tests);
            }
        } catch (error) {
            console.error("Error fetching labs:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />
            
            <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', padding: '60px 0', color: 'white', textAlign: 'center', marginTop: '60px' }}>
                <div className="container">
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '15px' }}>
                        <i className="fa-solid fa-flask" style={{ color: '#38bdf8' }}></i> Swastik Diagnostics
                    </h1>
                    <p style={{ fontSize: '1.2rem', opacity: 0.9, maxWidth: '600px', margin: '0 auto' }}>
                        Book reliable Lab Tests with Home Sample Collection. Fast Turnaround times.
                    </p>
                </div>
            </div>

            <div className="container" style={{ marginTop: "40px", paddingBottom: "60px" }}>
                <h2 style={{ fontSize: "1.8rem", color: "#0f172a", marginBottom: "30px", borderBottom: "2px solid #e2e8f0", paddingBottom: "10px" }}>
                    Select Lab Tests
                </h2>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '50px', color: '#64748b' }}>
                        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2.5rem', marginBottom: '15px', color: '#3b82f6' }}></i>
                        <p>Loading available diagnostic tests...</p>
                    </div>
                ) : tests.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#64748b', fontSize: '1.1rem' }}>No lab tests found. Processing catalog update...</p>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px' }}>
                        {tests.map(test => (
                            <div key={test.id} style={{ 
                                background: 'white', 
                                borderRadius: '16px', 
                                padding: '25px', 
                                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                                display: 'flex',
                                flexDirection: 'column',
                                transition: 'transform 0.2s',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                                    <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.2rem', flex: 1, paddingRight: '15px' }}>
                                        {test.name}
                                    </h3>
                                    <span style={{ fontSize: '1.3rem', fontWeight: '900', color: '#2563eb' }}>
                                        ₹{test.price}
                                    </span>
                                </div>
                                
                                <p style={{ color: '#64748b', fontSize: '0.95rem', flex: 1, lineHeight: '1.5', margin: '0 0 20px 0' }}>
                                    {test.description}
                                </p>
                                
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
                                    <div style={{ color: '#475569', fontSize: '0.85rem' }}>
                                        <i className="fa-solid fa-clock" style={{ color: '#d97706', marginRight: '5px' }}></i>
                                        Report TAT: <strong>{test.turnaroundTime}</strong>
                                    </div>
                                    <div style={{ color: '#475569', fontSize: '0.85rem' }}>
                                        <i className="fa-solid fa-house-medical" style={{ color: '#10b981', marginRight: '5px' }}></i>
                                        Home Collection
                                    </div>
                                </div>

                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        addToCart({
                                            id: `lab-${test.id}`,
                                            name: test.name,
                                            price: test.price,
                                            image: "https://via.placeholder.com/150?text=Lab+Test",
                                            isLab: true,
                                            labId: test.labId
                                        });
                                    }}
                                    style={{ 
                                        background: '#2563eb', 
                                        color: 'white', 
                                        border: 'none', 
                                        padding: '14px', 
                                        borderRadius: '8px', 
                                        fontSize: '1rem', 
                                        fontWeight: 'bold', 
                                        cursor: 'pointer',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        gap: '10px'
                                    }}
                                >
                                    <i className="fa-solid fa-cart-plus"></i> Add Test
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
