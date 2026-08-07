"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const RISK_CATEGORIES = [
    {
        icon: "⚖️", name: "Regulatory", color: "#818cf8",
        risks: ["License renewal lapse", "Drug import violation", "CDSCO non-compliance"],
    },
    {
        icon: "⚙️", name: "Operational", color: "#F59E0B",
        risks: ["Staff shortage", "Warehouse fire/flood", "Power failure"],
    },
    {
        icon: "💰", name: "Financial", color: "#10B981",
        risks: ["Cash flow crunch", "GST penalty", "Payment gateway failure"],
    },
    {
        icon: "🔐", name: "Cybersecurity", color: "#EF4444",
        risks: ["Data breach", "Ransomware attack", "Credential theft"],
    },
    {
        icon: "🚚", name: "Supply Chain", color: "#f472b6",
        risks: ["Supplier stockout", "Cold chain break", "Counterfeit infiltration"],
    },
];

const LIKELIHOOD = ["Rare", "Unlikely", "Possible", "Likely", "Almost Certain"];
const IMPACT = ["Insignificant", "Minor", "Moderate", "Major", "Catastrophic"];

function getRiskColor(score) {
    if (score <= 4) return { bg: "rgba(16,185,129,0.15)", text: "#34d399", label: "LOW" };
    if (score <= 9) return { bg: "rgba(245,158,11,0.15)", text: "#fbbf24", label: "MEDIUM" };
    if (score <= 16) return { bg: "rgba(249,115,22,0.15)", text: "#fb923c", label: "HIGH" };
    return { bg: "rgba(239,68,68,0.15)", text: "#f87171", label: "CRITICAL" };
}

export default function RiskManagementSOPPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [likelihood, setLikelihood] = useState(2);
    const [impact, setImpact] = useState(2);

    useEffect(() => {
        if (status === "unauthenticated") router.push("/admin/login");
    }, [status, router]);

    const riskScore = (likelihood + 1) * (impact + 1);
    const riskInfo = getRiskColor(riskScore);

    return (
        <div style={{ minHeight: "100vh", background: "radial-gradient(circle at center, #1a0a2e, #090d16, #0a0a0a)", padding: "40px 20px 60px", fontFamily: "'Inter', sans-serif", color: "#f8fafc" }}>
            <main style={{ maxWidth: "1200px", margin: "0 auto" }}>
                <Link href="/admin/sop" style={{ color: "#94a3b8", textDecoration: "none", fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "24px" }}>← Back to SOP Hub</Link>

                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px" }}>
                    <div style={{ width: "56px", height: "56px", background: "linear-gradient(135deg, #a855f7, #7c3aed)", borderRadius: "18px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem" }}>⚠️</div>
                    <div>
                        <div style={{ color: "#c084fc", fontSize: "0.7rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.12em" }}>CHAPTER 18</div>
                        <h1 style={{ margin: 0, fontSize: "1.9rem", fontWeight: "800", color: "white" }}>Risk Management SOP</h1>
                        <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: "0.85rem" }}>Risk Register · Rating Matrix · Mitigation Plans</p>
                    </div>
                </div>

                {/* Interactive Risk Matrix */}
                <h2 style={{ color: "#e2e8f0", fontSize: "1rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "20px" }}>📊 Risk Rating Calculator (Likelihood × Impact)</h2>
                <div style={{ background: "rgba(15,23,42,0.7)", border: "1px solid rgba(168,85,247,0.15)", borderRadius: "24px", padding: "32px", marginBottom: "40px", backdropFilter: "blur(20px)" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px", marginBottom: "32px" }}>
                        <div>
                            <div style={{ fontWeight: "800", color: "white", marginBottom: "12px" }}>Likelihood</div>
                            <div style={{ display: "grid", gap: "8px" }}>
                                {LIKELIHOOD.map((l, i) => (
                                    <button
                                        key={l}
                                        onClick={() => setLikelihood(i)}
                                        style={{ padding: "10px 16px", background: likelihood === i ? "rgba(168,85,247,0.2)" : "rgba(255,255,255,0.03)", border: `1px solid ${likelihood === i ? "rgba(168,85,247,0.4)" : "rgba(255,255,255,0.06)"}`, borderRadius: "10px", color: likelihood === i ? "#c084fc" : "#94a3b8", fontWeight: likelihood === i ? "800" : "600", cursor: "pointer", textAlign: "left", fontSize: "0.85rem", transition: "all 0.2s" }}
                                    >
                                        {i + 1}. {l}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <div style={{ fontWeight: "800", color: "white", marginBottom: "12px" }}>Impact</div>
                            <div style={{ display: "grid", gap: "8px" }}>
                                {IMPACT.map((imp, i) => (
                                    <button
                                        key={imp}
                                        onClick={() => setImpact(i)}
                                        style={{ padding: "10px 16px", background: impact === i ? "rgba(168,85,247,0.2)" : "rgba(255,255,255,0.03)", border: `1px solid ${impact === i ? "rgba(168,85,247,0.4)" : "rgba(255,255,255,0.06)"}`, borderRadius: "10px", color: impact === i ? "#c084fc" : "#94a3b8", fontWeight: impact === i ? "800" : "600", cursor: "pointer", textAlign: "left", fontSize: "0.85rem", transition: "all 0.2s" }}
                                    >
                                        {i + 1}. {imp}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Risk Score Result */}
                    <div style={{ background: riskInfo.bg, border: `1px solid ${riskInfo.text}30`, borderRadius: "16px", padding: "24px", textAlign: "center" }}>
                        <div style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>
                            {LIKELIHOOD[likelihood]} × {IMPACT[impact]}
                        </div>
                        <div style={{ fontSize: "3rem", fontWeight: "900", color: riskInfo.text, marginBottom: "4px" }}>{riskScore}</div>
                        <div style={{ fontWeight: "800", color: riskInfo.text, fontSize: "1.1rem", letterSpacing: "0.1em" }}>{riskInfo.label} RISK</div>
                        <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: "8px" }}>
                            Score = Likelihood ({likelihood + 1}) × Impact ({impact + 1})
                        </div>
                    </div>
                </div>

                {/* Risk Register by Category */}
                <h2 style={{ color: "#e2e8f0", fontSize: "1rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "20px" }}>📋 Risk Register Categories</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px", marginBottom: "40px" }}>
                    {RISK_CATEGORIES.map(cat => (
                        <div key={cat.name} style={{ background: "rgba(15,23,42,0.6)", border: `1px solid ${cat.color}25`, borderRadius: "20px", padding: "24px", backdropFilter: "blur(20px)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                                <div style={{ fontSize: "1.8rem" }}>{cat.icon}</div>
                                <div style={{ fontWeight: "800", color: cat.color, fontSize: "1rem" }}>{cat.name} Risk</div>
                            </div>
                            <div style={{ display: "grid", gap: "8px" }}>
                                {cat.risks.map(risk => (
                                    <div key={risk} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.82rem", color: "#94a3b8" }}>
                                        <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: cat.color, flexShrink: 0 }} />
                                        {risk}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Risk Matrix Grid */}
                <h2 style={{ color: "#e2e8f0", fontSize: "1rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "20px" }}>🗺️ Risk Rating Matrix</h2>
                <div style={{ background: "rgba(15,23,42,0.6)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "24px", padding: "28px", marginBottom: "40px", backdropFilter: "blur(20px)", overflowX: "auto" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "80px repeat(5, 1fr)", gap: "4px", minWidth: "500px" }}>
                        <div />
                        {IMPACT.map(imp => (
                            <div key={imp} style={{ textAlign: "center", fontSize: "0.65rem", fontWeight: "700", color: "#64748b", textTransform: "uppercase", padding: "8px 4px" }}>{imp.slice(0, 6)}</div>
                        ))}
                        {[...LIKELIHOOD].reverse().map((lik, ri) => {
                            const row = LIKELIHOOD.length - 1 - ri;
                            return [
                                <div key={lik} style={{ fontSize: "0.65rem", fontWeight: "700", color: "#64748b", display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: "8px" }}>{lik.slice(0, 8)}</div>,
                                ...IMPACT.map((_, col) => {
                                    const score = (row + 1) * (col + 1);
                                    const info = getRiskColor(score);
                                    const isSelected = likelihood === row && impact === col;
                                    return (
                                        <div
                                            key={`${row}-${col}`}
                                            onClick={() => { setLikelihood(row); setImpact(col); }}
                                            style={{ background: isSelected ? info.text : info.bg, border: `1px solid ${isSelected ? info.text : info.text + "30"}`, borderRadius: "8px", padding: "10px 4px", textAlign: "center", cursor: "pointer", transition: "all 0.2s" }}
                                        >
                                            <div style={{ fontWeight: "800", fontSize: "0.85rem", color: isSelected ? "white" : info.text }}>{score}</div>
                                        </div>
                                    );
                                })
                            ];
                        })}
                    </div>
                    <div style={{ display: "flex", gap: "16px", marginTop: "20px", flexWrap: "wrap" }}>
                        {[["LOW", "#34d399", "1–4"], ["MEDIUM", "#fbbf24", "5–9"], ["HIGH", "#fb923c", "10–16"], ["CRITICAL", "#f87171", "17–25"]].map(([label, color, range]) => (
                            <div key={label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <div style={{ width: "12px", height: "12px", borderRadius: "3px", background: color }} />
                                <span style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: "700" }}>{label} ({range})</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ textAlign: "center", color: "#334155", fontSize: "0.75rem", fontWeight: "600", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                    Swastik Medicare SOP v1.0 — Chapter 18: Risk Management
                </div>
            </main>
        </div>
    );
}
