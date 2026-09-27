"use client";
import React, { useState, useEffect } from 'react';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/navigation";

const LAB_CATEGORIES = [
    { id: "all",        icon: "🔬", label: "All Labs",            color: "#3B82F6" },
    { id: "diagnostic", icon: "🩺", label: "Diagnostic Labs",     color: "#0EA5E9" },
    { id: "pathology",  icon: "🧫", label: "Pathology",           color: "#8B5CF6" },
    { id: "radiology",  icon: "🩻", label: "Radiology & Imaging", color: "#6366F1" },
    { id: "genetic",    icon: "🧬", label: "Genetic Testing",     color: "#7C3AED" },
    { id: "cardiology", icon: "❤",  label: "Cardiology Tests",    color: "#EF4444" },
];

export default function LabList() {
    const { cartCount, toggleCart } = useCart();
    const { data: session } = useSession();
    const router = useRouter();
    const [labs, setLabs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState("all");
    const [search, setSearch] = useState("");

    useEffect(() => {
        fetch('/api/labs')
            .then(res => res.json())
            .then(data => { if (data.success) setLabs(data.labs); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const handleBook = async (labId, testId) => {
        if (!session) return router.push('/login');
        if (!confirm("Confirm booking for this test?")) return;
        try {
            const res = await fetch('/api/labs/book', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ testId }) });
            const data = await res.json();
            if (data.success) { alert("Lab Test Booked Successfully!"); router.push('/profile'); }
            else { alert("Error: " + data.error); }
        } catch (err) { alert("Booking failed"); }
    };

    const filteredLabs = labs.filter(lab =>
        search === "" || lab.name?.toLowerCase().includes(search.toLowerCase()) || lab.address?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <>
            <Navbar openCart={() => toggleCart(true)} cartCount={cartCount} />
            <div style={{ marginTop: "80px", background: "#F8FAFC", minHeight: "100vh" }}>
                <div style={{ background: "linear-gradient(135deg, #0F172A, #1E3A5F, #0EA5E9)", color: "white", padding: "50px 20px 70px", textAlign: "center", position: "relative", overflow: "hidden" }}>
                    <div style={{ fontSize: "3rem", marginBottom: "12px" }}>🏥</div>
                    <h1 style={{ fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 800, margin: "0 0 14px" }}>Diagnostic Lab Directory</h1>
                    <p style={{ color: "#BAE6FD", fontSize: "1rem", maxWidth: "520px", margin: "0 auto 28px", lineHeight: 1.6 }}>
                        Find and book diagnostic tests at verified labs — from routine bloodwork to advanced genetic testing.
                    </p>
                    <div style={{ display: "flex", maxWidth: "520px", margin: "0 auto", borderRadius: "10px", overflow: "hidden", boxShadow: "0 6px 24px rgba(0,0,0,0.25)" }}>
                        <input id="lab-search-input" type="text" placeholder="Search labs by name or location" value={search} onChange={e => setSearch(e.target.value)}
                            style={{ flex: 1, padding: "14px 18px", border: "none", fontSize: "0.95rem", outline: "none", color: "#0F172A" }} />
                        <button style={{ background: "#0EA5E9", color: "white", border: "none", padding: "0 24px", fontWeight: 700, cursor: "pointer", fontSize: "0.95rem" }}>Search</button>
                    </div>
                </div>

                <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 20px 60px" }}>
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "28px" }}>
                        {LAB_CATEGORIES.map(cat => (
                            <button key={cat.id} id={"lab-category-" + cat.id} onClick={() => setActiveCategory(cat.id)}
                                style={{ padding: "8px 18px", borderRadius: "20px", border: "none", cursor: "pointer", fontWeight: 600, fontSize: "0.88rem",
                                    background: activeCategory === cat.id ? cat.color : "#E5E7EB", color: activeCategory === cat.id ? "white" : "#374151" }}>
                                {cat.icon} {cat.label}
                            </button>
                        ))}
                    </div>

                    {activeCategory === "genetic" && (
                        <div style={{ background: "linear-gradient(135deg, #EDE9FE, #DDD6FE)", border: "1px solid #C4B5FD", borderRadius: "16px", padding: "32px", marginBottom: "32px",
                            display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" }}>
                            <div>
                                <div style={{ fontSize: "2.5rem", marginBottom: "10px" }}>🧬</div>
                                <h2 style={{ margin: "0 0 8px", color: "#4C1D95", fontSize: "1.4rem" }}>Genetic and Molecular Testing</h2>
                                <p style={{ margin: "0 0 14px", color: "#6D28D9", fontSize: "0.95rem", maxWidth: "480px", lineHeight: 1.6 }}>
                                    Browse our dedicated genetic test directory with 17+ tests across hereditary cancer, pharmacogenomics, NGS, prenatal screening, and more.
                                </p>
                                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                    {["BRCA Panel", "NIPT", "Whole Exome", "Pharmacogenomics", "MODY Genes"].map(tag => (
                                        <span key={tag} style={{ background: "#7C3AED", color: "white", padding: "3px 12px", borderRadius: "12px", fontSize: "0.78rem", fontWeight: 600 }}>{tag}</span>
                                    ))}
                                </div>
                            </div>
                            <Link href="/bio/genetic-tests" style={{ background: "#7C3AED", color: "white", padding: "14px 28px", borderRadius: "10px", textDecoration: "none",
                                fontWeight: 700, fontSize: "1rem", display: "inline-block", whiteSpace: "nowrap", boxShadow: "0 4px 14px rgba(124,58,237,0.4)" }}>
                                Browse Genetic Tests
                            </Link>
                        </div>
                    )}

                    {loading ? (
                        <div style={{ textAlign: "center", padding: "60px", color: "#6B7280" }}>
                            <p>Loading labs...</p>
                        </div>
                    ) : filteredLabs.length > 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                            {filteredLabs.map(lab => (
                                <div key={lab.id} style={{ border: "1px solid #E5E7EB", padding: "28px", borderRadius: "16px", boxShadow: "0 4px 10px rgba(0,0,0,0.05)", background: "white" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
                                        <div>
                                            <h2 style={{ margin: 0 }}>{lab.name}</h2>
                                            <p style={{ color: "#6B7280", margin: "4px 0 0", fontSize: "0.9rem" }}>📍 {lab.address}</p>
                                        </div>
                                        <span style={{ background: "#DBEAFE", color: "#1D4ED8", padding: "5px 14px", borderRadius: "20px", fontSize: "0.8rem", fontWeight: 700 }}>Verified Lab</span>
                                    </div>
                                    <h4 style={{ margin: "0 0 12px" }}>Available Tests:</h4>
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "14px" }}>
                                        {lab.tests.map(test => (
                                            <div key={test.id} style={{ border: "1px solid #E5E7EB", padding: "16px", borderRadius: "12px", background: "#FAFAFA" }}>
                                                <div style={{ fontWeight: 700, marginBottom: "4px" }}>{test.name}</div>
                                                <div style={{ fontSize: "0.85rem", color: "#6B7280", marginBottom: "12px" }}>{test.description}</div>
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                    <div style={{ fontWeight: 800, color: "#10B981", fontSize: "1.1rem" }}>Rs {test.price}</div>
                                                    <button onClick={() => handleBook(lab.id, test.id)}
                                                        style={{ background: "#3B82F6", color: "white", border: "none", padding: "6px 14px", borderRadius: "8px", cursor: "pointer", fontWeight: 700, fontSize: "0.82rem" }}>
                                                        Book Now
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        {lab.tests.length === 0 && <p style={{ color: "#9CA3AF", fontStyle: "italic" }}>No tests listed yet.</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: "center", padding: "60px 20px", background: "white", borderRadius: "16px", border: "1px dashed #D1D5DB" }}>
                            <div style={{ fontSize: "3.5rem", marginBottom: "16px" }}>🔬</div>
                            <h3 style={{ color: "#374151", fontSize: "1.3rem", margin: "0 0 10px" }}>No diagnostic labs found in Gorakhpur yet.</h3>
                            <p style={{ color: "#6B7280", maxWidth: "420px", margin: "0 auto 28px", lineHeight: 1.6 }}>
                                While we grow our lab network, browse our dedicated Genetic Test directory with 17+ verified tests.
                            </p>
                            <div style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap" }}>
                                <Link href="/bio/genetic-tests" style={{ background: "#7C3AED", color: "white", padding: "12px 24px", borderRadius: "10px", textDecoration: "none", fontWeight: 700, fontSize: "0.95rem" }}>
                                    Browse Genetic Tests
                                </Link>
                                <Link href="/partner" style={{ background: "#F3F4F6", color: "#374151", padding: "12px 24px", borderRadius: "10px", textDecoration: "none", fontWeight: 700, fontSize: "0.95rem" }}>
                                    Are you a Lab? Register Here
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
}