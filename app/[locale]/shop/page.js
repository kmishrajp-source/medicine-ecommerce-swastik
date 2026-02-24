"use client";
import { useState, useEffect } from "react";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";

const CATEGORIES = ["All", "General", "Pain Relief", "Antibiotics", "Supplements", "Ayurvedic", "Diabetes", "Cardiology", "Dermatology"];

export default function Shop() {
    const [activeCategory, setActiveCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [rxFilter, setRxFilter] = useState("All"); // All, Rx, OTC
    const { addToCart, cartCount, toggleCart } = useCart();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, [activeCategory, searchQuery]); // Re-fetch when category/search changes (or filter locally)

    // For better UX, let's fetch ALL and filter locally to avoid API spam, 
    // or implement debounce. For now, fetch ALL once and filter locally is smoother for small catalog.
    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/products');
            const data = await res.json();
            if (data.success) {
                setProducts(data.products);
            }
        } catch (error) {
            console.error("Failed to load products");
        } finally {
            setLoading(false);
        }
    };

    // Client-side filtering
    const filteredProducts = products.filter(product => {
        const matchesCategory = activeCategory === "All" || product.category === activeCategory;
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));
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

                    {/* Missing Medicine Request Banner */}
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

                {/* Product Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px' }}>
                    {loading ? <p>Loading medicines...</p> : (
                        filteredProducts.length > 0 ? (
                            filteredProducts.map(product => (
                                <ProductCard key={product.id} product={product} onAdd={addToCart} />
                            ))
                        ) : (
                            <div style={{ textAlign: 'center', padding: '60px', gridColumn: '1/-1', color: 'var(--text-light)' }}>
                                <i className="fa-solid fa-pills" style={{ fontSize: '3rem', marginBottom: '20px', opacity: 0.5 }}></i>
                                <p>No medicines found matching your criteria.</p>
                            </div>
                        )
                    )}
                </div>
            </main >
        </>
    );
}
