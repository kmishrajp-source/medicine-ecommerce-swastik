"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function InventoryDashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [kpis, setKpis] = useState(null);
    const [abcData, setAbcData] = useState(null);
    const [activeTab, setActiveTab] = useState("abc");

    useEffect(() => {
        if (status === "unauthenticated") router.push("/admin/login");
    }, [status, router]);

    useEffect(() => {
        // Fetch KPIs
        fetch("/api/admin/sop/inventory/kpi").then(r => r.json()).then(d => {
            if (d.success) setKpis(d.kpis);
        }).catch(() => {});

        // Fetch ABC
        fetch("/api/admin/sop/inventory/abc-analysis").then(r => r.json()).then(d => {
            if (d.success) setAbcData(d);
        }).catch(() => {});
    }, []);

    const statCard = (icon, label, value, color) => (
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "20px", textAlign: "center" }}>
            <div style={{ fontSize: "1.5rem", marginBottom: "8px" }}>{icon}</div>
            <div style={{ fontSize: "1.6rem", fontWeight: "800", color }}>{value}</div>
            <div style={{ fontSize: "0.7rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: "4px" }}>{label}</div>
        </div>
    );

    return (
        <div style={{ minHeight: "100vh", background: "radial-gradient(circle at top left, #1e3a8a, #090d16)", padding: "40px 20px 60px", fontFamily: "'Inter', sans-serif", color: "#f8fafc" }}>
            <main style={{ maxWidth: "1200px", margin: "0 auto" }}>
                <Link href="/admin/sop" style={{ color: "#94a3b8", textDecoration: "none", fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "24px" }}>← Back to SOP Hub</Link>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", marginBottom: "32px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <div style={{ width: "52px", height: "52px", background: "linear-gradient(135deg, #3b82f6, #2563eb)", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem" }}>📦</div>
                        <div>
                            <div style={{ color: "#93c5fd", fontSize: "0.7rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.1em" }}>CHAPTER 9</div>
                            <h1 style={{ margin: 0, fontSize: "1.8rem", fontWeight: "800", color: "white" }}>Inventory Management</h1>
                            <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: "0.85rem" }}>ABC Classification, FEFO Control & Cycle Counts</p>
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: "10px" }}>
                        <Link href="/admin/sop/inventory-management/cycle-count" style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", color: "#34d399", padding: "10px 20px", borderRadius: "10px", textDecoration: "none", fontWeight: "800", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px" }}>
                            ⏱️ Perform Cycle Count
                        </Link>
                    </div>
                </div>

                {/* KPI Dashboard */}
                <h2 style={{ color: "#e2e8f0", fontSize: "1rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "16px" }}>📈 Inventory KPIs (30 Days)</h2>
                {kpis ? (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px", marginBottom: "40px" }}>
                        {statCard("🔄", "Inventory Turnover", `${kpis.turnoverRatio}x`, "#60a5fa")}
                        {statCard("💰", "Total Inv. Value", `₹${kpis.totalInventoryValue.toLocaleString("en-IN")}`, "#34d399")}
                        {statCard("📉", "Expiry Loss %", `${kpis.expiryLossPercent}%`, parseFloat(kpis.expiryLossPercent) > 2 ? "#EF4444" : "#F59E0B")}
                        {statCard("🎯", "Stock Accuracy", `${kpis.accuracyPercent}%`, parseFloat(kpis.accuracyPercent) < 95 ? "#EF4444" : "#10B981")}
                    </div>
                ) : (
                    <div style={{ color: "#64748b", marginBottom: "40px" }}>Loading KPIs...</div>
                )}

                {/* Main Tabs */}
                <div style={{ display: "flex", gap: "12px", marginBottom: "28px" }}>
                    {[
                        { id: "abc", label: "📊 ABC Analysis", color: "#3b82f6" },
                        { id: "fefo", label: "🗓️ FEFO & Expiry Tracker", color: "#f59e0b" },
                    ].map(t => (
                        <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ padding: "12px 24px", borderRadius: "12px", border: "none", cursor: "pointer", fontWeight: "800", fontSize: "0.9rem", background: activeTab === t.id ? t.color : "rgba(255,255,255,0.06)", color: activeTab === t.id ? "white" : "#94a3b8", transition: "all 0.2s" }}>
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div style={{ background: "rgba(15,23,42,0.6)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "24px", padding: "32px", backdropFilter: "blur(20px)" }}>
                    {activeTab === "abc" && abcData && (
                        <div>
                            <div style={{ display: "flex", gap: "16px", marginBottom: "24px", flexWrap: "wrap" }}>
                                <div style={{ flex: 1, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", padding: "16px", borderRadius: "12px" }}>
                                    <div style={{ color: "#34d399", fontWeight: "800", fontSize: "1.2rem" }}>A-Class (Top 80% Val)</div>
                                    <div style={{ color: "#a7f3d0", fontSize: "0.8rem", marginTop: "4px" }}>{abcData.summary.A} Items · Requires Daily Cycle Counts</div>
                                </div>
                                <div style={{ flex: 1, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.3)", padding: "16px", borderRadius: "12px" }}>
                                    <div style={{ color: "#818cf8", fontWeight: "800", fontSize: "1.2rem" }}>B-Class (Next 15% Val)</div>
                                    <div style={{ color: "#c7d2fe", fontSize: "0.8rem", marginTop: "4px" }}>{abcData.summary.B} Items · Requires Weekly Cycle Counts</div>
                                </div>
                                <div style={{ flex: 1, background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", padding: "16px", borderRadius: "12px" }}>
                                    <div style={{ color: "#fbbf24", fontWeight: "800", fontSize: "1.2rem" }}>C-Class (Bottom 5% Val)</div>
                                    <div style={{ color: "#fde68a", fontSize: "0.8rem", marginTop: "4px" }}>{abcData.summary.C} Items · Requires Monthly Counts</div>
                                </div>
                            </div>
                            
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                                <thead>
                                    <tr style={{ background: "rgba(255,255,255,0.05)", color: "#94a3b8", textAlign: "left" }}>
                                        <th style={{ padding: "12px" }}>Product Name</th>
                                        <th style={{ padding: "12px" }}>Stock</th>
                                        <th style={{ padding: "12px" }}>Current Inv. Value</th>
                                        <th style={{ padding: "12px" }}>Cum. %</th>
                                        <th style={{ padding: "12px" }}>ABC Class</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {abcData.products.slice(0, 50).map(p => (
                                        <tr key={p.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                            <td style={{ padding: "12px", color: "white", fontWeight: "600" }}>{p.name}</td>
                                            <td style={{ padding: "12px", color: "#94a3b8" }}>{p.stock}</td>
                                            <td style={{ padding: "12px", color: "#94a3b8" }}>₹{(p.inventoryValue || 0).toLocaleString("en-IN")}</td>
                                            <td style={{ padding: "12px", color: "#94a3b8" }}>{p.cumulativePercentage}%</td>
                                            <td style={{ padding: "12px" }}>
                                                <span style={{ 
                                                    background: p.abcClass === "A" ? "rgba(16,185,129,0.2)" : p.abcClass === "B" ? "rgba(99,102,241,0.2)" : "rgba(245,158,11,0.2)",
                                                    color: p.abcClass === "A" ? "#34d399" : p.abcClass === "B" ? "#818cf8" : "#fbbf24",
                                                    padding: "4px 12px", borderRadius: "8px", fontWeight: "800" 
                                                }}>{p.abcClass}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {abcData.products.length > 50 && <div style={{ textAlign: "center", padding: "16px", color: "#64748b", fontSize: "0.8rem" }}>Showing top 50 items</div>}
                        </div>
                    )}

                    {activeTab === "fefo" && abcData && (
                        <div>
                            <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", padding: "16px", borderRadius: "12px", marginBottom: "24px", color: "#fca5a5" }}>
                                <strong>FEFO Protocol:</strong> Items listed below are nearing expiry or have expired. Ensure these are picked FIRST (First Expiring, First Out) for orders, or removed from shelves if expired.
                            </div>
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                                <thead>
                                    <tr style={{ background: "rgba(255,255,255,0.05)", color: "#94a3b8", textAlign: "left" }}>
                                        <th style={{ padding: "12px" }}>Product Name</th>
                                        <th style={{ padding: "12px" }}>Stock</th>
                                        <th style={{ padding: "12px" }}>Expiry Date</th>
                                        <th style={{ padding: "12px" }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {abcData.products
                                        .filter(p => p.expiryDate && new Date(p.expiryDate) < new Date(Date.now() + 90*24*60*60*1000))
                                        .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate))
                                        .map(p => {
                                            const daysLeft = Math.ceil((new Date(p.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
                                            const isExpired = daysLeft <= 0;
                                            return (
                                                <tr key={p.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                                    <td style={{ padding: "12px", color: "white", fontWeight: "600" }}>{p.name}</td>
                                                    <td style={{ padding: "12px", color: "#94a3b8" }}>{p.stock}</td>
                                                    <td style={{ padding: "12px", color: "#94a3b8" }}>{new Date(p.expiryDate).toLocaleDateString("en-IN")}</td>
                                                    <td style={{ padding: "12px" }}>
                                                        <span style={{ 
                                                            background: isExpired ? "rgba(239,68,68,0.2)" : daysLeft <= 30 ? "rgba(245,158,11,0.2)" : "rgba(250,204,21,0.2)",
                                                            color: isExpired ? "#f87171" : daysLeft <= 30 ? "#fbbf24" : "#fde047",
                                                            padding: "4px 12px", borderRadius: "8px", fontWeight: "800" 
                                                        }}>
                                                            {isExpired ? "EXPIRED" : `Expires in ${daysLeft} days`}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    }
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
