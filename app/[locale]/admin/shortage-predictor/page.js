"use client";
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const RISK_CONFIG = {
    CRITICAL: { color: "#EF4444", bg: "#FEF2F2", border: "#FECACA", label: "🔴 CRITICAL", ring: "rgba(239,68,68,0.3)" },
    HIGH:     { color: "#F97316", bg: "#FFF7ED", border: "#FED7AA", label: "🟠 HIGH",     ring: "rgba(249,115,22,0.3)" },
    MEDIUM:   { color: "#F59E0B", bg: "#FFFBEB", border: "#FDE68A", label: "🟡 MEDIUM",   ring: "rgba(245,158,11,0.3)" },
    LOW:      { color: "#10B981", bg: "#F0FDF4", border: "#A7F3D0", label: "🟢 LOW",      ring: "rgba(16,185,129,0.3)" },
};

const URGENCY_CONFIG = {
    EMERGENCY: { color: "#EF4444", label: "🚨 EMERGENCY" },
    URGENT:    { color: "#F97316", label: "⚠️ URGENT" },
    SOON:      { color: "#F59E0B", label: "📋 SOON" },
    ROUTINE:   { color: "#10B981", label: "✅ ROUTINE" },
};

export default function ShortagePredictor() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [data, setData] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [alerting, setAlerting] = useState(null);
    const [filterRisk, setFilterRisk] = useState("ALL");
    const [searchQuery, setSearchQuery] = useState("");
    const [explainModal, setExplainModal] = useState(null); // { item, loading, result }

    const fetchIntelligence = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/shortage-predictor");
            const result = await res.json();
            if (result.success) {
                setData(result.data);
                setSummary(result.summary);
            }
        } catch (error) {
            console.error("Failed to load predictor data", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchIntelligence(); }, [fetchIntelligence]);

    const handleAlert = async (item) => {
        setAlerting(item.id);
        try {
            const res = await fetch("/api/admin/market-intelligence/broadcast", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    customMessage: `🚨 STOCK ALERT — ${item.name}\n\nRisk Level: ${item.riskLevel}\nDays of stock remaining: ${item.daysLeft === 999 ? "Stable" : item.daysLeft}\nPlease secure supply immediately or check Swastik Medicare for alternatives.`
                })
            });
            const result = await res.json();
            if (result.success) {
                alert(`✅ Alert broadcast to ${result.sentCount} retailers & stockists!`);
            } else {
                alert("Failed to send broadcast.");
            }
        } catch (e) {
            alert("Error sending alert.");
        } finally {
            setAlerting(null);
        }
    };

    const handleExplain = async (item) => {
        setExplainModal({ item, loading: true, result: null });
        try {
            const res = await fetch("/api/admin/shortage-predictor/explain", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: item.name,
                    category: item.category,
                    salt: item.salt,
                    brand: item.brand,
                    riskLevel: item.riskLevel,
                    currentStock: item.currentStock,
                    salesLast30Days: item.salesLast30Days,
                    dailyVelocity: item.dailyVelocity,
                    daysLeft: item.daysLeft,
                    regulatoryAlert: item.regulatoryAlert,
                    supplierCount: item.supplierCount,
                    lowestSupplierDays: item.lowestSupplierDays,
                    procurementQty: item.procurement?.reorderQty,
                    vendorName: item.topVendor?.name,
                    mrp: item.mrp
                })
            });
            const result = await res.json();
            if (result.success) {
                setExplainModal(m => ({ ...m, loading: false, result: result.explanation }));
            } else {
                setExplainModal(m => ({ ...m, loading: false, result: { summary: "Failed to generate explanation. Please try again." } }));
            }
        } catch (e) {
            setExplainModal(m => ({ ...m, loading: false, result: { summary: "Connection error. Please try again." } }));
        }
    };

    const handleWhatsAppVendor = (item) => {
        const vendor = item.topVendor;
        if (!vendor) return;
        const msg = encodeURIComponent(`Hello, I am from Swastik Medicare. We need to urgently procure *${item.name}* (${item.procurement?.reorderQty || "TBD"} units). Please confirm availability and pricing. Thank you.`);
        window.open(`https://wa.me/91${vendor.phone}?text=${msg}`, "_blank");
    };

    const filteredData = data.filter(item => {
        const matchRisk = filterRisk === "ALL" || item.riskLevel === filterRisk;
        const matchSearch = !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase()) || (item.salt || "").toLowerCase().includes(searchQuery.toLowerCase());
        return matchRisk && matchSearch;
    });

    const cardStyle = (risk) => ({
        background: RISK_CONFIG[risk]?.bg || "#F9FAFB",
        border: `1px solid ${RISK_CONFIG[risk]?.border || "#E5E7EB"}`,
        borderRadius: "16px",
        padding: "1.25rem",
        marginBottom: "0.75rem",
        boxShadow: `0 0 0 0px ${RISK_CONFIG[risk]?.ring || "transparent"}`,
        transition: "all 0.2s"
    });

    return (
        <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)", fontFamily: "'Inter', sans-serif" }}>
            {/* Top Navigation */}
            <div style={{ background: "rgba(255,255,255,0.04)", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "1rem 2rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <Link href="/admin" style={{ color: "#6B7280", fontSize: "0.85rem", textDecoration: "none" }}>← Admin</Link>
                    <span style={{ color: "#374151" }}>|</span>
                    <span style={{ color: "white", fontWeight: "bold" }}>🧠 AI Shortage Predictor</span>
                    <span style={{ background: "linear-gradient(135deg, #6366F1, #8B5CF6)", color: "white", fontSize: "0.65rem", fontWeight: "black", padding: "3px 10px", borderRadius: "20px", letterSpacing: "0.1em" }}>PHASE 2+3</span>
                </div>
                <button onClick={fetchIntelligence} style={{ padding: "8px 18px", background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.4)", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", color: "#A5B4FC", fontSize: "0.8rem" }}>
                    🔄 Refresh
                </button>
            </div>

            <div style={{ padding: "2rem", maxWidth: "1500px", margin: "0 auto" }}>

                {/* Hero Header */}
                <div style={{ marginBottom: "2rem" }}>
                    <h1 style={{ fontSize: "2.5rem", fontWeight: 900, color: "white", margin: 0, letterSpacing: "-1px" }}>
                        🧠 AI Shortage Intelligence
                    </h1>
                    <p style={{ color: "#6B7280", marginTop: "6px", fontSize: "0.95rem" }}>
                        Composite risk scoring from real-time sales velocity · Regulatory alerts · B2B supplier feeds · GenAI-powered explanations
                    </p>
                </div>

                {/* Summary Cards */}
                {summary && !loading && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
                        {[
                            { label: "Critical", value: summary.critical, color: "#EF4444", bg: "rgba(239,68,68,0.1)", icon: "🔴" },
                            { label: "High Risk", value: summary.high, color: "#F97316", bg: "rgba(249,115,22,0.1)", icon: "🟠" },
                            { label: "Medium", value: summary.medium, color: "#F59E0B", bg: "rgba(245,158,11,0.1)", icon: "🟡" },
                            { label: "Regulatory Alerts", value: summary.regulatoryAlerts, color: "#8B5CF6", bg: "rgba(139,92,246,0.1)", icon: "⚠️" },
                            { label: "No Suppliers", value: summary.noSuppliers, color: "#EF4444", bg: "rgba(239,68,68,0.08)", icon: "🚫" },
                            { label: "Emergency Reorder Cost", value: `₹${Number(summary.totalReorderCost).toLocaleString()}`, color: "#10B981", bg: "rgba(16,185,129,0.1)", icon: "💰" },
                        ].map((card, i) => (
                            <div key={i} style={{ background: card.bg, border: `1px solid ${card.color}30`, borderRadius: "14px", padding: "1.2rem", textAlign: "center" }}>
                                <div style={{ fontSize: "1.5rem", marginBottom: "4px" }}>{card.icon}</div>
                                <div style={{ fontSize: "1.6rem", fontWeight: 900, color: card.color }}>{card.value}</div>
                                <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: "2px" }}>{card.label}</div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Filters */}
                <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>
                    <input
                        type="text"
                        placeholder="Search by name or salt..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        style={{ flex: 1, minWidth: "200px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "10px 16px", color: "white", outline: "none", fontSize: "0.9rem" }}
                    />
                    {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map(level => (
                        <button
                            key={level}
                            onClick={() => setFilterRisk(level)}
                            style={{
                                padding: "8px 16px", borderRadius: "10px", fontWeight: "bold", fontSize: "0.75rem",
                                cursor: "pointer", border: "none", textTransform: "uppercase", letterSpacing: "0.08em",
                                background: filterRisk === level
                                    ? (RISK_CONFIG[level]?.color || "#6366F1")
                                    : "rgba(255,255,255,0.06)",
                                color: filterRisk === level ? "white" : "#6B7280",
                                transition: "all 0.2s"
                            }}
                        >
                            {level === "ALL" ? `All (${data.length})` : `${level} (${data.filter(d => d.riskLevel === level).length})`}
                        </button>
                    ))}
                </div>

                {/* Drug Cards */}
                {loading ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {Array(6).fill(0).map((_, i) => (
                            <div key={i} style={{ background: "rgba(255,255,255,0.04)", borderRadius: "16px", height: "100px", animation: "pulse 1.5s infinite" }} />
                        ))}
                    </div>
                ) : filteredData.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "4rem", color: "#4B5563" }}>
                        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔍</div>
                        <div style={{ fontWeight: "bold", fontSize: "1.1rem" }}>No matching drugs found</div>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                        {filteredData.map(item => {
                            const risk = RISK_CONFIG[item.riskLevel] || RISK_CONFIG.LOW;
                            const urgency = URGENCY_CONFIG[item.procurement?.urgency || "ROUTINE"];
                            const isHighRisk = item.riskLevel === "CRITICAL" || item.riskLevel === "HIGH";

                            return (
                                <div key={item.id} style={{
                                    background: "rgba(255,255,255,0.04)",
                                    border: `1px solid ${risk.color}30`,
                                    borderRadius: "16px",
                                    padding: "1.25rem 1.5rem",
                                    borderLeft: `4px solid ${risk.color}`
                                }}>
                                    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1.5fr auto", gap: "1rem", alignItems: "center" }}>

                                        {/* Drug Info */}
                                        <div>
                                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                                                <span style={{ fontWeight: 900, color: "white", fontSize: "0.95rem" }}>{item.name}</span>
                                                {item.regulatoryAlert && (
                                                    <span style={{ background: "rgba(139,92,246,0.2)", color: "#A78BFA", fontSize: "0.6rem", fontWeight: "black", padding: "2px 8px", borderRadius: "10px", letterSpacing: "0.1em", border: "1px solid rgba(139,92,246,0.3)" }}>⚠️ REGULATORY</span>
                                                )}
                                            </div>
                                            <div style={{ fontSize: "0.75rem", color: "#6B7280" }}>{item.salt || "No salt data"} {item.brand && `· ${item.brand}`}</div>
                                            {item.category && <div style={{ fontSize: "0.7rem", color: "#4B5563", marginTop: "2px" }}>{item.category}</div>}
                                        </div>

                                        {/* Stock */}
                                        <div style={{ textAlign: "center" }}>
                                            <div style={{ fontSize: "1.2rem", fontWeight: 900, color: item.currentStock === 0 ? "#EF4444" : "white" }}>{item.currentStock}</div>
                                            <div style={{ fontSize: "0.65rem", color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.08em" }}>Units Left</div>
                                        </div>

                                        {/* Velocity */}
                                        <div style={{ textAlign: "center" }}>
                                            <div style={{ fontSize: "1rem", fontWeight: 700, color: "#A5B4FC" }}>{item.dailyVelocity}/day</div>
                                            <div style={{ fontSize: "0.65rem", color: "#6B7280", textTransform: "uppercase" }}>{item.salesLast30Days} sold/30d</div>
                                        </div>

                                        {/* Depletion */}
                                        <div style={{ textAlign: "center" }}>
                                            <div style={{ fontSize: "1rem", fontWeight: 700, color: item.daysLeft < 7 ? "#EF4444" : item.daysLeft < 30 ? "#F97316" : "#10B981" }}>
                                                {item.daysLeft === 999 ? "∞ Stable" : `${item.daysLeft}d`}
                                            </div>
                                            <div style={{ fontSize: "0.65rem", color: "#6B7280", textTransform: "uppercase" }}>Depletion Est.</div>
                                        </div>

                                        {/* Risk Score */}
                                        <div style={{ textAlign: "center" }}>
                                            <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                                                <span style={{ background: `${risk.color}20`, color: risk.color, padding: "4px 10px", borderRadius: "20px", fontWeight: "bold", fontSize: "0.8rem", border: `1px solid ${risk.color}40` }}>
                                                    {risk.label}
                                                </span>
                                                <span style={{ fontSize: "0.65rem", color: "#4B5563" }}>Score: {item.compositeScore}/100</span>
                                            </div>
                                        </div>

                                        {/* Procurement */}
                                        <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: "10px", padding: "10px", border: "1px solid rgba(255,255,255,0.06)" }}>
                                            <div style={{ fontSize: "0.65rem", color: urgency.color, fontWeight: "black", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>
                                                {urgency.label}
                                            </div>
                                            {item.procurement?.reorderQty > 0 && (
                                                <>
                                                    <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "white" }}>Order {item.procurement.reorderQty} units</div>
                                                    <div style={{ fontSize: "0.7rem", color: "#6B7280" }}>≈ ₹{Number(item.procurement.estimatedCost).toLocaleString()}</div>
                                                    <div style={{ fontSize: "0.65rem", color: "#9CA3AF", marginTop: "2px" }}>{item.procurement.reorderWindow}</div>
                                                </>
                                            )}
                                            {item.topVendor && (
                                                <div style={{ marginTop: "6px", fontSize: "0.65rem", color: "#34D399" }}>
                                                    <span>📦 {item.topVendor.name}</span>
                                                </div>
                                            )}
                                            {item.supplierCount === 0 && (
                                                <div style={{ fontSize: "0.65rem", color: "#EF4444", marginTop: "4px" }}>🚫 No verified suppliers</div>
                                            )}
                                        </div>

                                        {/* Action Buttons */}
                                        <div style={{ display: "flex", flexDirection: "column", gap: "6px", minWidth: "120px" }}>
                                            <button
                                                onClick={() => handleExplain(item)}
                                                style={{
                                                    background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
                                                    color: "white", border: "none", padding: "8px 12px", borderRadius: "8px",
                                                    cursor: "pointer", fontWeight: "bold", fontSize: "0.7rem", textTransform: "uppercase",
                                                    letterSpacing: "0.06em"
                                                }}
                                            >
                                                🧠 Explain Risk
                                            </button>
                                            {isHighRisk && (
                                                <button
                                                    onClick={() => handleAlert(item)}
                                                    disabled={alerting === item.id}
                                                    style={{
                                                        background: alerting === item.id ? "#374151" : "#EF4444",
                                                        color: "white", border: "none", padding: "8px 12px", borderRadius: "8px",
                                                        cursor: "pointer", fontWeight: "bold", fontSize: "0.7rem", textTransform: "uppercase",
                                                        opacity: alerting === item.id ? 0.7 : 1
                                                    }}
                                                >
                                                    {alerting === item.id ? "Sending..." : "🚨 Alert Network"}
                                                </button>
                                            )}
                                            {item.topVendor && isHighRisk && (
                                                <button
                                                    onClick={() => handleWhatsAppVendor(item)}
                                                    style={{
                                                        background: "#25D366", color: "white", border: "none",
                                                        padding: "8px 12px", borderRadius: "8px", cursor: "pointer",
                                                        fontWeight: "bold", fontSize: "0.7rem", textTransform: "uppercase"
                                                    }}
                                                >
                                                    📦 Order via WA
                                                </button>
                                            )}
                                        </div>

                                    </div>

                                    {/* Alternatives */}
                                    {item.alternatives?.length > 0 && (
                                        <div style={{ marginTop: "12px", paddingTop: "10px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                                            <span style={{ fontSize: "0.65rem", color: "#6B7280", fontWeight: "black", textTransform: "uppercase", letterSpacing: "0.1em" }}>Suggested Alternatives · Same Salt</span>
                                            <div style={{ display: "flex", gap: "8px", marginTop: "6px", flexWrap: "wrap" }}>
                                                {item.alternatives.map((alt, i) => (
                                                    <span key={i} style={{ background: "rgba(16,185,129,0.1)", color: "#34D399", fontSize: "0.75rem", padding: "3px 10px", borderRadius: "8px", border: "1px solid rgba(16,185,129,0.2)" }}>
                                                        {alt.name} ({alt.stock} units)
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* GenAI Explain Modal */}
            {explainModal && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
                    <div style={{ background: "linear-gradient(135deg, #1a1a2e, #16213e)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: "24px", padding: "2.5rem", maxWidth: "700px", width: "100%", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 0 80px rgba(99,102,241,0.2)" }}>
                        {/* Modal Header */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
                            <div>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                                    <span style={{ fontSize: "1.5rem" }}>🧠</span>
                                    <h2 style={{ color: "white", fontWeight: 900, margin: 0, fontSize: "1.3rem" }}>AI Risk Explanation</h2>
                                    <span style={{
                                        background: explainModal.result?.isGenAI
                                            ? "linear-gradient(135deg, #6366F1, #8B5CF6)"
                                            : "rgba(255,255,255,0.1)",
                                        color: "white", fontSize: "0.6rem", padding: "3px 8px", borderRadius: "10px", fontWeight: "black", textTransform: "uppercase"
                                    }}>
                                        {explainModal.loading ? "Processing..." : (explainModal.result?.isGenAI ? "✨ Gemini AI" : "Swastik Engine")}
                                    </span>
                                </div>
                                <div style={{ color: "#A5B4FC", fontWeight: "bold", fontSize: "0.9rem" }}>
                                    {explainModal.item.name}
                                    {" · "}
                                    <span style={{ color: RISK_CONFIG[explainModal.item.riskLevel]?.color }}>
                                        {RISK_CONFIG[explainModal.item.riskLevel]?.label}
                                    </span>
                                </div>
                            </div>
                            <button onClick={() => setExplainModal(null)} style={{ background: "rgba(255,255,255,0.08)", border: "none", color: "#9CA3AF", width: "36px", height: "36px", borderRadius: "50%", cursor: "pointer", fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                        </div>

                        {explainModal.loading ? (
                            <div style={{ textAlign: "center", padding: "3rem" }}>
                                <div style={{ fontSize: "2rem", marginBottom: "1rem", animation: "spin 1s linear infinite" }}>🧠</div>
                                <div style={{ color: "#A5B4FC", fontWeight: "bold" }}>Analyzing supply chain data...</div>
                                <div style={{ color: "#4B5563", fontSize: "0.8rem", marginTop: "6px" }}>Correlating sales velocity, regulatory signals, and B2B supplier feeds</div>
                            </div>
                        ) : explainModal.result ? (
                            <div>
                                {/* AI Summary */}
                                {explainModal.result.isGenAI ? (
                                    <div style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "14px", padding: "1.5rem" }}>
                                        <pre style={{ color: "#E5E7EB", fontFamily: "'Inter', sans-serif", fontSize: "0.9rem", lineHeight: 1.7, whiteSpace: "pre-wrap", margin: 0 }}>
                                            {explainModal.result.summary}
                                        </pre>
                                    </div>
                                ) : (
                                    <>
                                        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "1.25rem", marginBottom: "1.25rem" }}>
                                            <p style={{ color: "#E5E7EB", margin: 0, lineHeight: 1.7, fontSize: "0.9rem" }} dangerouslySetInnerHTML={{ __html: (explainModal.result.summary || "").replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                                        </div>
                                        {explainModal.result.reasons?.length > 0 && (
                                            <div style={{ marginBottom: "1.25rem" }}>
                                                <div style={{ color: "#6B7280", fontSize: "0.7rem", fontWeight: "black", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "10px" }}>📊 Key Risk Factors</div>
                                                {explainModal.result.reasons.map((reason, i) => (
                                                    <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "10px", alignItems: "flex-start" }}>
                                                        <span style={{ color: "#F97316", fontSize: "0.9rem", marginTop: "2px" }}>◆</span>
                                                        <p style={{ color: "#D1D5DB", margin: 0, fontSize: "0.85rem", lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: reason.replace(/\*\*(.*?)\*\*/g, '<strong style="color:white">$1</strong>') }} />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {explainModal.result.actions?.length > 0 && (
                                            <div style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "14px", padding: "1.25rem" }}>
                                                <div style={{ color: "#10B981", fontSize: "0.7rem", fontWeight: "black", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "10px" }}>✅ Recommended Actions</div>
                                                {explainModal.result.actions.map((action, i) => (
                                                    <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "8px", alignItems: "flex-start" }}>
                                                        <span style={{ color: "#10B981", fontWeight: "black" }}>{i + 1}.</span>
                                                        <p style={{ color: "#D1D5DB", margin: 0, fontSize: "0.85rem", lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: action.replace(/\*\*(.*?)\*\*/g, '<strong style="color:white">$1</strong>') }} />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}
                                {/* Quick Actions inside modal */}
                                <div style={{ display: "flex", gap: "10px", marginTop: "1.5rem" }}>
                                    {explainModal.item.topVendor && (
                                        <button
                                            onClick={() => handleWhatsAppVendor(explainModal.item)}
                                            style={{ flex: 1, background: "#25D366", color: "white", border: "none", padding: "12px", borderRadius: "10px", cursor: "pointer", fontWeight: "bold", fontSize: "0.8rem" }}
                                        >
                                            📦 Order via WhatsApp — {explainModal.item.topVendor.name}
                                        </button>
                                    )}
                                    <button
                                        onClick={() => { setExplainModal(null); handleAlert(explainModal.item); }}
                                        style={{ flex: 1, background: "rgba(239,68,68,0.2)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.3)", padding: "12px", borderRadius: "10px", cursor: "pointer", fontWeight: "bold", fontSize: "0.8rem" }}
                                    >
                                        🚨 Alert Network
                                    </button>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            )}

            <style>{`
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
