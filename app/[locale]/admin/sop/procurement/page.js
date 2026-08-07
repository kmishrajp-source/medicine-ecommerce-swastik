"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function ProcurementDashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [kpis, setKpis] = useState(null);
    const [data, setData] = useState({ requisitions: [], pos: [], grns: [] });
    const [loading, setLoading] = useState(true);

    const [rfqForm, setRfqForm] = useState(null); // Selected req for quoting
    const [quoteData, setQuoteData] = useState({ vendorName: "", quoteAmount: "", leadTimeDays: "", notes: "" });

    useEffect(() => {
        if (status === "unauthenticated") router.push("/admin/login");
    }, [status, router]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [kpiRes, dataRes] = await Promise.all([
                fetch("/api/admin/sop/procurement/kpi").then(r => r.json()),
                fetch("/api/admin/sop/procurement").then(r => r.json())
            ]);
            if (kpiRes.success) setKpis(kpiRes.kpis);
            if (dataRes.success) setData(dataRes.data);
        } catch (e) {}
        setLoading(false);
    };

    useEffect(() => { fetchData(); }, []);

    const submitQuote = async (e) => {
        e.preventDefault();
        await fetch("/api/admin/sop/procurement", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "ADD_QUOTE", reqId: rfqForm.id, ...quoteData })
        });
        setRfqForm(null);
        setQuoteData({ vendorName: "", quoteAmount: "", leadTimeDays: "", notes: "" });
        fetchData();
    };

    const statCard = (icon, label, value, color) => (
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "20px", textAlign: "center" }}>
            <div style={{ fontSize: "1.5rem", marginBottom: "8px" }}>{icon}</div>
            <div style={{ fontSize: "1.6rem", fontWeight: "800", color }}>{value}</div>
            <div style={{ fontSize: "0.7rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginTop: "4px" }}>{label}</div>
        </div>
    );

    return (
        <div style={{ minHeight: "100vh", background: "radial-gradient(circle at top left, #4c1d95, #090d16, #1e1b4b)", padding: "40px 20px 60px", fontFamily: "'Inter', sans-serif", color: "#f8fafc" }}>
            <main style={{ maxWidth: "1200px", margin: "0 auto" }}>
                <Link href="/admin/sop" style={{ color: "#94a3b8", textDecoration: "none", fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "24px" }}>← Back to SOP Hub</Link>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px", marginBottom: "32px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <div style={{ width: "52px", height: "52px", background: "linear-gradient(135deg, #8b5cf6, #6d28d9)", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem" }}>🛒</div>
                        <div>
                            <div style={{ color: "#c4b5fd", fontSize: "0.7rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.1em" }}>CHAPTER 8</div>
                            <h1 style={{ margin: 0, fontSize: "1.8rem", fontWeight: "800", color: "white" }}>Procurement Operations</h1>
                            <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: "0.85rem" }}>RFQs, Purchase Orders & Goods Receipts</p>
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: "10px" }}>
                        <Link href="/admin/sop/procurement/po" style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", color: "#818cf8", padding: "10px 20px", borderRadius: "10px", textDecoration: "none", fontWeight: "800", fontSize: "0.85rem" }}>📝 Generate PO</Link>
                        <Link href="/admin/sop/procurement/grn" style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", color: "#34d399", padding: "10px 20px", borderRadius: "10px", textDecoration: "none", fontWeight: "800", fontSize: "0.85rem" }}>🚚 Log GRN</Link>
                    </div>
                </div>

                {/* Procurement KPIs */}
                <h2 style={{ color: "#e2e8f0", fontSize: "1rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "16px" }}>📈 Procurement KPIs</h2>
                {kpis ? (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px", marginBottom: "40px" }}>
                        {statCard("📦", "Stock Availability", `${kpis.availabilityPercent}%`, parseFloat(kpis.availabilityPercent) < 90 ? "#EF4444" : "#10B981")}
                        {statCard("⏱️", "Avg Lead Time", `${kpis.avgLeadTimeDays} Days`, kpis.avgLeadTimeDays > 5 ? "#F59E0B" : "#10B981")}
                        {statCard("💰", "Procurement Savings", `₹${kpis.procurementSavings.toLocaleString("en-IN")}`, kpis.procurementSavings < 0 ? "#EF4444" : "#10B981")}
                        {statCard("💳", "Total Spent (POs)", `₹${kpis.totalSpent.toLocaleString("en-IN")}`, "#6366f1")}
                    </div>
                ) : <div style={{ color: "#64748b", marginBottom: "40px" }}>Loading KPIs...</div>}

                {/* RFQ & Requisitions Section */}
                <h2 style={{ color: "#e2e8f0", fontSize: "1rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "16px" }}>📋 Requisitions & Quotations (RFQ)</h2>
                <div style={{ background: "rgba(15,23,42,0.6)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "24px", padding: "24px", backdropFilter: "blur(20px)" }}>
                    {loading ? <div style={{ color: "#64748b", textAlign: "center", padding: "40px" }}>Loading data...</div> :
                        data.requisitions.filter(r => r.status === "PENDING" || r.status === "QUOTED").length === 0 ? 
                        <div style={{ color: "#64748b", textAlign: "center", padding: "40px" }}>No open requisitions requiring action.</div> :
                        data.requisitions.filter(r => r.status === "PENDING" || r.status === "QUOTED").map(req => (
                            <div key={req.id} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "20px", marginBottom: "16px" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ color: "#818cf8", fontSize: "0.75rem", fontWeight: "800", marginBottom: "4px" }}>{req.id} · Urgency: {req.urgency}</div>
                                        <div style={{ fontWeight: "700", color: "white", fontSize: "1.1rem" }}>{req.itemName}</div>
                                        <div style={{ color: "#94a3b8", fontSize: "0.85rem", marginTop: "4px" }}>Request: {req.quantity} {req.unit} · Est Budget: ₹{req.estimatedCost}</div>
                                    </div>
                                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                                        <span style={{ background: req.status === "QUOTED" ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)", color: req.status === "QUOTED" ? "#34d399" : "#fbbf24", padding: "6px 14px", borderRadius: "8px", fontSize: "0.75rem", fontWeight: "800" }}>{req.status}</span>
                                        <button onClick={() => setRfqForm(req)} style={{ background: "rgba(255,255,255,0.08)", border: "none", color: "white", padding: "8px 16px", borderRadius: "8px", fontWeight: "700", fontSize: "0.8rem", cursor: "pointer" }}>+ Log Quote</button>
                                        <Link href={`/admin/sop/procurement/po?reqId=${req.id}`} style={{ background: "rgba(99,102,241,0.2)", color: "#818cf8", padding: "8px 16px", borderRadius: "8px", fontWeight: "700", fontSize: "0.8rem", cursor: "pointer", textDecoration: "none" }}>Generate PO →</Link>
                                    </div>
                                </div>

                                {/* Quotes List */}
                                {req.quotes && req.quotes.length > 0 && (
                                    <div style={{ marginTop: "16px", background: "rgba(0,0,0,0.2)", borderRadius: "12px", padding: "16px" }}>
                                        <div style={{ color: "#94a3b8", fontSize: "0.75rem", fontWeight: "800", textTransform: "uppercase", marginBottom: "10px" }}>Vendor Quotations</div>
                                        <div style={{ display: "grid", gap: "8px" }}>
                                            {req.quotes.map((q, i) => (
                                                <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "12px", fontSize: "0.85rem", padding: "8px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                                    <div style={{ color: "white", fontWeight: "600" }}>{q.vendorName}</div>
                                                    <div style={{ color: "#34d399", fontWeight: "700" }}>₹{q.quoteAmount}</div>
                                                    <div style={{ color: "#94a3b8" }}>Lead Time: {q.leadTimeDays} days</div>
                                                    <div style={{ color: "#64748b", fontSize: "0.75rem" }}>{q.notes}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    }
                </div>

                {/* RFQ Form Modal */}
                {rfqForm && (
                    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(5px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
                        <div style={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "24px", padding: "32px", width: "100%", maxWidth: "500px" }}>
                            <h3 style={{ margin: "0 0 20px", color: "white" }}>Log Vendor Quote</h3>
                            <div style={{ color: "#818cf8", fontSize: "0.8rem", marginBottom: "16px" }}>For: {rfqForm.itemName} (Qty: {rfqForm.quantity})</div>
                            
                            <form onSubmit={submitQuote} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                <div>
                                    <label style={{ display: "block", fontSize: "0.75rem", color: "#94a3b8", marginBottom: "6px" }}>Vendor Name *</label>
                                    <input required value={quoteData.vendorName} onChange={e => setQuoteData({...quoteData, vendorName: e.target.value})} style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "10px", color: "white" }} />
                                </div>
                                <div style={{ display: "flex", gap: "16px" }}>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: "block", fontSize: "0.75rem", color: "#94a3b8", marginBottom: "6px" }}>Quote Amount (₹) *</label>
                                        <input required type="number" value={quoteData.quoteAmount} onChange={e => setQuoteData({...quoteData, quoteAmount: e.target.value})} style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "10px", color: "white" }} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: "block", fontSize: "0.75rem", color: "#94a3b8", marginBottom: "6px" }}>Lead Time (Days) *</label>
                                        <input required type="number" value={quoteData.leadTimeDays} onChange={e => setQuoteData({...quoteData, leadTimeDays: e.target.value})} style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "10px", color: "white" }} />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: "block", fontSize: "0.75rem", color: "#94a3b8", marginBottom: "6px" }}>Notes</label>
                                    <input value={quoteData.notes} onChange={e => setQuoteData({...quoteData, notes: e.target.value})} style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "10px", color: "white" }} />
                                </div>
                                <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
                                    <button type="button" onClick={() => setRfqForm(null)} style={{ flex: 1, padding: "12px", background: "rgba(255,255,255,0.05)", border: "none", color: "white", borderRadius: "10px", cursor: "pointer" }}>Cancel</button>
                                    <button type="submit" style={{ flex: 1, padding: "12px", background: "#8b5cf6", border: "none", color: "white", borderRadius: "10px", fontWeight: "800", cursor: "pointer" }}>Save Quote</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
