"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const FLOW_STEPS = [
    { icon: "📥", label: "Receiving", desc: "Goods acceptance at dock" },
    { icon: "🔍", label: "Inspection", desc: "Quality & quantity check" },
    { icon: "🏪", label: "Storage", desc: "Assign storage zone" },
    { icon: "🧺", label: "Picking", desc: "Pull items for orders" },
    { icon: "📦", label: "Packing", desc: "Seal & label packages" },
    { icon: "🚚", label: "Dispatch", desc: "Hand over to courier" },
];

const STORAGE_ZONES = [
    { icon: "🌡️", name: "Ambient", temp: "15–25°C", humidity: "< 65%", color: "#F59E0B", items: ["Tablets", "Capsules", "Syrups"] },
    { icon: "❄️", name: "Refrigerated", temp: "2–8°C", humidity: "Controlled", color: "#60a5fa", items: ["Vaccines", "Insulin", "Eye drops"] },
    { icon: "🔒", name: "Controlled Substances", temp: "15–25°C", humidity: "Secured", color: "#f472b6", items: ["Schedule H/X", "Narcotics", "Psychotropics"] },
];

const KPIS = [
    { icon: "🎯", label: "Picking Accuracy", target: "≥ 99.5%", color: "#10B981" },
    { icon: "✅", label: "Order Accuracy", target: "≥ 99%", color: "#34d399" },
    { icon: "💔", label: "Damaged Inventory %", target: "< 0.5%", color: "#EF4444" },
    { icon: "⏱️", label: "Order Processing Time", target: "< 2 hrs", color: "#F59E0B" },
];

export default function WarehouseSOPPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [activeStep, setActiveStep] = useState(null);
    const [stats, setStats] = useState({ received: 0, dispatched: 0, pending: 0, damaged: 0 });

    useEffect(() => {
        if (status === "unauthenticated") router.push("/admin/login");
    }, [status, router]);

    useEffect(() => {
        fetch("/api/admin/sop/warehouse")
            .then(r => r.json())
            .then(d => { if (d.success) setStats(d.stats); })
            .catch(() => {});
    }, []);

    const s = (prop, val) => ({ [prop]: val });

    return (
        <div style={{ minHeight: "100vh", background: "radial-gradient(circle at top right, #1c1917, #090d16, #0a0a0a)", padding: "40px 20px 60px", fontFamily: "'Inter', sans-serif", color: "#f8fafc" }}>
            <main style={{ maxWidth: "1200px", margin: "0 auto" }}>
                <Link href="/admin/sop" style={{ color: "#94a3b8", textDecoration: "none", fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "24px" }}>← Back to SOP Hub</Link>

                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px" }}>
                    <div style={{ width: "56px", height: "56px", background: "linear-gradient(135deg, #F59E0B, #D97706)", borderRadius: "18px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem" }}>🏭</div>
                    <div>
                        <div style={{ color: "#fcd34d", fontSize: "0.7rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.12em" }}>CHAPTER 11</div>
                        <h1 style={{ margin: 0, fontSize: "1.9rem", fontWeight: "800", color: "white" }}>Warehouse Operations SOP</h1>
                        <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: "0.85rem" }}>Receiving · Storage · Picking · Packing · Dispatch</p>
                    </div>
                </div>

                {/* Live Stats */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "14px", marginBottom: "40px" }}>
                    {[
                        { icon: "📥", label: "GRNs Today", value: stats.received, color: "#10B981" },
                        { icon: "🚚", label: "Dispatched Today", value: stats.dispatched, color: "#34d399" },
                        { icon: "⏳", label: "Pending Picks", value: stats.pending, color: "#F59E0B" },
                        { icon: "💔", label: "Damage Reports", value: stats.damaged, color: "#EF4444" },
                    ].map(s => (
                        <div key={s.label} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "20px", textAlign: "center" }}>
                            <div style={{ fontSize: "1.5rem", marginBottom: "8px" }}>{s.icon}</div>
                            <div style={{ fontSize: "1.8rem", fontWeight: "800", color: s.color }}>{s.value}</div>
                            <div style={{ fontSize: "0.7rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: "4px" }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Warehouse Flow */}
                <h2 style={{ color: "#e2e8f0", fontSize: "1rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "20px" }}>📦 Warehouse Flow</h2>
                <div style={{ background: "rgba(15,23,42,0.6)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: "24px", padding: "32px", marginBottom: "40px", backdropFilter: "blur(20px)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0", flexWrap: "wrap", justifyContent: "center" }}>
                        {FLOW_STEPS.map((step, i) => (
                            <div key={step.label} style={{ display: "flex", alignItems: "center" }}>
                                <div
                                    onClick={() => setActiveStep(activeStep === i ? null : i)}
                                    style={{ textAlign: "center", cursor: "pointer", padding: "16px 12px", borderRadius: "16px", background: activeStep === i ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.03)", border: `1px solid ${activeStep === i ? "rgba(245,158,11,0.4)" : "rgba(255,255,255,0.06)"}`, transition: "all 0.2s", minWidth: "110px" }}
                                    onMouseOver={e => { e.currentTarget.style.background = "rgba(245,158,11,0.1)"; e.currentTarget.style.borderColor = "rgba(245,158,11,0.3)"; }}
                                    onMouseOut={e => { if (activeStep !== i) { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}}
                                >
                                    <div style={{ fontSize: "2rem", marginBottom: "8px" }}>{step.icon}</div>
                                    <div style={{ fontWeight: "800", fontSize: "0.85rem", color: "white" }}>{step.label}</div>
                                    {activeStep === i && <div style={{ fontSize: "0.72rem", color: "#fcd34d", marginTop: "6px", lineHeight: "1.4" }}>{step.desc}</div>}
                                </div>
                                {i < FLOW_STEPS.length - 1 && <div style={{ color: "#F59E0B", fontSize: "1.4rem", margin: "0 6px", opacity: 0.5 }}>→</div>}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Storage Zones */}
                <h2 style={{ color: "#e2e8f0", fontSize: "1rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "20px" }}>🌡️ Storage Conditions</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px", marginBottom: "40px" }}>
                    {STORAGE_ZONES.map(zone => (
                        <div key={zone.name} style={{ background: "rgba(15,23,42,0.6)", border: `1px solid ${zone.color}30`, borderRadius: "20px", padding: "24px", backdropFilter: "blur(20px)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                                <div style={{ fontSize: "2rem" }}>{zone.icon}</div>
                                <div>
                                    <div style={{ fontWeight: "800", color: zone.color, fontSize: "1rem" }}>{zone.name}</div>
                                    <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Temp: {zone.temp}</div>
                                </div>
                            </div>
                            <div style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: "10px", fontWeight: "700", textTransform: "uppercase" }}>Items Stored</div>
                            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                                {zone.items.map(item => (
                                    <span key={item} style={{ background: `${zone.color}15`, color: zone.color, padding: "4px 10px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: "700", border: `1px solid ${zone.color}30` }}>{item}</span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* KPIs */}
                <h2 style={{ color: "#e2e8f0", fontSize: "1rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "20px" }}>📊 Warehouse KPIs</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "14px", marginBottom: "40px" }}>
                    {KPIS.map(kpi => (
                        <div key={kpi.label} style={{ background: "rgba(15,23,42,0.6)", border: `1px solid ${kpi.color}25`, borderRadius: "18px", padding: "22px", backdropFilter: "blur(20px)" }}>
                            <div style={{ fontSize: "1.8rem", marginBottom: "12px" }}>{kpi.icon}</div>
                            <div style={{ fontWeight: "800", color: "white", fontSize: "0.95rem", marginBottom: "6px" }}>{kpi.label}</div>
                            <div style={{ fontSize: "1.1rem", fontWeight: "800", color: kpi.color }}>Target: {kpi.target}</div>
                        </div>
                    ))}
                </div>

                <div style={{ textAlign: "center", color: "#334155", fontSize: "0.75rem", fontWeight: "600", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                    Swastik Medicare SOP v1.0 — Chapter 11: Warehouse Operations
                </div>
            </main>
        </div>
    );
}
