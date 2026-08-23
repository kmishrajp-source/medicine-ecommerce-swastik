"use client";
import React, { useState, useEffect } from "react";
import Navbar from "../../../components/Navbar";
import ProductCard from "../../../components/ProductCard";
import { useCart } from "../../../context/CartContext";

const CATEGORIES = [
    "All", "Pain Relief", "Antibiotics", "Supplements",
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
    const [totalCount, setTotalCount] = useState(0);
    const PAGE_SIZE = 60;

    // --- Tour State ---
    const [tourStep, setTourStep] = useState(0);
    const [targetRect, setTargetRect] = useState(null);

    // We need isCartOpen to know when to recalculate step 3
    const [isCartOpen, setIsCartOpen] = useState(false);
    
    // Wrapper for toggleCart to track state locally for the tour
    const handleToggleCart = (state) => {
        setIsCartOpen(state !== undefined ? state : !isCartOpen);
        toggleCart(state);
    };

    // Update target rect based on tour step
    useEffect(() => {
        if (tourStep === 0) return;

        const updateRect = () => {
            let target = null;
            if (tourStep === 1) {
                // Find first Add to Cart button
                const buttons = document.querySelectorAll('.product-card button[title="Add to Cart"]');
                if (buttons && buttons.length > 0) target = buttons[0];
            } else if (tourStep === 2) {
                target = document.getElementById('tour-cart-btn');
            } else if (tourStep === 3) {
                target = document.getElementById('tour-checkout-btn');
            }

            if (target) {
                const rect = target.getBoundingClientRect();
                setTargetRect({
                    top: rect.top,
                    left: rect.left,
                    width: rect.width,
                    height: rect.height
                });
            } else {
                setTargetRect(null);
            }
        };

        // Initial update and add listeners
        setTimeout(updateRect, 300); // Wait a bit for layout to settle, especially if cart sidebar is opening
        window.addEventListener('resize', updateRect);
        window.addEventListener('scroll', updateRect);
        
        // Polling as a fallback for dynamic layout changes (like sidebar animating in)
        const interval = setInterval(updateRect, 500);

        return () => {
            window.removeEventListener('resize', updateRect);
            window.removeEventListener('scroll', updateRect);
            clearInterval(interval);
        };
    }, [tourStep, isCartOpen]); // Listen to isCartOpen to recalculate when cart opens (if needed)

    // Intercept clicks to advance tour
    useEffect(() => {
        if (tourStep === 0) return;

        const handleClick = (e) => {
            if (tourStep === 1) {
                const addBtns = document.querySelectorAll('.product-card button[title="Add to Cart"]');
                if (addBtns.length > 0 && addBtns[0].contains(e.target)) {
                    // They clicked add to cart, move to step 2
                    setTimeout(() => setTourStep(2), 500);
                }
            } else if (tourStep === 2) {
                const cartBtn = document.getElementById('tour-cart-btn');
                if (cartBtn && cartBtn.contains(e.target)) {
                    // They opened cart, move to step 3
                    setTimeout(() => setTourStep(3), 500);
                }
            } else if (tourStep === 3) {
                const checkoutBtn = document.getElementById('tour-checkout-btn');
                if (checkoutBtn && checkoutBtn.contains(e.target)) {
                    // Tour finished
                    setTourStep(0);
                }
            }
        };

        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, [tourStep]);




    // Fetch products whenever category, search, or page changes
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
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
                        setTotalCount(data.totalCount || data.products.length);
                        // allLoaded = we've fetched all available results
                        setAllLoaded((page * PAGE_SIZE) >= (data.totalCount || data.products.length));
                    }
                } catch (error) {
                    console.error("Failed to load products");
                } finally {
                    setLoading(false);
                }
            };

            fetchFiltered();
        }, 300); // 300ms debounce

        return () => clearTimeout(delayDebounceFn);
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
            <Navbar cartCount={cartCount} openCart={() => handleToggleCart(true)} />

            {/* TOUR OVERLAY */}
            {tourStep > 0 && targetRect && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 9999, pointerEvents: 'none' }}>
                    {/* Dim backdrop with cutout */}
                    <div style={{ 
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
                        background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(3px)',
                        maskImage: `radial-gradient(ellipse at ${targetRect.left + targetRect.width/2}px ${targetRect.top + targetRect.height/2}px, transparent ${Math.max(targetRect.width, targetRect.height)*0.8}px, black ${Math.max(targetRect.width, targetRect.height)}px)`,
                        WebkitMaskImage: `radial-gradient(ellipse at ${targetRect.left + targetRect.width/2}px ${targetRect.top + targetRect.height/2}px, transparent ${Math.max(targetRect.width, targetRect.height)*0.8}px, black ${Math.max(targetRect.width, targetRect.height)}px)`,
                        transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}></div>

                    {/* Highlighter Ring */}
                    <div style={{
                        position: 'absolute',
                        top: targetRect.top - 8,
                        left: targetRect.left - 8,
                        width: targetRect.width + 16,
                        height: targetRect.height + 16,
                        borderRadius: '12px',
                        border: '3px solid #6366f1',
                        boxShadow: '0 0 20px rgba(99, 102, 241, 0.5), inset 0 0 10px rgba(99, 102, 241, 0.5)',
                        transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                        animation: 'pulseRing 2s infinite'
                    }}></div>

                    {/* Tooltip Dialog */}
                    <div style={{
                        position: 'absolute',
                        top: tourStep === 3 ? targetRect.top - 120 : targetRect.top + targetRect.height + 20, // display above for checkout btn, below for others
                        left: Math.max(20, Math.min(window.innerWidth - 320, targetRect.left + (targetRect.width / 2) - 150)),
                        width: '300px',
                        background: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.5)',
                        padding: '24px',
                        borderRadius: '20px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                        transform: 'translateY(0)',
                        pointerEvents: 'auto',
                        display: 'flex', flexDirection: 'column', gap: '10px'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ background: '#e0e7ff', color: '#4f46e5', padding: '4px 10px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 800 }}>
                                Step {tourStep} of 3
                            </span>
                            <button onClick={() => setTourStep(0)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1rem' }}><i className="fa-solid fa-times"></i></button>
                        </div>
                        <h3 style={{ margin: '5px 0 0 0', fontSize: '1.2rem', color: '#1e293b', fontWeight: 800 }}>
                            {tourStep === 1 && "Add to Cart"}
                            {tourStep === 2 && "Open Your Cart"}
                            {tourStep === 3 && "Secure Checkout"}
                        </h3>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b', lineHeight: 1.5 }}>
                            {tourStep === 1 && "Click the plus button on any medicine to add it to your order."}
                            {tourStep === 2 && "Click the cart icon in the top right to review your selected medicines."}
                            {tourStep === 3 && "Click 'Proceed to Secure Checkout' to finalize your order details and delivery address."}
                        </p>
                    </div>

                    <style>{`
                        @keyframes pulseRing {
                            0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.7); }
                            70% { transform: scale(1); box-shadow: 0 0 0 15px rgba(99, 102, 241, 0); }
                            100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
                        }
                    `}</style>
                </div>
            )}

            <main className="container" style={{ marginTop: '100px', paddingBottom: '60px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap: 'wrap', gap: '15px' }}>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 800, background: 'linear-gradient(to right, var(--primary), var(--success))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
                        Browse Medicines
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <button 
                            onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); setTourStep(1); }}
                            className="btn" 
                            style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#4f46e5', border: '1px solid rgba(99,102,241,0.2)', padding: '10px 20px', borderRadius: '50px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <i className="fa-solid fa-circle-play"></i> How to Order?
                        </button>
                        <div style={{ color: 'var(--text-light)', fontWeight: 600 }}>
                            {filteredProducts.length} of {totalCount} Results
                        </div>
                    </div>
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
