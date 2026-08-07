"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const ELIGIBLE = [
    { icon: "🔀", reason: "Wrong Product", desc: "Item delivered doesn't match order" },
    { icon: "💔", reason: "Damaged Product", desc: "Physical damage to medicine/packaging" },
    { icon: "🚚", reason: "Delivery Error", desc: "Missing items or wrong address" },
];

const NOT_ELIGIBLE = [
    { icon: "💊", reason: "Opened Medicines", desc: "Blister/bottle seal broken" },
    { icon: "⏰", reason: "Expired Return Window", desc: "Past 48-hour return policy" },
    { icon: "📋", reason: "Schedule H/X Drugs", desc: "Controlled substances non-returnable" },
];

const APPROVAL_LEVELS = [
    { level: "L1", role: "Customer Service", action: "Log complaint & issue return label", color: "#60a5fa", icon: "📞" },
    { level: "L2", role: "Pharmacist", action: "Verify medical validity of return", color: "#34d399", icon: "👨‍⚕️" },
    { level: "L3", role: "Operations Manager", action: "Final approval & refund authorization", color: "#f472b6", icon: "👔" },
];

export default function ReturnsSOPPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [returns, setReturns] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === "unauthenticated") router.push("/admin/login");
    }, [status, router]);

    useEffect(() => {
        fetch("/api/admin/returns?status=PENDING&limit=5")
            .then(r => r.json())
            .then(d => { if (d.returns) setReturns(d.returns.slice(0, 5)); })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const statusColor = (s) => s === "PENDING" ? "#F59E0B" : s === "APPROVED" ? "#10B981" : "#EF4444";

    return (
        <div style={{ minHeight: "100vh", background: "radial-gradient(circle at top, #450a0a, #090d16, #0a0a0a)", padding: "40px 20px 60px", fontFamily: "'Inter', sans-serif", color: "#f8fafc" }}>
            <main style={{ maxWidth: "1100px", margin: "0 auto" }}>
                <Link href="/admin/sop" style={{ color: "#94a3b8", textDecoration: "none", fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "24px" }}>← Back to SOP Hub</Link>

                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", marginBottom: "32px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <div style={{ width: "56px", height: "56px", background: "linear-gradient(135deg, #ef4444, #dc2626)", borderRadius: "18px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem" }}>↩️</div>
                        <div>
                            <div style={{ color: "#f87171", fontSize: "0.7rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.12em" }}>CHAPTER 14</div>
                            <h1 style={{ margin: 0, fontSize: "1.9rem", fontWeight: "800", color: "white" }}>Returns & Refunds SOP</h1>
                            <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: "0.85rem" }}>Eligibility · Approval Workflow · Refund Processing</p>
                        </div>
                    </div>
                    <Link href="/admin/returns" style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171", padding: "10px 20px", borderRadius: "10px", textDecoration: "none", fontWeight: "800", fontSize: "0.85rem" }}>↩️ Go to Returns Dashboard →</Link>
                </div>

                {/* Eligibility Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "40px" }}>
                    {/* Eligible */}
                    <div style={{ background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "24px", padding: "28px" }}>
                        <div style={{ color: "#34d399", fontSize: "0.75rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "16px" }}>✅ Eligible for Return</div>
                        <div style={{ display: "grid", gap: "12px" }}>
                            {ELIGIBLE.map(e => (
                                <div key={e.reason} style={{ display: "flex", gap: "12px", alignItems: "center", background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.12)", borderRadius: "12px", padding: "14px 16px" }}>
                                    <div style={{ fontSize: "1.4rem" }}>{e.icon}</div>
                                    <div>
                                        <div style={{ fontWeight: "800", color: "white", fontSize: "0.9rem" }}>{e.reason}</div>
                                        <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "2px" }}>{e.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Not Eligible */}
                    <div style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "24px", padding: "28px" }}>
                        <div style={{ color: "#f87171", fontSize: "0.75rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "16px" }}>❌ Not Eligible for Return</div>
                        <div style={{ display: "grid", gap: "12px" }}>
                            {NOT_ELIGIBLE.map(e => (
                                <div key={e.reason} style={{ display: "flex", gap: "12px", alignItems: "center", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.12)", borderRadius: "12px", padding: "14px 16px" }}>
                                    <div style={{ fontSize: "1.4rem" }}>{e.icon}</div>
                                    <div>
                                        <div style={{ fontWeight: "800", color: "white", fontSize: "0.9rem" }}>{e.reason}</div>
                                        <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "2px" }}>{e.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Approval Levels */}
                <h2 style={{ color: "#e2e8f0", fontSize: "1rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "20px" }}>🔐 Approval Hierarchy</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px", marginBottom: "40px" }}>
                    {APPROVAL_LEVELS.map((level, i) => (
                        <div key={level.level} style={{ background: "rgba(15,23,42,0.6)", border: `1px solid ${level.color}25`, borderRadius: "20px", padding: "24px", backdropFilter: "blur(20px)", display: "flex", gap: "16px", alignItems: "flex-start" }}>
                            <div style={{ width: "48px", height: "48px", background: `${level.color}20`, border: `1px solid ${level.color}40`, borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", flexShrink: 0 }}>{level.icon}</div>
                            <div>
                                <div style={{ fontSize: "0.7rem", color: level.color, fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px" }}>Level {level.level}</div>
                                <div style={{ fontWeight: "800", color: "white", fontSize: "1rem", marginBottom: "6px" }}>{level.role}</div>
                                <div style={{ fontSize: "0.8rem", color: "#94a3b8", lineHeight: "1.5" }}>{level.action}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Recent Returns */}
                <h2 style={{ color: "#e2e8f0", fontSize: "1rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "16px" }}>📋 Recent Return Requests</h2>
                <div style={{ background: "rgba(15,23,42,0.6)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "24px", padding: "24px", backdropFilter: "blur(20px)" }}>
                    {loading ? (
                        <div style={{ color: "#64748b", textAlign: "center", padding: "32px" }}>Loading returns...</div>
                    ) : returns.length === 0 ? (
                        <div style={{ color: "#64748b", textAlign: "center", padding: "32px" }}>No pending returns. ✅</div>
                    ) : (
                        returns.map(r => (
                            <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                <div>
                                    <div style={{ fontWeight: "700", color: "white" }}>{r.orderId || r.id}</div>
                                    <div style={{ fontSize: "0.78rem", color: "#94a3b8" }}>{r.reason || "No reason provided"}</div>
                                </div>
                                <span style={{ background: `${statusColor(r.status)}20`, color: statusColor(r.status), padding: "4px 12px", borderRadius: "20px", fontSize: "0.72rem", fontWeight: "800" }}>{r.status}</span>
                            </div>
                        ))
                    )}
                </div>

                <div style={{ textAlign: "center", color: "#334155", fontSize: "0.75rem", fontWeight: "600", letterSpacing: "0.05em", textTransform: "uppercase", marginTop: "40px" }}>
                    Swastik Medicare SOP v1.0 — Chapter 14: Returns & Refunds
                </div>
            </main>
        </div>
    );
}
