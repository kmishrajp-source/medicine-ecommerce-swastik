"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import Footer from "@/components/Footer";

// ── Inline Card (no separate component needed to avoid import issues) ─────────
function StoreCard({ retailer }) {
    const handleWhatsApp = () => {
        const msg = `Hello ${retailer.shopName}! I found your store on Swastik Medicare. I'd like to buy generic medicines. Please share availability and prices.`;
        let phone = (retailer.phone || '7992122974').replace(/[^0-9]/g, '');
        if (!phone.startsWith('91')) phone = `91${phone}`;
        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
    };

    const badgeColor = {
        'PMBJP Official': { bg: '#065f46', text: '#ffffff' },
        'Swastik Partner': { bg: '#1d4ed8', text: '#ffffff' },
        'Verified Store': { bg: '#7c3aed', text: '#ffffff' },
    }[retailer.badge] || { bg: '#064e3b', text: '#ffffff' };

    const stars = Math.round(retailer.rating || 4.5);

    return (
        <div style={{
            background: 'white', borderRadius: '20px', padding: '24px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #d1fae5',
            display: 'flex', flexDirection: 'column', height: '100%',
            transition: 'all 0.2s', cursor: 'default',
            position: 'relative', overflow: 'hidden'
        }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(5,150,105,0.15)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'none'; }}
        >
            {/* Top gradient bar */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(90deg, #059669, #34d399)' }} />

            {/* Header row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', border: '1px solid #a7f3d0' }}>
                    🌿
                </div>
                <span style={{ background: badgeColor.bg, color: badgeColor.text, fontSize: '9px', fontWeight: '800', padding: '4px 10px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {retailer.badge || 'Verified'}
                </span>
            </div>

            {/* Name & City */}
            <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#1e293b', marginBottom: '4px', lineHeight: '1.3' }}>
                {retailer.shopName}
            </h3>
            <p style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                📍 {retailer.city}
            </p>

            {/* Stats grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', background: '#f8fafc', borderRadius: '12px', padding: '12px', marginBottom: '14px', border: '1px solid #e2e8f0' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '8px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>Rating</div>
                    <div style={{ fontSize: '11px', fontWeight: '800', color: '#f59e0b' }}>
                        {'⭐'.repeat(Math.min(stars, 5))} {retailer.rating || '4.5'}
                    </div>
                </div>
                <div style={{ textAlign: 'center', borderLeft: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '8px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>Reviews</div>
                    <div style={{ fontSize: '11px', fontWeight: '800', color: '#0f172a' }}>{(retailer.ratingCount || 0).toLocaleString()}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '8px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>Savings</div>
                    <div style={{ fontSize: '10px', fontWeight: '800', color: '#059669' }}>{retailer.savings || 'Up to 80%'}</div>
                </div>
            </div>

            {/* Hours */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <span style={{ fontSize: '14px' }}>🕐</span>
                <span style={{ fontSize: '12px', color: '#059669', fontWeight: '700' }}>{retailer.openingHours || '9 AM – 9 PM'}</span>
            </div>

            {/* Address */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '18px', flex: 1 }}>
                <span style={{ fontSize: '12px', marginTop: '2px', flexShrink: 0 }}>📌</span>
                <span style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.5', fontWeight: '500' }}>{retailer.address}</span>
            </div>

            {/* CTA Button */}
            <button
                onClick={handleWhatsApp}
                style={{
                    width: '100%', background: 'linear-gradient(135deg, #059669, #047857)',
                    color: 'white', padding: '13px', borderRadius: '12px', border: 'none',
                    fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.08em',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    transition: 'opacity 0.2s', boxShadow: '0 4px 14px rgba(5,150,105,0.35)'
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
                <span style={{ fontSize: '16px' }}>💬</span> Order via WhatsApp
            </button>
            <p style={{ textAlign: 'center', fontSize: '10px', color: '#94a3b8', marginTop: '8px', fontWeight: '500' }}>
                Mediated by Swastik Medicare Platform
            </p>
        </div>
    );
}

// ── Stats Bar ─────────────────────────────────────────────────────────────────
function StatsBar({ total, cities }) {
    return (
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '40px' }}>
            {[
                { icon: '🏪', label: 'Verified Stores', value: total },
                { icon: '🌆', label: 'Cities Covered', value: cities },
                { icon: '💊', label: 'Savings on Generics', value: 'Up to 80%' },
                { icon: '✅', label: 'PMBJP Certified', value: 'Yes' },
            ].map(stat => (
                <div key={stat.label} style={{ background: 'white', padding: '16px 24px', borderRadius: '16px', textAlign: 'center', minWidth: '130px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', border: '1px solid #d1fae5' }}>
                    <div style={{ fontSize: '24px', marginBottom: '6px' }}>{stat.icon}</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#065f46' }}>{stat.value}</div>
                    <div style={{ fontSize: '10px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{stat.label}</div>
                </div>
            ))}
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function GenericRetailersDirectoryPage() {
    const { cartCount, toggleCart } = useCart();
    const [retailers, setRetailers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCity, setSelectedCity] = useState("All");
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchGenericRetailers();
    }, []);

    const fetchGenericRetailers = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/generic-retailers');
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            if (data.success && data.retailers && data.retailers.length > 0) {
                setRetailers(data.retailers);
            } else {
                setError('No stores returned from server.');
            }
        } catch (err) {
            console.error("Failed to fetch generic retailers:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const allCities = ["All", ...Array.from(new Set(retailers.map(r => r.city).filter(Boolean))).sort()];

    const filteredRetailers = retailers.filter(r => {
        const matchesCity = selectedCity === "All" || (r.city || '').toLowerCase() === selectedCity.toLowerCase();
        const q = searchQuery.toLowerCase();
        const matchesSearch = !q ||
            (r.shopName || '').toLowerCase().includes(q) ||
            (r.address || '').toLowerCase().includes(q) ||
            (r.city || '').toLowerCase().includes(q);
        return matchesCity && matchesSearch;
    });

    const uniqueCities = new Set(retailers.map(r => r.city)).size;

    return (
        <div style={{ minHeight: '100vh', background: '#f0fdf4', fontFamily: 'Inter, sans-serif' }}>
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />

            {/* Hero */}
            <div style={{ background: 'linear-gradient(135deg, #065f46 0%, #047857 50%, #059669 100%)', paddingTop: '120px', paddingBottom: '80px', textAlign: 'center', color: 'white' }}>
                <div style={{ maxWidth: '700px', margin: '0 auto', padding: '0 24px' }}>
                    <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.15)', padding: '6px 20px', borderRadius: '30px', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '20px' }}>
                        🌿 Swastik Generic Medicine Network
                    </div>
                    <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: '900', marginBottom: '16px', lineHeight: '1.15' }}>
                        Generic Medicine Retailers<br />&amp; PMBJP Jan Aushadhi Kendras
                    </h1>
                    <p style={{ fontSize: '1.05rem', color: '#a7f3d0', fontWeight: '500', lineHeight: '1.6', marginBottom: '32px' }}>
                        Connect directly with verified PMBJP Kendras across India. Save up to <strong style={{ color: '#6ee7b7' }}>80% on branded medicine prices</strong> with genuine generic equivalents.
                    </p>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <div style={{ background: 'rgba(255,255,255,0.2)', padding: '10px 20px', borderRadius: '30px', fontSize: '13px', fontWeight: '700' }}>
                            🏛️ Government PMBJP Certified
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.2)', padding: '10px 20px', borderRadius: '30px', fontSize: '13px', fontWeight: '700' }}>
                            📦 {retailers.length || '25'}+ Verified Stores
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.2)', padding: '10px 20px', borderRadius: '30px', fontSize: '13px', fontWeight: '700' }}>
                            🗺️ {uniqueCities || '11'} Cities
                        </div>
                    </div>
                </div>
            </div>

            <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px 80px' }}>

                {/* Stats Bar */}
                {retailers.length > 0 && <StatsBar total={retailers.length} cities={uniqueCities} />}

                {/* Search & Filter Bar */}
                <div style={{ background: 'white', padding: '20px 24px', borderRadius: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #d1fae5', marginBottom: '32px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: '1', minWidth: '240px' }}>
                        <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', fontSize: '14px' }}>🔍</span>
                        <input
                            type="text"
                            placeholder="Search store name, area, or city..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            style={{ width: '100%', padding: '12px 14px 12px 38px', borderRadius: '12px', border: '1px solid #d1d5db', fontSize: '14px', fontWeight: '500', outline: 'none', boxSizing: 'border-box' }}
                            onFocus={e => e.target.style.borderColor = '#059669'}
                            onBlur={e => e.target.style.borderColor = '#d1d5db'}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>City:</span>
                        {allCities.map(city => (
                            <button
                                key={city}
                                onClick={() => setSelectedCity(city)}
                                style={{
                                    padding: '7px 16px', borderRadius: '30px', border: 'none', cursor: 'pointer',
                                    fontSize: '12px', fontWeight: '700',
                                    background: selectedCity === city ? '#059669' : '#f1f5f9',
                                    color: selectedCity === city ? 'white' : '#475569',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {city}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Result Count */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#1e293b', marginBottom: '4px' }}>
                            Verified Generic Stores
                        </h2>
                        <p style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>
                            Showing <strong style={{ color: '#059669' }}>{filteredRetailers.length}</strong> of {retailers.length} stores
                            {selectedCity !== 'All' ? ` in ${selectedCity}` : ' across India'}
                        </p>
                    </div>
                    <div style={{ background: 'white', padding: '12px 20px', borderRadius: '14px', border: '1px solid #d1fae5', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '20px' }}>🏪</span>
                        <div>
                            <div style={{ fontSize: '11px', fontWeight: '800', color: '#1e293b' }}>List Your Generic Store</div>
                            <a href="/distributor/register" style={{ fontSize: '10px', fontWeight: '800', color: '#059669', textDecoration: 'none' }}>Register on platform →</a>
                        </div>
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '80px 0' }}>
                        <div style={{ fontSize: '40px', marginBottom: '16px', animation: 'spin 1s linear infinite' }}>⏳</div>
                        <p style={{ color: '#64748b', fontWeight: '600', fontSize: '16px' }}>Loading generic stores...</p>
                    </div>
                ) : error ? (
                    <div style={{ textAlign: 'center', padding: '60px 0', background: 'white', borderRadius: '20px', border: '1px solid #fee2e2' }}>
                        <div style={{ fontSize: '40px', marginBottom: '12px' }}>⚠️</div>
                        <h3 style={{ color: '#dc2626', fontWeight: '800', marginBottom: '8px' }}>Could not load stores</h3>
                        <p style={{ color: '#64748b', marginBottom: '20px', fontSize: '14px' }}>{error}</p>
                        <button
                            onClick={fetchGenericRetailers}
                            style={{ background: '#059669', color: 'white', padding: '10px 28px', borderRadius: '30px', border: 'none', cursor: 'pointer', fontWeight: '700' }}
                        >
                            Try Again
                        </button>
                    </div>
                ) : filteredRetailers.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 0', background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</div>
                        <h3 style={{ fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>No Stores Found</h3>
                        <p style={{ color: '#64748b', marginBottom: '20px', fontSize: '14px' }}>No generic medicine stores matched your search. Try resetting filters.</p>
                        <button
                            onClick={() => { setSearchQuery(''); setSelectedCity('All'); }}
                            style={{ background: '#059669', color: 'white', padding: '10px 28px', borderRadius: '30px', border: 'none', cursor: 'pointer', fontWeight: '700' }}
                        >
                            Reset Filters
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                        {filteredRetailers.map(retailer => (
                            <StoreCard key={retailer.id} retailer={retailer} />
                        ))}
                    </div>
                )}

                {/* Info Banner */}
                <div style={{ marginTop: '60px', background: 'linear-gradient(135deg, #064e3b, #065f46)', color: 'white', borderRadius: '24px', padding: '40px', textAlign: 'center' }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '900', marginBottom: '12px' }}>
                        💊 What are Generic Medicines?
                    </h3>
                    <p style={{ color: '#a7f3d0', fontSize: '14px', lineHeight: '1.7', maxWidth: '600px', margin: '0 auto 24px' }}>
                        Generic medicines contain the same active ingredients as branded medicines and meet the same quality, safety, and efficacy standards. 
                        PMBJP Jan Aushadhi Kendras sell government-certified generics at <strong style={{ color: '#6ee7b7' }}>up to 80% lower prices</strong>.
                    </p>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {['Same Active Ingredients', 'Government Quality Certified', 'Save up to 80%', 'Available Nationwide'].map(feat => (
                            <div key={feat} style={{ background: 'rgba(255,255,255,0.15)', padding: '8px 16px', borderRadius: '30px', fontSize: '12px', fontWeight: '700' }}>
                                ✓ {feat}
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
