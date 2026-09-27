"use client";
import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/navigation";

const GENETIC_CATEGORIES = [
    {
        id: "hereditary",
        icon: "🧬",
        title: "Hereditary Cancer Panels",
        color: "#7C3AED",
        bg: "#EDE9FE",
        tests: [
            { id: "brca", name: "BRCA1 / BRCA2 Gene Test", price: 8500, turnaround: "7–10 days", description: "Detects mutations linked to breast and ovarian cancer risk." },
            { id: "lynch", name: "Lynch Syndrome Panel", price: 9200, turnaround: "10–14 days", description: "Tests MLH1, MSH2, MSH6, PMS2 genes for colorectal cancer risk." },
            { id: "hereditary_pan", name: "Hereditary Cancer Full Panel", price: 18500, turnaround: "14–21 days", description: "Comprehensive 30-gene panel for multiple hereditary cancer syndromes." },
        ],
    },
    {
        id: "pharmacogenomics",
        icon: "💊",
        title: "Pharmacogenomics",
        color: "#059669",
        bg: "#D1FAE5",
        tests: [
            { id: "pgx_cardio", name: "Cardiology PGx Panel", price: 5500, turnaround: "5–7 days", description: "Clopidogrel, warfarin, statins metabolism — personalise your heart medication." },
            { id: "pgx_psych", name: "Psychiatry PGx Panel", price: 6500, turnaround: "5–7 days", description: "Antidepressant & antipsychotic metabolism genes (CYP2D6, CYP2C19)." },
            { id: "pgx_full", name: "Comprehensive PGx Report", price: 11000, turnaround: "7–10 days", description: "Full drug-gene interaction report across 50+ medications." },
        ],
    },
    {
        id: "ngs",
        icon: "🔬",
        title: "Next-Generation Sequencing",
        color: "#1D4ED8",
        bg: "#DBEAFE",
        tests: [
            { id: "wes", name: "Whole Exome Sequencing (WES)", price: 35000, turnaround: "21–28 days", description: "Sequences all 20,000+ protein-coding genes for rare disease diagnosis." },
            { id: "wgs", name: "Whole Genome Sequencing (WGS)", price: 75000, turnaround: "30–45 days", description: "Complete 3-billion-base genome for comprehensive variant discovery." },
            { id: "rna_seq", name: "RNA Sequencing & Transcriptomics", price: 28000, turnaround: "14–21 days", description: "Gene expression profiling for cancer and research applications." },
        ],
    },
    {
        id: "prenatal",
        icon: "👶",
        title: "Prenatal & Carrier Testing",
        color: "#D97706",
        bg: "#FEF3C7",
        tests: [
            { id: "nipt", name: "NIPT (Non-Invasive Prenatal Test)", price: 12000, turnaround: "7–10 days", description: "Screens for Down syndrome, trisomy 18/13 via maternal blood cfDNA." },
            { id: "carrier", name: "Carrier Screening Panel (100 genes)", price: 9500, turnaround: "10–14 days", description: "Identifies if you carry recessive disease mutations before pregnancy." },
            { id: "pgd", name: "Preimplantation Genetic Testing (PGT)", price: 22000, turnaround: "14 days", description: "Screens IVF embryos for chromosomal abnormalities and single-gene disorders." },
        ],
    },
    {
        id: "diabetes",
        icon: "🩸",
        title: "Metabolic & Diabetes Risk",
        color: "#DC2626",
        bg: "#FEE2E2",
        tests: [
            { id: "diab_panel", name: "Diabetes Genetic Risk Panel", price: 4200, turnaround: "3–5 days", description: "TCF7L2, PPARG, FTO and 12 other diabetes-associated SNPs." },
            { id: "mody", name: "MODY Gene Panel", price: 7800, turnaround: "7–10 days", description: "Tests 14 MODY genes for monogenic diabetes — critical for correct treatment." },
            { id: "obesity", name: "Obesity & Metabolism Gene Panel", price: 3800, turnaround: "3–5 days", description: "FTO, MC4R, LEPR variants impacting weight management." },
        ],
    },
    {
        id: "ancestry",
        icon: "🌍",
        title: "Ancestry & Wellness",
        color: "#6D28D9",
        bg: "#F5F3FF",
        tests: [
            { id: "ancestry_dna", name: "Ancestry DNA Test", price: 3500, turnaround: "3–4 weeks", description: "Trace your ethnic origins across 2,000+ geographic regions." },
            { id: "wellness", name: "Health & Wellness Genomic Report", price: 5500, turnaround: "2–3 weeks", description: "Nutrition, fitness, sleep, and stress response gene insights." },
        ],
    },
];

const PARTNER_LABS = [
    { name: "Dr. Lal PathLabs — Genetic Division", city: "Gorakhpur", accredited: true, homeCollection: true, phone: "1800-102-5258" },
    { name: "SRL Diagnostics — Genomics Lab", city: "Gorakhpur", accredited: true, homeCollection: false, phone: "1800-102-0101" },
    { name: "Medgenome Clinical Genomics", city: "Gorakhpur", accredited: true, homeCollection: true, phone: "1800-103-3883" },
];

function TestCard({ test, booked, onBook }) {
    const [hovered, setHovered] = useState(false);
    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                border: `1px solid ${hovered ? test.color : "#E5E7EB"}`,
                borderRadius: "14px", padding: "22px", background: "white",
                boxShadow: hovered ? "0 8px 24px rgba(0,0,0,0.1)" : "0 2px 8px rgba(0,0,0,0.04)",
                transition: "all 0.25s", transform: hovered ? "translateY(-3px)" : "none",
                display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "16px"
            }}
        >
            <div>
                <div style={{ background: test.bg, display: "inline-block", padding: "4px 12px", borderRadius: "20px", fontSize: "0.78rem", fontWeight: 700, color: test.color, marginBottom: "10px" }}>
                    {test.categoryTitle || "Genetic Test"}
                </div>
                <h3 style={{ margin: "0 0 8px", fontSize: "1rem", color: "#111827", lineHeight: 1.3 }}>{test.name}</h3>
                <p style={{ margin: "0 0 12px", color: "#6B7280", fontSize: "0.88rem", lineHeight: 1.5 }}>{test.description}</p>
                <div style={{ display: "flex", gap: "12px", fontSize: "0.8rem", color: "#9CA3AF" }}>
                    <span>⏱ {test.turnaround}</span>
                    <span>🏠 Home Collection</span>
                </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <div style={{ fontSize: "1.35rem", fontWeight: 800, color: test.color }}>₹{test.price.toLocaleString("en-IN")}</div>
                    <div style={{ fontSize: "0.72rem", color: "#9CA3AF" }}>inclusive of GST</div>
                </div>
                <button
                    id={`book-test-${test.id}`}
                    onClick={onBook}
                    disabled={booked}
                    style={{
                        background: booked ? "#D1FAE5" : test.color,
                        color: booked ? "#059669" : "white",
                        border: "none", padding: "10px 18px", borderRadius: "8px",
                        fontWeight: 700, cursor: booked ? "default" : "pointer",
                        fontSize: "0.88rem", transition: "all 0.2s"
                    }}
                >
                    {booked ? "✓ Booked" : "Book Now"}
                </button>
            </div>
        </div>
    );
}

export default function GeneticTestsPage() {
    const { cartCount, toggleCart } = useCart();
    const { data: session } = useSession();
    const router = useRouter();

    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState("all");
    const [bookedTests, setBookedTests] = useState({});
    const [showBanner, setShowBanner] = useState(true);

    const allTests = GENETIC_CATEGORIES.flatMap((cat) =>
        cat.tests.map((t) => ({ ...t, category: cat.id, categoryTitle: cat.title, icon: cat.icon, color: cat.color, bg: cat.bg }))
    );

    const filteredTests = allTests.filter((t) => {
        const matchSearch = search === "" || t.name.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase());
        const matchCat = activeCategory === "all" || t.category === activeCategory;
        return matchSearch && matchCat;
    });

    const handleBook = (test) => {
        if (!session) {
            alert("Please log in to book a test.");
            return router.push("/login");
        }
        if (!confirm(`Confirm booking for "${test.name}" at ₹${test.price.toLocaleString("en-IN")}?`)) return;
        setBookedTests((prev) => ({ ...prev, [test.id]: true }));
        alert("✅ " + test.name + " booked! Our team will call you within 24 hours to confirm sample collection.");
    };

    const showGrouped = activeCategory === "all" && search === "";

    return (
        <>
            <Navbar openCart={() => toggleCart(true)} cartCount={cartCount} />

            <div style={{ marginTop: "80px", background: "#F8FAFC", minHeight: "100vh" }}>

                {/* Hero */}
                <div style={{
                    background: "linear-gradient(135deg, #1E1B4B 0%, #312E81 40%, #4C1D95 100%)",
                    color: "white", padding: "60px 20px 80px", textAlign: "center", position: "relative", overflow: "hidden"
                }}>
                    <div style={{ position: "absolute", top: "-60px", right: "-60px", width: "220px", height: "220px", borderRadius: "50%", background: "rgba(139,92,246,0.2)", pointerEvents: "none" }} />
                    <div style={{ position: "absolute", bottom: "-40px", left: "-40px", width: "160px", height: "160px", borderRadius: "50%", background: "rgba(167,139,250,0.15)", pointerEvents: "none" }} />
                    <Link href="/bio/bioinformatics" style={{ color: "#A78BFA", textDecoration: "none", fontSize: "0.9rem", display: "inline-block", marginBottom: "14px" }}>
                        ← Back to Bio-Health Hub
                    </Link>
                    <div style={{ fontSize: "3.5rem", marginBottom: "14px" }}>🧬</div>
                    <h1 style={{ fontSize: "clamp(1.8rem,4vw,3rem)", fontWeight: 800, margin: "0 0 16px", lineHeight: 1.2 }}>
                        Genetic &amp; Molecular Test Labs
                    </h1>
                    <p style={{ color: "#C4B5FD", fontSize: "1.1rem", maxWidth: "600px", margin: "0 auto 32px", lineHeight: 1.6 }}>
                        Find verified diagnostic laboratories offering genetic, molecular, and biomarker testing. Book a test directly.
                    </p>
                    <div style={{ display: "flex", maxWidth: "600px", margin: "0 auto", borderRadius: "12px", overflow: "hidden", boxShadow: "0 8px 30px rgba(0,0,0,0.3)" }}>
                        <input
                            id="genetic-test-search"
                            type="text"
                            placeholder="Search by test name, gene, or disease…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ flex: 1, padding: "16px 20px", border: "none", fontSize: "1rem", outline: "none", background: "white", color: "#1E1B4B" }}
                        />
                        <button style={{ background: "#7C3AED", color: "white", border: "none", padding: "0 28px", fontSize: "1rem", fontWeight: 700, cursor: "pointer" }}>
                            Search
                        </button>
                    </div>
                    <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap", marginTop: "20px" }}>
                        {["BRCA", "NGS", "Whole Exome", "Pharmacogenomics", "Diabetes Panel", "NIPT", "MODY"].map((tag) => (
                            <button key={tag} onClick={() => { setSearch(tag); setActiveCategory("all"); }}
                                style={{ background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)", color: "white", padding: "6px 16px", borderRadius: "20px", cursor: "pointer", fontSize: "0.85rem" }}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Consult Banner */}
                {showBanner && (
                    <div style={{ background: "#FEF3C7", borderLeft: "4px solid #F59E0B", padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: "1100px", margin: "24px auto 0", borderRadius: "8px" }}>
                        <p style={{ margin: 0, color: "#92400E", fontSize: "0.95rem" }}>
                            ⚕️ <strong>Medical Advice:</strong> Always consult a healthcare professional before ordering genetic tests. Results should be interpreted with a certified genetic counsellor.
                        </p>
                        <button onClick={() => setShowBanner(false)} style={{ background: "none", border: "none", color: "#92400E", cursor: "pointer", fontSize: "1.2rem", marginLeft: "16px" }}>✕</button>
                    </div>
                )}

                <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 20px 60px" }}>

                    {/* Category Filter Tabs */}
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "32px" }}>
                        {[{ id: "all", icon: "🔬", title: "All Tests", color: "#7C3AED" }, ...GENETIC_CATEGORIES].map((cat) => (
                            <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                                style={{
                                    padding: "8px 18px", borderRadius: "20px", border: "none", cursor: "pointer",
                                    fontWeight: 600, fontSize: "0.88rem", transition: "all 0.2s",
                                    background: activeCategory === cat.id ? cat.color : "#E5E7EB",
                                    color: activeCategory === cat.id ? "white" : "#374151"
                                }}
                            >
                                {cat.icon} {cat.title}
                            </button>
                        ))}
                    </div>

                    {/* Test Grid */}
                    {showGrouped ? (
                        GENETIC_CATEGORIES.map((cat) => (
                            <section key={cat.id} style={{ marginBottom: "48px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "18px", borderLeft: `4px solid ${cat.color}`, paddingLeft: "14px" }}>
                                    <span style={{ fontSize: "1.8rem" }}>{cat.icon}</span>
                                    <div>
                                        <h2 style={{ margin: 0, fontSize: "1.3rem", color: cat.color }}>{cat.title}</h2>
                                        <p style={{ margin: 0, color: "#6B7280", fontSize: "0.85rem" }}>{cat.tests.length} tests available</p>
                                    </div>
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "18px" }}>
                                    {cat.tests.map((test) => (
                                        <TestCard key={test.id} test={{ ...test, color: cat.color, bg: cat.bg, categoryTitle: cat.title }} booked={bookedTests[test.id]} onBook={() => handleBook(test)} />
                                    ))}
                                </div>
                            </section>
                        ))
                    ) : (
                        <div>
                            <p style={{ color: "#6B7280", marginBottom: "20px" }}>
                                {filteredTests.length} test{filteredTests.length !== 1 ? "s" : ""} found
                                {search && <> for "<strong>{search}</strong>"</>}
                            </p>
                            {filteredTests.length === 0 ? (
                                <div style={{ textAlign: "center", padding: "60px 20px", color: "#9CA3AF" }}>
                                    <div style={{ fontSize: "3rem", marginBottom: "12px" }}>🔍</div>
                                    <h3>No tests found</h3>
                                    <p>Try a different search term or browse all categories.</p>
                                    <button onClick={() => { setSearch(""); setActiveCategory("all"); }}
                                        style={{ background: "#7C3AED", color: "white", border: "none", padding: "10px 24px", borderRadius: "8px", cursor: "pointer", marginTop: "12px", fontWeight: 700 }}>
                                        Clear Filters
                                    </button>
                                </div>
                            ) : (
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "18px" }}>
                                    {filteredTests.map((test) => (
                                        <TestCard key={test.id} test={test} booked={bookedTests[test.id]} onBook={() => handleBook(test)} />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Partner Labs */}
                    <section style={{ marginTop: "60px" }}>
                        <h2 style={{ fontSize: "1.5rem", marginBottom: "20px", color: "#1E1B4B" }}>🏥 Partner Laboratories in Gorakhpur</h2>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "18px" }}>
                            {PARTNER_LABS.map((lab, i) => (
                                <div key={i} style={{ border: "1px solid #E5E7EB", borderRadius: "14px", padding: "22px", background: "white", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                                        <h3 style={{ margin: 0, fontSize: "1rem", color: "#1E1B4B", lineHeight: 1.3 }}>{lab.name}</h3>
                                        {lab.accredited && <span style={{ background: "#D1FAE5", color: "#059669", padding: "2px 10px", borderRadius: "12px", fontSize: "0.72rem", fontWeight: 700, whiteSpace: "nowrap", marginLeft: "8px" }}>✓ NABL</span>}
                                    </div>
                                    <p style={{ color: "#6B7280", margin: "0 0 6px", fontSize: "0.9rem" }}>📍 {lab.city}</p>
                                    {lab.homeCollection && <p style={{ color: "#059669", margin: "0 0 10px", fontSize: "0.85rem" }}>🏠 Home Sample Collection Available</p>}
                                    <a href={"tel:" + lab.phone} style={{ color: "#7C3AED", fontSize: "0.9rem", textDecoration: "none" }}>📞 {lab.phone}</a>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* How It Works */}
                    <section style={{ marginTop: "60px", background: "linear-gradient(135deg, #1E1B4B, #4C1D95)", borderRadius: "20px", padding: "48px 32px", color: "white", textAlign: "center" }}>
                        <h2 style={{ margin: "0 0 40px", fontSize: "1.8rem" }}>How to Get Your Genetic Test</h2>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "20px" }}>
                            {[
                                { step: "1", icon: "🩺", title: "Consult a Doctor", desc: "Get a referral or choose a self-pay test with counsellor support" },
                                { step: "2", icon: "📋", title: "Select Your Test", desc: "Browse by category, gene, or clinical indication" },
                                { step: "3", icon: "🩸", title: "Sample Collection", desc: "Home collection or visit a partner lab near you" },
                                { step: "4", icon: "🧬", title: "Lab Analysis", desc: "Sequencing and analysis by NABL-accredited labs" },
                                { step: "5", icon: "📊", title: "Get Your Report", desc: "Detailed report with genetic counsellor interpretation" },
                            ].map((s) => (
                                <div key={s.step} style={{ background: "rgba(255,255,255,0.1)", borderRadius: "12px", padding: "22px 14px" }}>
                                    <div style={{ fontSize: "2rem", marginBottom: "8px" }}>{s.icon}</div>
                                    <div style={{ background: "#A78BFA", borderRadius: "50%", width: "26px", height: "26px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px", fontWeight: 700, fontSize: "0.82rem" }}>{s.step}</div>
                                    <h4 style={{ margin: "0 0 6px", fontSize: "0.95rem" }}>{s.title}</h4>
                                    <p style={{ margin: 0, color: "#C4B5FD", fontSize: "0.82rem", lineHeight: 1.5 }}>{s.desc}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </div>

            <Footer />
        </>
    );
}
