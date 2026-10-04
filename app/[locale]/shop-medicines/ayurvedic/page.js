"use client";
import React, { useState, useEffect } from 'react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { useCart } from "@/context/CartContext";
import Link from "next/link";

const CATEGORIES = [
    { key: 'Diabetes Care',        icon: '🩸', color: '#dc2626', bg: '#fff1f2', desc: 'Natural blood sugar control & insulin support' },
    { key: 'Liver Care',           icon: '🫀', color: '#d97706', bg: '#fffbeb', desc: 'Detox, protect & regenerate liver function' },
    { key: 'Lung & Respiratory',   icon: '🫁', color: '#0284c7', bg: '#f0f9ff', desc: 'Cough, bronchitis & respiratory strength' },
    { key: 'Neuro & Brain',        icon: '🧠', color: '#7c3aed', bg: '#faf5ff', desc: 'Memory, focus & cognitive performance' },
    { key: 'Mind & Mental Wellness', icon: '🧘', color: '#059669', bg: '#ecfdf5', desc: 'Stress, anxiety, sleep & emotional balance' },
    { key: 'Skin Care',            icon: '✨', color: '#db2777', bg: '#fdf4ff', desc: 'Acne, blood purification & skin glow' },
    { key: 'Joint & Bone Care',    icon: '🦴', color: '#b45309', bg: '#fef9c3', desc: 'Arthritis, joint pain & bone strength' },
    { key: 'Heart Care',           icon: '❤️', color: '#e11d48', bg: '#fff1f2', desc: 'Cardiac tonic & heart muscle support' },
    { key: 'Immunity & Wellness',  icon: '🛡️', color: '#16a34a', bg: '#f0fdf4', desc: 'Immunity boosting & general vitality' },
];

export default function AyurvedicShop() {
    const { cartCount, toggleCart, addToCart } = useCart();
    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState(null);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetch('/api/products?limit=200')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    const ayurvedic = data.products.filter(p =>
                        p.category === 'Ayurvedic' && p.category !== 'Homeopathy'
                    );
                    setAllProducts(ayurvedic);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const filteredBySearch = search.trim().length > 1
        ? allProducts.filter(p =>
            p.name?.toLowerCase().includes(search.toLowerCase()) ||
            p.salt?.toLowerCase().includes(search.toLowerCase()) ||
            p.ayurvedaCategory?.toLowerCase().includes(search.toLowerCase())
        )
        : allProducts;

    // Ayurveda sub-category is stored in `uses` field as "AYU_CAT:Category Name | description"
    const getAyuCategory = (p) => {
        if (!p.uses) return null;
        const match = p.uses.match(/^AYU_CAT:([^|]+)/);
        return match ? match[1].trim() : null;
    };

    const getByCategory = (catKey) =>
        filteredBySearch.filter(p => getAyuCategory(p) === catKey);

    const visibleCategories = activeCategory
        ? CATEGORIES.filter(c => c.key === activeCategory)
        : CATEGORIES;

    return (
        <>
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />

            {/* Hero */}
            <div style={{
                background: 'linear-gradient(135deg, #052e16 0%, #14532d 50%, #166534 100%)',
                padding: '80px 20px 60px',
                marginTop: '80px',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(74,222,128,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(52,211,153,0.08) 0%, transparent 50%)', pointerEvents: 'none' }} />
                <div style={{ fontSize: '3.5rem', marginBottom: '12px' }}>🌿</div>
                <h1 style={{ color: '#d1fae5', fontSize: '2.8rem', fontWeight: 900, marginBottom: '12px', letterSpacing: '-0.02em' }}>
                    Ayurvedic Medicine Directory
                </h1>
                <p style={{ color: '#6ee7b7', fontSize: '1.1rem', maxWidth: '550px', margin: '0 auto 30px' }}>
                    Ancient wisdom for modern health. Browse by condition — 100% Natural, Clinically Validated.
                </p>
                {/* Search */}
                <div style={{ maxWidth: '420px', margin: '0 auto', position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '1rem' }}>🔍</span>
                    <input
                        type="text"
                        placeholder="Search by medicine, herb or condition..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{
                            width: '100%', padding: '14px 16px 14px 44px',
                            borderRadius: '50px', border: 'none',
                            background: 'rgba(255,255,255,0.12)', color: 'white',
                            fontSize: '0.95rem', outline: 'none',
                            backdropFilter: 'blur(10px)',
                            boxSizing: 'border-box'
                        }}
                    />
                </div>
                {/* Stats */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '40px', marginTop: '36px', flexWrap: 'wrap' }}>
                    {[['🌱', `${allProducts.length}+`, 'Products'], ['💊', '9', 'Health Categories'], ['🏆', '100%', 'Natural'], ['⭐', '4.8', 'Rating']].map(([icon, val, label]) => (
                        <div key={label} style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1.3rem' }}>{icon}</div>
                            <div style={{ color: '#fff', fontWeight: 900, fontSize: '1.4rem' }}>{val}</div>
                            <div style={{ color: '#86efac', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Category Filter Pills */}
            <div style={{ background: '#f0fdf4', borderBottom: '1px solid #d1fae5', padding: '16px 20px', overflowX: 'auto' }}>
                <div style={{ display: 'flex', gap: '10px', maxWidth: '1200px', margin: '0 auto', flexWrap: 'nowrap', justifyContent: 'flex-start' }}>
                    <button
                        onClick={() => setActiveCategory(null)}
                        style={{
                            padding: '8px 18px', borderRadius: '50px', border: '2px solid',
                            borderColor: !activeCategory ? '#16a34a' : '#d1fae5',
                            background: !activeCategory ? '#16a34a' : 'white',
                            color: !activeCategory ? 'white' : '#166534',
                            fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', whiteSpace: 'nowrap'
                        }}
                    >
                        All Categories
                    </button>
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.key}
                            onClick={() => setActiveCategory(activeCategory === cat.key ? null : cat.key)}
                            style={{
                                padding: '8px 16px', borderRadius: '50px', border: '2px solid',
                                borderColor: activeCategory === cat.key ? cat.color : '#e2e8f0',
                                background: activeCategory === cat.key ? cat.color : 'white',
                                color: activeCategory === cat.key ? 'white' : '#374151',
                                fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', whiteSpace: 'nowrap',
                                transition: 'all 0.2s'
                            }}
                        >
                            {cat.icon} {cat.key}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px 80px' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                        <div style={{ fontSize: '2.5rem', marginBottom: '16px', animation: 'spin 1s linear infinite', display: 'inline-block' }}>🌿</div>
                        <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>Loading Ayurvedic directory...</p>
                    </div>
                ) : (
                    <>
                        {visibleCategories.map(cat => {
                            const products = getByCategory(cat.key);
                            if (products.length === 0 && search.trim().length < 2) return null;
                            return (
                                <div key={cat.key} style={{ marginBottom: '56px' }}>
                                    {/* Section Header */}
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: '16px',
                                        background: cat.bg, border: `2px solid ${cat.color}20`,
                                        borderRadius: '16px', padding: '20px 24px', marginBottom: '24px'
                                    }}>
                                        <div style={{
                                            width: '52px', height: '52px', borderRadius: '14px',
                                            background: cat.color, display: 'flex', alignItems: 'center',
                                            justifyContent: 'center', fontSize: '1.6rem', flexShrink: 0
                                        }}>
                                            {cat.icon}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <h2 style={{ color: cat.color, fontSize: '1.4rem', fontWeight: 900, margin: 0 }}>
                                                {cat.key}
                                            </h2>
                                            <p style={{ color: '#6b7280', fontSize: '0.88rem', margin: '4px 0 0' }}>
                                                {cat.desc} • <strong>{products.length}</strong> products
                                            </p>
                                        </div>
                                        <div style={{
                                            background: cat.color, color: 'white',
                                            fontWeight: 900, fontSize: '1rem',
                                            borderRadius: '50%', width: '36px', height: '36px',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            flexShrink: 0
                                        }}>
                                            {products.length}
                                        </div>
                                    </div>

                                    {products.length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: '30px', background: '#f9fafb', borderRadius: '12px', color: '#9ca3af', fontSize: '0.9rem' }}>
                                            No products found for this search in {cat.key}.
                                        </div>
                                    ) : (
                                        <div style={{
                                            display: 'grid',
                                            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                                            gap: '20px'
                                        }}>
                                            {products.map(product => (
                                                <ProductCard key={product.id} product={product} onAdd={addToCart} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {allProducts.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '80px 20px', color: '#6b7280' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🌿</div>
                                <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px' }}>Ayurvedic Directory Coming Soon</h3>
                                <p>Our team is adding verified Ayurvedic products. Check back shortly!</p>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Disclaimer */}
            <div style={{ background: '#fef3c7', borderTop: '1px solid #fde68a', padding: '20px', textAlign: 'center' }}>
                <p style={{ color: '#92400e', fontSize: '0.82rem', maxWidth: '800px', margin: '0 auto' }}>
                    ⚠️ <strong>Disclaimer:</strong> Ayurvedic medicines are traditional health supplements. Results may vary. Always consult a qualified Ayurvedic practitioner or doctor before starting any new medicine, especially if you have a pre-existing condition or are on allopathic medication.
                </p>
            </div>

            <Footer />
        </>
    );
}
