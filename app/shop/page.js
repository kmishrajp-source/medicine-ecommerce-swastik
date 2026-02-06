"use client";
import { useState } from "react";
import { MEDICINES, CATEGORIES } from "../../data/medicines";
import ProductCard from "../../components/ProductCard";
import Navbar from "../../components/Navbar";
import { useCart } from "../../context/CartContext";

export default function Shop() {
    const [activeCategory, setActiveCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [rxFilter, setRxFilter] = useState("All"); // All, Rx, OTC
    const { addToCart, cartCount, toggleCart } = useCart();

    const filteredProducts = MEDICINES.filter(product => {
        const matchesCategory = activeCategory === "All" || product.category === activeCategory;
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.category.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRx = rxFilter === "All"
            ? true
            : rxFilter === "Rx" ? product.requiresPrescription
                : !product.requiresPrescription;

        return matchesCategory && matchesSearch && matchesRx;
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

                {/* Search & Filters */}
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
                </div>

                {/* Product Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px' }}>
                    {filteredProducts.length > 0 ? (
                        filteredProducts.map(product => (
                            <ProductCard key={product.id} product={product} onAdd={addToCart} />
                        ))
                    ) : (
                        <div style={{ textAlign: 'center', padding: '60px', gridColumn: '1/-1', color: 'var(--text-light)' }}>
                            <i className="fa-solid fa-pills" style={{ fontSize: '3rem', marginBottom: '20px', opacity: 0.5 }}></i>
                            <p>No medicines found matching your criteria.</p>
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}
