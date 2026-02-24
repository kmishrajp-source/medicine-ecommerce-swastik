"use client";
import { useState } from 'react';
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";

export default function AgentRegister() {
    const { cartCount, toggleCart } = useCart();
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', password: '', vehicleNumber: '', licenseNumber: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const res = await fetch('/api/agent/register', {
            method: 'POST',
            body: JSON.stringify(formData),
            headers: { 'Content-Type': 'application/json' }
        });

        const data = await res.json();
        setLoading(false);

        if (data.success) {
            alert("Registration successful! Please login.");
            router.push('/login');
        } else {
            alert(data.error || "Registration failed");
        }
    };

    return (
        <>
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />
            <div className="container" style={{ marginTop: '100px', maxWidth: '500px' }}>
                <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                    <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#1B5E20' }}>
                        <i className="fa-solid fa-motorcycle" style={{ marginRight: '10px' }}></i>
                        Register as Delivery Partner
                    </h2>
                    <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>Earn ₹50 per successful delivery directly to your wallet!</p>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <input type="text" name="name" placeholder="Full Name" required onChange={handleChange} style={inputStyle} />
                        <input type="email" name="email" placeholder="Email Address" required onChange={handleChange} style={inputStyle} />
                        <input type="tel" name="phone" placeholder="Phone Number" required onChange={handleChange} style={inputStyle} />
                        <input type="password" name="password" placeholder="Create Password" required onChange={handleChange} style={inputStyle} />
                        <input type="text" name="vehicleNumber" placeholder="Vehicle Reg Number (e.g. DL-01-AB-1234)" required onChange={handleChange} style={inputStyle} />
                        <input type="text" name="licenseNumber" placeholder="Driving License Number" required onChange={handleChange} style={inputStyle} />

                        <button type="submit" disabled={loading} style={{
                            background: '#1B5E20', color: 'white', padding: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', marginTop: '10px'
                        }}>
                            {loading ? "Registering..." : "Join Delivery Fleet"}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: '20px' }}>
                        Already a partner? <a href="/login" style={{ color: '#1B5E20', fontWeight: 'bold' }}>Login here</a>
                    </p>
                </div>
            </div>
        </>
    );
}

const inputStyle = {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '1rem'
};
