"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const FLOW_STEPS = [
    { icon: "🛍️", label: "Order Received", desc: "Confirmed & payment cleared" },
    { icon: "🗺️", label: "Route Planning", desc: "Optimal delivery route assigned" },
    { icon: "🚚", label: "Dispatch", desc: "Handed to courier / delivery agent" },
    { icon: "📡", label: "Tracking", desc: "Real-time GPS tracking active" },
    { icon: "✅", label: "Delivery Confirmation", desc: "OTP / signature collected" },
];

const KPIS = [
    { icon: "⏰", label: "On-Time Delivery", target: "≥ 95%", color: "#10B981" },
    { icon: "❌", label: "Failed Deliveries", target: "< 2%", color: "#EF4444" },
    { icon: "💰", label: "Delivery Cost / Order", target: "< ₹80", color: "#F59E0B" },
    { icon: "⭐", label: "Delivery Rating", target: "≥ 4.5/5", color: "#818cf8" },
];

export default function DeliverySOPPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [activeStep, setActiveStep] = useState(null);
    const [stats, setStats] = useState({ total: 0, delivered: 0, pending: 0, failed: 0 });

    useEffect(() => {
        if (status === "unauthenticated") router.push("/admin/login");
    }, [status, router]);

    useEffect(() => {
        fetch("/api/admin/sop/delivery")
            .then(r => r.json())
            .then(d => { if (d.success) setStats(d.stats); })
            .catch(() => {});
    }, []);

    const deliveryRate = stats.total > 0 ? Math.round((stats.delivered / stats.total) * 100) : 0;

    return (
        <div style={{ minHeight: "100vh", background: "radial-gradient(circle at bottom right, #064e3b, #090d16, #0a0a0a)", padding: "40px 20px 60px", fontFamily: "'Inter', sans-serif", color: "#f8fafc" }}>
            <main style={{ maxWidth: "1100px", margin: "0 auto" }}>
                <Link href="/admin/sop" style={{ color: "#94a3b8", textDecoration: "none", fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "24px" }}>← Back to SOP Hub</Link>

                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px" }}>
                    <div style={{ width: "56px", height: "56px", background: "linear-gradient(135deg, #10B981, #059669)", borderRadius: "18px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem" }}>🚚</div>
                    <div>
                        <div style={{ color: "#34d399", fontSize: "0.7rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.12em" }}>CHAPTER 13</div>
                        <h1 style={{ margin: 0, fontSize: "1.9rem", fontWeight: "800", color: "white" }}>Delivery SOP</h1>
                        <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: "0.85rem" }}>Route Planning · Dispatch · Tracking · Confirmation</p>
                    </div>
                </div>

                {/* Live Stats */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "14px", marginBottom: "32px" }}>
                    {[
                        { icon: "📦", label: "Total Orders", value: stats.total, color: "#e2e8f0" },
                        { icon: "✅", label: "Delivered", value: stats.delivered, color: "#10B981" },
                        { icon: "⏳", label: "In Transit", value: stats.pending, color: "#F59E0B" },
                        { icon: "❌", label: "Failed", value: stats.failed, color: "#EF4444" },
                    ].map(s => (
                        <div key={s.label} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "20px", textAlign: "center" }}>
                            <div style={{ fontSize: "1.5rem", marginBottom: "8px" }}>{s.icon}</div>
                            <div style={{ fontSize: "1.8rem", fontWeight: "800", color: s.color }}>{s.value}</div>
                            <div style={{ fontSize: "0.7rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: "4px" }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Delivery Rate Bar */}
                <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "20px 24px", marginBottom: "40px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                        <span style={{ fontWeight: "700", color: "white" }}>Delivery Success Rate</span>
                        <span style={{ fontWeight: "800", color: deliveryRate >= 95 ? "#10B981" : "#EF4444", fontSize: "1.2rem" }}>{deliveryRate}%</span>
                    </div>
                    <div style={{ height: "10px", background: "rgba(255,255,255,0.08)", borderRadius: "10px", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${deliveryRate}%`, background: deliveryRate >= 95 ? "linear-gradient(90deg, #10B981, #34d399)" : "linear-gradient(90deg, #EF4444, #f87171)", borderRadius: "10px", transition: "width 0.8s ease" }} />
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "8px" }}>Target: ≥ 95% on-time delivery rate</div>
                </div>

                {/* Delivery Flow */}
                <h2 style={{ color: "#e2e8f0", fontSize: "1rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "20px" }}>📋 Delivery Process Flow</h2>
                <div style={{ background: "rgba(15,23,42,0.6)", border: "1px solid rgba(16,185,129,0.15)", borderRadius: "24px", padding: "32px", marginBottom: "40px", backdropFilter: "blur(20px)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "4px", flexWrap: "wrap", justifyContent: "center" }}>
                        {FLOW_STEPS.map((step, i) => (
                            <div key={step.label} style={{ display: "flex", alignItems: "center" }}>
                                <div
                                    onClick={() => setActiveStep(activeStep === i ? null : i)}
                                    style={{ textAlign: "center", cursor: "pointer", padding: "18px 14px", borderRadius: "16px", background: activeStep === i ? "rgba(16,185,129,0.15)" : "rgba(255,255,255,0.03)", border: `1px solid ${activeStep === i ? "rgba(16,185,129,0.4)" : "rgba(255,255,255,0.06)"}`, transition: "all 0.2s", minWidth: "120px" }}
                                >
                                    <div style={{ fontSize: "2rem", marginBottom: "8px" }}>{step.icon}</div>
                                    <div style={{ fontWeight: "800", fontSize: "0.85rem", color: "white" }}>{step.label}</div>
                                    {activeStep === i && <div style={{ fontSize: "0.72rem", color: "#34d399", marginTop: "8px", lineHeight: "1.5" }}>{step.desc}</div>}
                                </div>
                                {i < FLOW_STEPS.length - 1 && <div style={{ color: "#10B981", fontSize: "1.4rem", margin: "0 4px", opacity: 0.5 }}>→</div>}
                            </div>
                        ))}
                    </div>
                </div>

                {/* KPIs */}
                <h2 style={{ color: "#e2e8f0", fontSize: "1rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "20px" }}>📊 Delivery KPIs</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "14px", marginBottom: "40px" }}>
                    {KPIS.map(kpi => (
                        <div key={kpi.label} style={{ background: "rgba(15,23,42,0.6)", border: `1px solid ${kpi.color}25`, borderRadius: "18px", padding: "24px", backdropFilter: "blur(20px)", textAlign: "center" }}>
                            <div style={{ fontSize: "2rem", marginBottom: "12px" }}>{kpi.icon}</div>
                            <div style={{ fontWeight: "800", color: "white", marginBottom: "8px" }}>{kpi.label}</div>
                            <div style={{ fontSize: "1.3rem", fontWeight: "800", color: kpi.color }}>Target: {kpi.target}</div>
                        </div>
                    ))}
                </div>

                <div style={{ textAlign: "center", color: "#334155", fontSize: "0.75rem", fontWeight: "600", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                    Swastik Medicare SOP v1.0 — Chapter 13: Delivery
                </div>
            </main>
        </div>
    );
}
