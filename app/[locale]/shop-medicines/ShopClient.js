"use client";
import React, { useState, useEffect } from "react";
import Navbar from "../../../components/Navbar";
import ProductCard from "../../../components/ProductCard";
import { useCart } from "../../../context/CartContext";

const CATEGORIES = [
    "All", "General", "Pain Relief", "Antibiotics", "Supplements",
    "Vitamins", "Diabetes", "Cardiology", "Dermatology", "Respiratory",
    "Gastrointestinal", "Neuro", "Antiallergic", "Antifungal", "Hormonal", "Ayurvedic"
];

export default function ShopClient({ initialProducts = [] }) {
    const [activeCategory, setActiveCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [rxFilter, setRxFilter] = useState("All"); // All, Rx, OTC
    const { addToCart, cartCount, toggleCart } = useCart();
    
    // Default to the SSR properties for instantaneous payload
    const [products, setProducts] = useState(initialProducts);
    const [allLoaded, setAllLoaded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 60;

    // Fetch products whenever category, search, or page changes
    useEffect(() => {
        const fetchFiltered = async () => {
            setLoading(true);
            try {
                let url = `/api/products?limit=${PAGE_SIZE}&offset=${(page - 1) * PAGE_SIZE}&`;
                if (activeCategory !== 'All') url += `category=${encodeURIComponent(activeCategory)}&`;
                if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}`;

                const res = await fetch(url);
                const data = await res.json();
                if (data.success) {
                    if (page === 1) {
                        setProducts(data.products);
                    } else {
                        setProducts(prev => [...prev, ...data.products]);
                    }
                    setAllLoaded(data.products.length < PAGE_SIZE);
                }
            } catch (error) {
                console.error("Failed to load products");
            } finally {
                setLoading(false);
            }
        };

        fetchFiltered();
    }, [activeCategory, searchQuery, page]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setPage(1);
        setAllLoaded(false);
    }, [activeCategory, searchQuery]);

    const filteredProducts = products.filter(product => {
        const matchesRx = rxFilter === "All"
            ? true
            : rxFilter === "Rx" ? product.requiresPrescription
                : !product.requiresPrescription;
        return matchesRx;
    });

    return (
        <>
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />

            <main className="container" style={{ marginTop: '100px', paddingBottom: '60px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 800, background: 'linear-gradient(to right, var(--primary), var(--success))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
                        Browse Medicines
                    </h2>
                    <div style={{ color: 'var(--text-light)' }}>{filteredProducts.length} Results</div>
                </div>

                <div className="glass" style={{ padding: '24px', borderRadius: '24px', marginBottom: '40px' }}>
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
                            <i className="fa-solid fa-search" style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }}></i>
                            <input
                                type="text"
                                placeholder="Search by name or category..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    width: '100%', padding: '16px 20px 16px 50px', borderRadius: '50px',
                                    border: '1px solid var(--glass-border)', outline: 'none', background: 'white',
                                    fontSize: '1rem', boxShadow: 'var(--shadow-sm)'
                                }}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={() => setRxFilter('All')} className={`btn ${rxFilter === 'All' ? 'btn-primary' : ''}`} style={{ borderRadius: '20px', padding: '10px 20px', background: rxFilter === 'All' ? undefined : 'white' }}>All</button>
                            <button onClick={() => setRxFilter('Rx')} className={`btn ${rxFilter === 'Rx' ? 'btn-primary' : ''}`} style={{ borderRadius: '20px', padding: '10px 20px', background: rxFilter === 'Rx' ? undefined : 'white' }}>Prescription Only</button>
                            <button onClick={() => setRxFilter('OTC')} className={`btn ${rxFilter === 'OTC' ? 'btn-primary' : ''}`} style={{ borderRadius: '20px', padding: '10px 20px', background: rxFilter === 'OTC' ? undefined : 'white' }}>OTC</button>
                        </div>
                    </div>

                    <div style={{ background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)', borderRadius: '16px', padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'white', marginBottom: '40px', boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.3)' }}>
                        <div>
                            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.4rem' }}><i className="fa-solid fa-notes-medical"></i> Can't find what you need?</h3>
                            <p style={{ margin: 0, opacity: 0.9 }}>Value us! We can arrange any medicine within hours.</p>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <a href="/request-medicine" className="btn" style={{ background: 'white', color: '#6366F1', border: 'none', padding: '12px 24px', fontWeight: 'bold', borderRadius: '50px', textDecoration: 'none' }}>
                                Request Medicine
                            </a>
                            <a href="/upload-prescription" className="btn" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid white', padding: '12px 24px', fontWeight: 'bold', borderRadius: '50px', textDecoration: 'none' }}>
                                Upload Prescription
                            </a>
                        </div>
                    </div>
                </div>

                <div className="category-scroll" style={{ display: 'flex', gap: '12px', overflowX: 'auto', padding: '20px 0 5px 0' }}>
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            style={{
                                padding: '10px 24px',
                                borderRadius: '50px',
                                background: activeCategory === cat ? 'var(--accent)' : 'rgba(255,255,255,0.8)',
                                color: activeCategory === cat ? 'white' : 'var(--text-dark)',
                                border: '1px solid var(--glass-border)',
                                whiteSpace: 'nowrap',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                fontWeight: 600
                            }}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px' }}>
                    {loading && products.length === 0 ? <p style={{gridColumn:'1/-1',textAlign:'center',padding:'60px',fontSize:'1.2rem'}}>Loading medicines... 💊</p> : (
                        filteredProducts.length > 0 ? (
                            filteredProducts.map(product => (
                                <ProductCard key={product.id} product={product} onAdd={addToCart} />
                            ))
                        ) : (
                            <div style={{ 
                                textAlign: 'center', 
                                padding: '80px 20px', 
                                gridColumn: '1/-1', 
                                background: 'rgba(255,255,255,0.5)',
                                borderRadius: '32px',
                                border: '2px dashed var(--glass-border)'
                            }}>
                                <div style={{ fontSize: '4rem', marginBottom: '24px' }}>💊</div>
                                <h3 style={{ fontSize: '1.5rem', marginBottom: '12px', color: 'var(--text-dark)' }}>No Medicines Found</h3>
                                <p style={{ color: 'var(--text-light)', maxWidth: '400px', margin: '0 auto 32px' }}>
                                    The medicine directory is currently empty or your filters returned no results.
                                </p>
                                
                                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                                    <button 
                                        onClick={() => { setSearchQuery(""); setActiveCategory("All"); }}
                                        className="btn btn-primary" 
                                        style={{ borderRadius: '50px', padding: '12px 30px' }}
                                    >
                                        Clear All Filters
                                    </button>
                                    
                                    {/* Admin Restoration Trigger */}
                                    <button 
                                        onClick={async () => {
                                            const secret = prompt("Enter Restoration Secret:");
                                            if (secret) {
                                                setLoading(true);
                                                try {
                                                    const res = await fetch(`/api/restore-data?secret=${secret}&step=medicines`);
                                                    const data = await res.json();
                                                    if (data.success) {
                                                        alert("🎉 Success! Medicines are being restored. Refresh in 1 minute.");
                                                        window.location.reload();
                                                    } else {
                                                        alert("Error: " + data.error);
                                                    }
                                                } catch (e) {
                                                    alert("Restoration failed. Please check network.");
                                                } finally {
                                                    setLoading(false);
                                                }
                                            }
                                        }}
                                        style={{ 
                                            background: 'transparent', 
                                            color: 'var(--text-light)', 
                                            border: '1px solid var(--glass-border)',
                                            borderRadius: '50px',
                                            padding: '12px 30px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Admin Restore
                                    </button>
                                </div>
                            </div>
                        )
                    )}
                </div>
                {!loading && !allLoaded && filteredProducts.length > 0 && (
                    <div style={{ textAlign: 'center', marginTop: '40px', gridColumn: '1/-1' }}>
                        <button
                            onClick={() => setPage(p => p + 1)}
                            className="btn btn-primary"
                            style={{ borderRadius: '50px', padding: '14px 48px', fontSize: '1rem', fontWeight: 700 }}
                        >
                            Load More Medicines
                        </button>
                    </div>
                )}
                {loading && products.length > 0 && (
                    <div style={{ textAlign: 'center', padding: '20px', gridColumn: '1/-1' }}>Loading more...</div>
                )}
            </main >
        </>
    );
}
