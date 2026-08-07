"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const URGENCY_OPTIONS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const UNIT_OPTIONS = ["units", "strips", "bottles", "boxes", "kg", "liters", "packets", "vials", "ampules"];

const urgencyColors = {
    LOW: { bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.3)", text: "#10B981" },
    MEDIUM: { bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.3)", text: "#F59E0B" },
    HIGH: { bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.3)", text: "#EF4444" },
    CRITICAL: { bg: "rgba(220,38,38,0.15)", border: "rgba(220,38,38,0.5)", text: "#DC2626" },
};

export default function PurchaseRequisitionPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [form, setForm] = useState({ itemName: "", quantity: "", unit: "units", urgency: "MEDIUM", supplier: "", estimatedCost: "", notes: "", requestedBy: "" });
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState(null);
    const [requisitions, setRequisitions] = useState([]);
    const [loadingList, setLoadingList] = useState(true);
    const [activeTab, setActiveTab] = useState("new"); // "new" | "history"

    useEffect(() => {
        if (status === "unauthenticated") router.push("/admin/login");
        if (session?.user?.name) setForm(f => ({ ...f, requestedBy: session.user.name }));
    }, [status, session]);

    useEffect(() => {
        if (activeTab === "history") fetchRequisitions();
    }, [activeTab]);

    const fetchRequisitions = async () => {
        setLoadingList(true);
        const res = await fetch("/api/admin/sop/purchase-requisition").catch(() => null);
        if (res?.ok) {
            const data = await res.json();
            setRequisitions(data.requisitions || []);
        }
        setLoadingList(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        setSuccess(null);
        try {
            const res = await fetch("/api/admin/sop/purchase-requisition", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (data.success) {
                setSuccess(`✅ Requisition ${data.requisition.id} submitted! WhatsApp alert sent to admin.`);
                setForm({ itemName: "", quantity: "", unit: "units", urgency: "MEDIUM", supplier: "", estimatedCost: "", notes: "", requestedBy: session?.user?.name || "" });
            } else {
                setError(data.error || "Submission failed");
            }
        } catch (err) {
            setError("Network error. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const updateStatus = async (id, newStatus) => {
        await fetch("/api/admin/sop/purchase-requisition", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, status: newStatus }),
        });
        fetchRequisitions();
    };

    const inputStyle = { width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px", padding: "12px 16px", color: "white", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" };
    const labelStyle = { display: "block", fontSize: "0.75rem", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" };

    return (
        <div style={{ minHeight: "100vh", background: "radial-gradient(circle at top left, #1e1b4b, #090d16)", padding: "40px 20px 60px", fontFamily: "'Inter', sans-serif", color: "#f8fafc" }}>
            <main style={{ maxWidth: "900px", margin: "0 auto" }}>
                <Link href="/admin/sop" style={{ color: "#94a3b8", textDecoration: "none", fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "24px" }}>← Back to SOP Hub</Link>

                <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px" }}>
                    <div style={{ width: "52px", height: "52px", background: "linear-gradient(135deg, #6366f1, #4f46e5)", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem" }}>📋</div>
                    <div>
                        <div style={{ color: "#818cf8", fontSize: "0.7rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.1em" }}>FORM 03</div>
                        <h1 style={{ margin: 0, fontSize: "1.8rem", fontWeight: "800", color: "white" }}>Purchase Requisition</h1>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ display: "flex", gap: "4px", background: "rgba(255,255,255,0.04)", borderRadius: "12px", padding: "4px", marginBottom: "28px", width: "fit-content" }}>
                    {[["new", "New Request"], ["history", "History & Status"]].map(([key, label]) => (
                        <button key={key} onClick={() => setActiveTab(key)} style={{ padding: "8px 20px", borderRadius: "9px", border: "none", cursor: "pointer", fontWeight: "700", fontSize: "0.85rem", background: activeTab === key ? "white" : "transparent", color: activeTab === key ? "#1e1b4b" : "#94a3b8", transition: "all 0.2s" }}>
                            {label}
                        </button>
                    ))}
                </div>

                {activeTab === "new" ? (
                    <div style={{ background: "rgba(15,23,42,0.6)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "24px", padding: "32px", backdropFilter: "blur(20px)" }}>
                        {success && <div style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: "12px", padding: "16px", marginBottom: "24px", color: "#34d399", fontWeight: "600" }}>{success}</div>}
                        {error && <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "12px", padding: "16px", marginBottom: "24px", color: "#f87171", fontWeight: "600" }}>{error}</div>}

                        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                                <div style={{ gridColumn: "1 / -1" }}>
                                    <label style={labelStyle}>Item / Medicine Name *</label>
                                    <input style={inputStyle} value={form.itemName} onChange={e => setForm(f => ({ ...f, itemName: e.target.value }))} placeholder="e.g. Paracetamol 500mg, Surgical Gloves M" required />
                                </div>
                                <div>
                                    <label style={labelStyle}>Quantity *</label>
                                    <input type="number" min="1" style={inputStyle} value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} placeholder="e.g. 100" required />
                                </div>
                                <div>
                                    <label style={labelStyle}>Unit</label>
                                    <select style={inputStyle} value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}>
                                        {UNIT_OPTIONS.map(u => <option key={u} value={u}>{u}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={labelStyle}>Urgency Level *</label>
                                    <select style={{ ...inputStyle, color: urgencyColors[form.urgency]?.text }} value={form.urgency} onChange={e => setForm(f => ({ ...f, urgency: e.target.value }))}>
                                        {URGENCY_OPTIONS.map(u => <option key={u} value={u}>{u}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={labelStyle}>Estimated Cost (₹)</label>
                                    <input type="number" min="0" style={inputStyle} value={form.estimatedCost} onChange={e => setForm(f => ({ ...f, estimatedCost: e.target.value }))} placeholder="e.g. 5000" />
                                </div>
                                <div style={{ gridColumn: "1 / -1" }}>
                                    <label style={labelStyle}>Preferred Supplier</label>
                                    <input style={inputStyle} value={form.supplier} onChange={e => setForm(f => ({ ...f, supplier: e.target.value }))} placeholder="e.g. MedSupply India, Local Distributor" />
                                </div>
                                <div>
                                    <label style={labelStyle}>Requested By</label>
                                    <input style={inputStyle} value={form.requestedBy} onChange={e => setForm(f => ({ ...f, requestedBy: e.target.value }))} placeholder="Your name / department" />
                                </div>
                                <div style={{ gridColumn: "1 / -1" }}>
                                    <label style={labelStyle}>Notes / Reason</label>
                                    <textarea rows={3} style={{ ...inputStyle, resize: "vertical" }} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Why is this needed? Any special instructions?" />
                                </div>
                            </div>
                            <button type="submit" disabled={submitting} style={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)", color: "white", border: "none", padding: "16px", borderRadius: "14px", fontWeight: "800", fontSize: "1rem", cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.7 : 1, transition: "all 0.2s" }}>
                                {submitting ? "⏳ Submitting & Sending Alert..." : "📋 Submit Requisition + Send WhatsApp Alert"}
                            </button>
                        </form>
                    </div>
                ) : (
                    <div style={{ background: "rgba(15,23,42,0.6)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "24px", padding: "24px", backdropFilter: "blur(20px)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                            <h2 style={{ margin: 0, fontWeight: "800", fontSize: "1rem", color: "#e2e8f0" }}>All Requisitions ({requisitions.length})</h2>
                            <button onClick={fetchRequisitions} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "white", padding: "8px 16px", cursor: "pointer", fontSize: "0.8rem", fontWeight: "700" }}>🔄 Refresh</button>
                        </div>
                        {loadingList ? <div style={{ textAlign: "center", color: "#64748b", padding: "40px" }}>Loading...</div> : requisitions.length === 0 ? (
                            <div style={{ textAlign: "center", color: "#64748b", padding: "40px" }}>No requisitions found.</div>
                        ) : requisitions.map(req => {
                            const uc = urgencyColors[req.urgency] || urgencyColors.MEDIUM;
                            return (
                                <div key={req.id} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "20px", marginBottom: "12px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                                                <span style={{ background: uc.bg, border: `1px solid ${uc.border}`, color: uc.text, padding: "2px 10px", borderRadius: "20px", fontSize: "0.7rem", fontWeight: "800", textTransform: "uppercase" }}>{req.urgency}</span>
                                                <span style={{ color: "#64748b", fontSize: "0.75rem", fontFamily: "monospace" }}>{req.id}</span>
                                            </div>
                                            <div style={{ fontWeight: "700", fontSize: "1rem", color: "white", marginBottom: "4px" }}>{req.itemName}</div>
                                            <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>{req.quantity} {req.unit} · Est. ₹{req.estimatedCost || "TBD"} · {req.supplier} · by {req.requestedBy}</div>
                                            {req.notes && <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "6px", fontStyle: "italic" }}>"{req.notes}"</div>}
                                            <div style={{ fontSize: "0.7rem", color: "#475569", marginTop: "6px" }}>{new Date(req.createdAt).toLocaleString("en-IN")}</div>
                                        </div>
                                        <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                                            {["PENDING", "APPROVED", "ORDERED", "RECEIVED"].filter(s => s !== req.status).slice(0, 2).map(s => (
                                                <button key={s} onClick={() => updateStatus(req.id, s)} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "white", padding: "6px 12px", cursor: "pointer", fontSize: "0.7rem", fontWeight: "700" }}>
                                                    → {s}
                                                </button>
                                            ))}
                                            <span style={{ background: req.status === "APPROVED" ? "rgba(16,185,129,0.15)" : req.status === "RECEIVED" ? "rgba(16,185,129,0.25)" : req.status === "ORDERED" ? "rgba(99,102,241,0.15)" : "rgba(245,158,11,0.15)", border: "1px solid rgba(255,255,255,0.1)", color: req.status === "PENDING" ? "#F59E0B" : "#34d399", padding: "6px 14px", borderRadius: "8px", fontSize: "0.7rem", fontWeight: "800" }}>
                                                {req.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
