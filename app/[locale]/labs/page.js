"use client";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";

// Utility function to calculate distance in km using Haversine formula
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; 
}

export default function LabDirectory() {
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userLocation, setUserLocation] = useState(null);
    const [sortBy, setSortBy] = useState("default"); // default, price_asc, distance_asc
    const { addToCart, cartCount, toggleCart } = useCart();
    const router = useRouter();

    useEffect(() => {
        // Run seed check
        fetch('/api/seed-labs', { method: 'GET' }).catch(() => {});

        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const loc = { lat: position.coords.latitude, lng: position.coords.longitude };
                    setUserLocation(loc);
                    fetchLabData(loc);
                },
                (error) => {
                    console.error("Location error:", error);
                    fetchLabData(null);
                }
            );
        } else {
            fetchLabData(null);
        }
    }, []);

    const fetchLabData = async (loc) => {
        setLoading(true);
        try {
            const res = await fetch('/api/labs/tests');
            const data = await res.json();
            if (data.success) {
                let fetchedTests = data.tests;
                
                // Calculate distance if lab has lat/lng
                if (loc) {
                    fetchedTests = fetchedTests.map(t => {
                        const distance = getDistanceFromLatLonInKm(loc.lat, loc.lng, t.lab?.lat, t.lab?.lng);
                        return { ...t, distance };
                    });
                }
                setTests(fetchedTests);
            }
        } catch (error) {
            console.error("Error fetching labs:", error);
        } finally {
            setLoading(false);
        }
    };

    // Sort logic
    const sortedTests = [...tests].sort((a, b) => {
        if (sortBy === 'price_asc') return a.price - b.price;
        if (sortBy === 'distance_asc') {
            const distA = a.distance ?? Infinity;
            const distB = b.distance ?? Infinity;
            return distA - distB;
        }
        return 0; // default
    });

    return (
        <div style={{ background: '#f8fafc', minHeight: '100vh' }}>
            <Navbar cartCount={cartCount} openCart={() => toggleCart(true)} />
            
            {/* Inject JSON-LD Schema for Local Lab Directory */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "MedicalClinic",
                        "name": "Swastik Diagnostics",
                        "description": "Book reliable Lab Tests with Home Sample Collection. Fast Turnaround times.",
                        "url": "https://swastikmedicare.com/labs",
                        "telephone": "+91-0000000000",
                        "image": "https://swastikmedicare.com/images/lab-banner.png",
                        "address": {
                            "@type": "PostalAddress",
                            "addressLocality": "India",
                            "addressCountry": "IN"
                        },
                        "medicalSpecialty": [
                            "Pathology",
                            "DiagnosticLab"
                        ]
                    })
                }}
            />

            <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', padding: '60px 0', color: 'white', textAlign: 'center', marginTop: '60px' }}>
                <div className="container">
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '15px' }}>
                        <i className="fa-solid fa-flask" style={{ color: '#38bdf8' }}></i> Swastik Diagnostics
                    </h1>
                    <p style={{ fontSize: '1.2rem', opacity: 0.9, maxWidth: '600px', margin: '0 auto' }}>
                        Book reliable Lab Tests with Home Sample Collection. Fast Turnaround times.
                    </p>
                </div>
            </div>

            <div className="container" style={{ marginTop: "40px", paddingBottom: "60px" }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: "2px solid #e2e8f0", paddingBottom: "15px", marginBottom: "30px" }}>
                    <h2 style={{ fontSize: "1.8rem", color: "#0f172a", margin: 0 }}>Select Lab Tests</h2>
                    <select 
                        value={sortBy} 
                        onChange={(e) => setSortBy(e.target.value)}
                        style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: 'white' }}
                    >
                        <option value="default">Default Sorting</option>
                        <option value="price_asc">Price: Low to High</option>
                        {userLocation && <option value="distance_asc">Distance: Nearest First</option>}
                    </select>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '50px', color: '#64748b' }}>
                        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2.5rem', marginBottom: '15px', color: '#3b82f6' }}></i>
                        <p>Loading available diagnostic tests...</p>
                    </div>
                ) : tests.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#64748b', fontSize: '1.1rem' }}>No lab tests found. Processing catalog update...</p>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px' }}>
                        {sortedTests.map(test => (
                            <div key={test.id} style={{ 
                                background: 'white', 
                                borderRadius: '16px', 
                                padding: '25px', 
                                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                                display: 'flex',
                                flexDirection: 'column',
                                transition: 'transform 0.2s',
                                cursor: 'pointer',
                                position: 'relative'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                                    <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.2rem', paddingRight: '15px', maxWidth: '75%' }}>
                                        {test.name}
                                    </h3>
                                    <span style={{ fontSize: '1.3rem', fontWeight: '900', color: '#2563eb' }}>
                                        ₹{test.price}
                                    </span>
                                </div>
                                
                                <p style={{ color: '#64748b', fontSize: '0.95rem', flex: 1, lineHeight: '1.5', margin: '0 0 20px 0' }}>
                                    {test.description}
                                </p>
                                
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', background: '#f8fafc', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
                                    <div style={{ color: '#475569', fontSize: '0.85rem', flexBasis: '45%' }}>
                                        <i className="fa-solid fa-clock" style={{ color: '#d97706', marginRight: '5px' }}></i>
                                        TAT: <strong>{test.turnaroundTime}</strong>
                                    </div>
                                    {test.distance !== null && test.distance !== undefined && (
                                        <div style={{ color: '#475569', fontSize: '0.85rem', flexBasis: '45%' }}>
                                            <i className="fa-solid fa-location-dot" style={{ color: '#ef4444', marginRight: '5px' }}></i>
                                            {test.distance.toFixed(1)} km away
                                        </div>
                                    )}
                                    <div style={{ color: '#475569', fontSize: '0.85rem', width: '100%', marginTop: '5px' }}>
                                        <i className="fa-solid fa-hospital" style={{ color: '#10b981', marginRight: '5px' }}></i>
                                        {test.lab?.name || "Partner Lab"}
                                    </div>
                                </div>

                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        addToCart({
                                            id: `lab-${test.id}`,
                                            name: test.name,
                                            price: test.price,
                                            image: "https://via.placeholder.com/150?text=Lab+Test",
                                            isLab: true,
                                            labId: test.labId
                                        });
                                    }}
                                    style={{ 
                                        background: '#2563eb', 
                                        color: 'white', 
                                        border: 'none', 
                                        padding: '14px', 
                                        borderRadius: '8px', 
                                        fontSize: '1rem', 
                                        fontWeight: 'bold', 
                                        cursor: 'pointer',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        gap: '10px'
                                    }}
                                >
                                    <i className="fa-solid fa-cart-plus"></i> Add Test
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
