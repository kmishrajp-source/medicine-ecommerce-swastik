"use client";
import React, { useState, useEffect } from 'react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/context/CartContext";

export default function AyurvedicShop() {
    const { cartCount, toggleCart } = useCart();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch all products and filter for Ayurvedic
        // In a real app, you'd have a specific API endpoint or query param like ?category=Ayurvedic
        fetch('/api/products')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    const ayurvedic = data.products.filter(p =>
                        p.category === 'Ayurvedic' ||
                        p.name.toLowerCase().includes('herbal') ||
                        p.description.toLowerCase().includes('natural')
                    );
                    setProducts(ayurvedic);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    return (
        <>
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />

            {/* Hero Section for Ayurveda */}
            <div style={{ background: '#ECFDF5', padding: '60px 20px', marginTop: '80px', textAlign: 'center' }}>
                <h1 style={{ color: '#047857', fontSize: '2.5rem', marginBottom: '10px' }}>🌿 Ayurvedic & Herbal Care</h1>
                <p style={{ color: '#065F46', fontSize: '1.2rem' }}>Ancient wisdom for modern health. 100% Natural.</p>
            </div>

            <div className="container" style={{ marginTop: '40px', paddingBottom: '60px' }}>
                {loading ? <p>Loading herbal products...</p> : (
                    <>
                        {products.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                                <h3>No Ayurvedic products listed yet.</h3>
                                <p>Admin needs to add products with category "Ayurvedic".</p>
                            </div>
                        ) : (
                            <div className="product-grid">
                                {products.map(product => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
            <Footer />
        </>
    );
}
