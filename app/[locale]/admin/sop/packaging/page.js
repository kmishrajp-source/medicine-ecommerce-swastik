"use client";
import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const CHECKLIST_ITEMS = [
    { id: "medicine", icon: "💊", label: "Correct Medicine", desc: "Name matches prescription/order" },
    { id: "quantity", icon: "🔢", label: "Correct Quantity", desc: "Count verified against packing slip" },
    { id: "batch", icon: "🏷️", label: "Batch Verified", desc: "Batch number matches GRN record" },
    { id: "expiry", icon: "📅", label: "Expiry Checked", desc: "Min 6 months remaining" },
    { id: "invoice", icon: "🧾", label: "Invoice Attached", desc: "GST invoice inside parcel" },
    { id: "seal", icon: "🔒", label: "Tamper-Proof Seal", desc: "Seal applied and intact" },
];

export default function PackagingSOPPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [checked, setChecked] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [orderId, setOrderId] = useState("");

    useEffect(() => {
        if (status === "unauthenticated") router.push("/admin/login");
    }, [status, router]);

    const toggle = (id) => setChecked(prev => ({ ...prev, [id]: !prev[id] }));
    const allChecked = CHECKLIST_ITEMS.every(item => checked[item.id]);
    const checkedCount = Object.values(checked).filter(Boolean).length;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!allChecked || !orderId) return;
        await fetch("/api/admin/sop/packaging", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId, checklist: checked, packedBy: session?.user?.name || session?.user?.email })
        });
        setSubmitted(true);
        setTimeout(() => { setSubmitted(false); setChecked({}); setOrderId(""); }, 3000);
    };

    return (
        <div style={{ minHeight: "100vh", background: "radial-gradient(circle at top left, #0c4a6e, #090d16, #0a0a0a)", padding: "40px 20px 60px", fontFamily: "'Inter', sans-serif", color: "#f8fafc" }}>
            <main style={{ maxWidth: "900px", margin: "0 auto" }}>
                <Link href="/admin/sop" style={{ color: "#94a3b8", textDecoration: "none", fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "24px" }}>← Back to SOP Hub</Link>

                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px" }}>
                    <div style={{ width: "56px", height: "56px", background: "linear-gradient(135deg, #0ea5e9, #0284c7)", borderRadius: "18px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem" }}>📦</div>
                    <div>
                        <div style={{ color: "#38bdf8", fontSize: "0.7rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.12em" }}>CHAPTER 12</div>
                        <h1 style={{ margin: 0, fontSize: "1.9rem", fontWeight: "800", color: "white" }}>Packaging SOP</h1>
                        <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: "0.85rem" }}>Pre-dispatch packing checklist — Zero error standard</p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "20px", marginBottom: "32px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                        <span style={{ fontWeight: "700", color: "white" }}>Checklist Progress</span>
                        <span style={{ fontWeight: "800", color: allChecked ? "#10B981" : "#F59E0B", fontSize: "1.1rem" }}>{checkedCount}/{CHECKLIST_ITEMS.length}</span>
                    </div>
                    <div style={{ height: "8px", background: "rgba(255,255,255,0.08)", borderRadius: "10px", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${(checkedCount / CHECKLIST_ITEMS.length) * 100}%`, background: allChecked ? "linear-gradient(90deg, #10B981, #34d399)" : "linear-gradient(90deg, #F59E0B, #fbbf24)", borderRadius: "10px", transition: "width 0.4s ease" }} />
                    </div>
                </div>

                {/* Packing Form */}
                <form onSubmit={handleSubmit}>
                    <div style={{ background: "rgba(15,23,42,0.7)", border: "1px solid rgba(14,165,233,0.15)", borderRadius: "24px", padding: "28px", marginBottom: "28px", backdropFilter: "blur(20px)" }}>
                        <div style={{ marginBottom: "24px" }}>
                            <label style={{ display: "block", fontSize: "0.75rem", color: "#94a3b8", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>Order ID *</label>
                            <input
                                value={orderId}
                                onChange={e => setOrderId(e.target.value)}
                                placeholder="e.g. ORD-20240626-001"
                                style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px", padding: "12px 14px", color: "white", fontSize: "0.95rem", boxSizing: "border-box" }}
                            />
                        </div>

                        <div style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "16px" }}>Packing Checklist</div>
                        <div style={{ display: "grid", gap: "12px" }}>
                            {CHECKLIST_ITEMS.map(item => (
                                <div
                                    key={item.id}
                                    onClick={() => toggle(item.id)}
                                    style={{ display: "flex", alignItems: "center", gap: "16px", background: checked[item.id] ? "rgba(16,185,129,0.08)" : "rgba(255,255,255,0.02)", border: `1px solid ${checked[item.id] ? "rgba(16,185,129,0.3)" : "rgba(255,255,255,0.06)"}`, borderRadius: "14px", padding: "16px 20px", cursor: "pointer", transition: "all 0.2s" }}
                                    onMouseOver={e => { if (!checked[item.id]) e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                                    onMouseOut={e => { if (!checked[item.id]) e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
                                >
                                    <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: checked[item.id] ? "#10B981" : "rgba(255,255,255,0.08)", border: `2px solid ${checked[item.id] ? "#10B981" : "rgba(255,255,255,0.2)"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.95rem", flexShrink: 0, transition: "all 0.2s" }}>
                                        {checked[item.id] ? "✓" : ""}
                                    </div>
                                    <div style={{ fontSize: "1.5rem", flexShrink: 0 }}>{item.icon}</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: "800", color: checked[item.id] ? "#34d399" : "white", fontSize: "0.95rem" }}>{item.label}</div>
                                        <div style={{ fontSize: "0.78rem", color: "#64748b", marginTop: "2px" }}>{item.desc}</div>
                                    </div>
                                    {checked[item.id] && <div style={{ color: "#10B981", fontWeight: "800", fontSize: "0.8rem" }}>✅ DONE</div>}
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={!allChecked || !orderId || submitted}
                        style={{ width: "100%", padding: "16px", background: submitted ? "#10B981" : (allChecked && orderId ? "linear-gradient(135deg, #0ea5e9, #0284c7)" : "rgba(255,255,255,0.05)"), border: "none", borderRadius: "14px", color: "white", fontWeight: "800", fontSize: "1rem", cursor: allChecked && orderId ? "pointer" : "not-allowed", transition: "all 0.3s" }}
                    >
                        {submitted ? "✅ Packing Record Saved!" : allChecked && orderId ? "✅ Confirm Packing Complete" : `⬆ Complete all ${CHECKLIST_ITEMS.length - checkedCount} remaining items`}
                    </button>
                </form>

                <div style={{ textAlign: "center", color: "#334155", fontSize: "0.75rem", fontWeight: "600", letterSpacing: "0.05em", textTransform: "uppercase", marginTop: "32px" }}>
                    Swastik Medicare SOP v1.0 — Chapter 12: Packaging
                </div>
            </main>
        </div>
    );
}
