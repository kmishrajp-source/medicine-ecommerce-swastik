"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const QUALITY_OBJECTIVES = [
    { icon: "✅", title: "Genuine Products Only", desc: "100% authentic medicines from licensed distributors", color: "#10B981" },
    { icon: "🚫", title: "Zero Counterfeit Products", desc: "Strict vendor verification & batch traceability", color: "#EF4444" },
    { icon: "🔍", title: "Full Traceability", desc: "Batch → Supplier → Customer tracking for every product", color: "#F59E0B" },
];

const CAPA_STEPS = [
    { icon: "⚠️", label: "Issue Identified", desc: "Quality non-conformance raised" },
    { icon: "🔬", label: "Root Cause Analysis", desc: "5-Why or Fishbone method" },
    { icon: "🔧", label: "Corrective Action", desc: "Fix the immediate problem" },
    { icon: "🛡️", label: "Preventive Action", desc: "Ensure issue doesn't recur" },
];

const AUDIT_AREAS = [
    "Storage conditions", "Product labeling", "Batch traceability",
    "Expiry monitoring", "Staff compliance", "Vendor certification",
    "Cold chain integrity", "Prescription validation", "Waste disposal",
];

export default function QualitySOPPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [activeCapaStep, setActiveCapaStep] = useState(null);
    const [nextAuditDays, setNextAuditDays] = useState(0);

    useEffect(() => {
        if (status === "unauthenticated") router.push("/admin/login");
    }, [status, router]);

    useEffect(() => {
        const now = new Date();
        const nextAudit = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        const diff = Math.ceil((nextAudit - now) / (1000 * 60 * 60 * 24));
        setNextAuditDays(diff);
    }, []);

    return (
        <div style={{ minHeight: "100vh", background: "radial-gradient(circle at top, #1e1b4b, #090d16, #0a0a0a)", padding: "40px 20px 60px", fontFamily: "'Inter', sans-serif", color: "#f8fafc" }}>
            <main style={{ maxWidth: "1100px", margin: "0 auto" }}>
                <Link href="/admin/sop" style={{ color: "#94a3b8", textDecoration: "none", fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "24px" }}>← Back to SOP Hub</Link>

                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", marginBottom: "32px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <div style={{ width: "56px", height: "56px", background: "linear-gradient(135deg, #818cf8, #6366f1)", borderRadius: "18px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem" }}>🏅</div>
                        <div>
                            <div style={{ color: "#a5b4fc", fontSize: "0.7rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.12em" }}>CHAPTER 16</div>
                            <h1 style={{ margin: 0, fontSize: "1.9rem", fontWeight: "800", color: "white" }}>Quality Management SOP</h1>
                            <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: "0.85rem" }}>Quality Objectives · Audits · CAPA Process</p>
                        </div>
                    </div>
                    <div style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: "16px", padding: "16px 24px", textAlign: "center" }}>
                        <div style={{ fontSize: "2rem", fontWeight: "800", color: "#818cf8" }}>{nextAuditDays}</div>
                        <div style={{ fontSize: "0.7rem", color: "#94a3b8", fontWeight: "700", textTransform: "uppercase" }}>Days to Next Audit</div>
                        <div style={{ fontSize: "0.7rem", color: "#64748b", marginTop: "2px" }}>Monthly frequency</div>
                    </div>
                </div>

                {/* Quality Objectives */}
                <h2 style={{ color: "#e2e8f0", fontSize: "1rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "20px" }}>🎯 Quality Objectives</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px", marginBottom: "40px" }}>
                    {QUALITY_OBJECTIVES.map(obj => (
                        <div key={obj.title} style={{ background: "rgba(15,23,42,0.6)", border: `1px solid ${obj.color}25`, borderRadius: "20px", padding: "28px", backdropFilter: "blur(20px)" }}>
                            <div style={{ fontSize: "2.5rem", marginBottom: "14px" }}>{obj.icon}</div>
                            <div style={{ fontWeight: "800", color: obj.color, fontSize: "1.05rem", marginBottom: "8px" }}>{obj.title}</div>
                            <div style={{ fontSize: "0.82rem", color: "#94a3b8", lineHeight: "1.6" }}>{obj.desc}</div>
                        </div>
                    ))}
                </div>

                {/* CAPA Process */}
                <h2 style={{ color: "#e2e8f0", fontSize: "1rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "20px" }}>🔄 CAPA Process Flow</h2>
                <div style={{ background: "rgba(15,23,42,0.6)", border: "1px solid rgba(99,102,241,0.15)", borderRadius: "24px", padding: "32px", marginBottom: "40px", backdropFilter: "blur(20px)" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", flexWrap: "wrap" }}>
                        {CAPA_STEPS.map((step, i) => (
                            <div key={step.label} style={{ display: "flex", alignItems: "center" }}>
                                <div
                                    onClick={() => setActiveCapaStep(activeCapaStep === i ? null : i)}
                                    style={{ textAlign: "center", cursor: "pointer", padding: "20px 16px", borderRadius: "16px", background: activeCapaStep === i ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.03)", border: `1px solid ${activeCapaStep === i ? "rgba(99,102,241,0.4)" : "rgba(255,255,255,0.06)"}`, transition: "all 0.2s", minWidth: "130px" }}
                                >
                                    <div style={{ fontSize: "2rem", marginBottom: "8px" }}>{step.icon}</div>
                                    <div style={{ fontWeight: "800", color: "white", fontSize: "0.85rem" }}>{step.label}</div>
                                    {activeCapaStep === i && <div style={{ fontSize: "0.72rem", color: "#a5b4fc", marginTop: "8px", lineHeight: "1.5" }}>{step.desc}</div>}
                                </div>
                                {i < CAPA_STEPS.length - 1 && <div style={{ color: "#818cf8", fontSize: "1.4rem", margin: "0 6px", opacity: 0.5 }}>↓</div>}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Audit Checklist */}
                <h2 style={{ color: "#e2e8f0", fontSize: "1rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "20px" }}>📋 Monthly Audit Areas</h2>
                <div style={{ background: "rgba(15,23,42,0.6)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "24px", padding: "28px", marginBottom: "40px", backdropFilter: "blur(20px)" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "10px" }}>
                        {AUDIT_AREAS.map((area, i) => (
                            <div key={area} style={{ display: "flex", alignItems: "center", gap: "10px", background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.12)", borderRadius: "10px", padding: "12px 14px" }}>
                                <span style={{ color: "#818cf8", fontWeight: "800", fontSize: "0.8rem" }}>{String(i + 1).padStart(2, "0")}</span>
                                <span style={{ color: "#e2e8f0", fontSize: "0.85rem", fontWeight: "600" }}>{area}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ textAlign: "center", color: "#334155", fontSize: "0.75rem", fontWeight: "600", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                    Swastik Medicare SOP v1.0 — Chapter 16: Quality Management
                </div>
            </main>
        </div>
    );
}
