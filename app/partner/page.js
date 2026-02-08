"use client";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";

export default function PartnerPortal() {
    const { cartCount, toggleCart } = useCart();

    return (
        <>
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />

            <main className="container" style={{ marginTop: '120px', paddingBottom: '60px', maxWidth: '1000px' }}>
                <div style={{ textAlign: 'center', marginBottom: '50px' }}>
                    <h1 style={{ fontSize: '2.5rem', color: 'var(--primary)', marginBottom: '10px' }}>Staff & Partner Portal</h1>
                    <p style={{ color: '#666', fontSize: '1.2rem' }}>Access internal management tools securely.</p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '30px',
                    padding: '20px'
                }}>
                    {/* Admin Card */}
                    <Link href="/admin" style={{ textDecoration: 'none' }}>
                        <div style={{
                            background: 'white',
                            padding: '40px',
                            borderRadius: '20px',
                            boxShadow: 'var(--shadow-md)',
                            textAlign: 'center',
                            transition: 'transform 0.2s',
                            cursor: 'pointer',
                            border: '1px solid #eee'
                        }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div style={{ fontSize: '3rem', color: 'var(--primary)', marginBottom: '20px' }}>
                                <i className="fa-solid fa-user-shield"></i>
                            </div>
                            <h2 style={{ color: '#333', marginBottom: '10px' }}>Admin Dashboard</h2>
                            <p style={{ color: '#666' }}>Manage orders, inventory, and view reports.</p>
                            <div className="btn btn-primary" style={{ marginTop: '20px', display: 'inline-block' }}>Access Admin Panel</div>
                        </div>
                    </Link>

                    {/* Delivery Card */}
                    <Link href="/delivery" style={{ textDecoration: 'none' }}>
                        <div style={{
                            background: 'white',
                            padding: '40px',
                            borderRadius: '20px',
                            boxShadow: 'var(--shadow-md)',
                            textAlign: 'center',
                            transition: 'transform 0.2s',
                            cursor: 'pointer',
                            border: '1px solid #eee'
                        }}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            <div style={{ fontSize: '3rem', color: '#10B981', marginBottom: '20px' }}>
                                <i className="fa-solid fa-truck-fast"></i>
                            </div>
                            <h2 style={{ color: '#333', marginBottom: '10px' }}>Delivery Agent</h2>
                            <p style={{ color: '#666' }}>Verify customer delivery codes and update status.</p>
                            <div className="btn btn-secondary" style={{ marginTop: '20px', display: 'inline-block' }}>Delivery Login</div>
                        </div>
                    </Link>
                </div>

                <div style={{ textAlign: 'center', marginTop: '50px', color: '#888', fontSize: '0.9rem' }}>
                    <p>Secured Area. Authorized Personnel Only.</p>
                </div>
            </main>
        </>
    );
}
