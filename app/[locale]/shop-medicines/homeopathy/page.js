"use client";
import React, { useState, useEffect } from 'react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/context/CartContext";

export default function HomeopathyShop() {
    const { cartCount, toggleCart } = useCart();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch all products and filter for Homeopathy
        fetch('/api/products')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    const homeopathy = data.products.filter(p =>
                        p.category === 'Homeopathy' ||
                        p.name.toLowerCase().includes('homeopath') ||
                        p.description.toLowerCase().includes('homeopath')
                    );
                    setProducts(homeopathy);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />

            {/* Hero Section for Homeopathy */}
            <div style={{ background: '#F0F9FF', padding: '60px 20px', paddingTop: '120px', textAlign: 'center' }}>
                <h1 style={{ color: '#0369A1', fontSize: '2.5rem', marginBottom: '10px', fontWeight: '900' }}>💧 Homeopathic Medicine Shop</h1>
                <p style={{ color: '#0284C7', fontSize: '1.2rem', fontWeight: '600' }}>Gentle, Natural & Effective Healing.</p>
            </div>

            <div className="max-w-7xl mx-auto px-6" style={{ marginTop: '40px', paddingBottom: '60px' }}>
                {loading ? (
                    <div className="py-20 text-center"><i className="fa-solid fa-spinner fa-spin text-2xl text-slate-300"></i></div>
                ) : (
                    <>
                        {products.length === 0 ? (
                            <div className="col-span-full py-32 text-center bg-white rounded-[3rem] border border-slate-100 shadow-sm px-6">
                                <i className="fa-solid fa-flask text-4xl text-slate-200 mb-6"></i>
                                <h3 className="text-xl font-black text-slate-400 mb-4">No Homeopathic products listed yet.</h3>
                                <p className="text-slate-400 font-bold">Admin needs to add products with category "Homeopathy".</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {products.map(product => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
            <Footer />
        </div>
    );
}
