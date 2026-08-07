"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function POPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const defaultReqId = searchParams.get("reqId") || "";

    const [reqs, setReqs] = useState([]);
    const [form, setForm] = useState({ reqId: defaultReqId, vendorName: "", finalAmount: "", deliveryDate: "" });
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);

    useEffect(() => {
        if (status === "unauthenticated") router.push("/admin/login");
        fetch("/api/admin/sop/procurement?type=rfqs").then(r => r.json()).then(d => {
            if (d.success) setReqs(d.rfqs);
        });
    }, [status, router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setResult(null);

        const res = await fetch("/api/admin/sop/procurement", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "GENERATE_PO", ...form })
        });
        const data = await res.json();
        
        if (data.success) {
            setResult({ type: "success", message: `✅ Purchase Order ${data.po.id} generated successfully!` });
            setForm({ reqId: "", vendorName: "", finalAmount: "", deliveryDate: "" });
        } else {
            setResult({ type: "error", message: data.error });
        }
        setSubmitting(false);
    };

    const selectedReq = reqs.find(r => r.id === form.reqId);

    // Auto-fill from best quote if exists
    useEffect(() => {
        if (selectedReq && selectedReq.quotes && selectedReq.quotes.length > 0 && !form.vendorName) {
            const bestQuote = [...selectedReq.quotes].sort((a, b) => a.quoteAmount - b.quoteAmount)[0];
            setForm(f => ({ ...f, vendorName: bestQuote.vendorName, finalAmount: bestQuote.quoteAmount }));
        }
    }, [form.reqId, selectedReq]);

    return (
        <div style={{ minHeight: "100vh", background: "radial-gradient(circle at top left, #312e81, #090d16)", padding: "40px 20px 60px", fontFamily: "'Inter', sans-serif", color: "#f8fafc" }}>
            <main style={{ maxWidth: "700px", margin: "0 auto" }}>
                <Link href="/admin/sop/procurement" style={{ color: "#94a3b8", textDecoration: "none", fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "24px" }}>← Back to Procurement</Link>

                <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px" }}>
                    <div style={{ width: "52px", height: "52px", background: "linear-gradient(135deg, #6366f1, #4f46e5)", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem" }}>📝</div>
                    <div>
                        <div style={{ color: "#818cf8", fontSize: "0.7rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.1em" }}>FORM 04</div>
                        <h1 style={{ margin: 0, fontSize: "1.8rem", fontWeight: "800", color: "white" }}>Generate Purchase Order</h1>
                    </div>
                </div>

                <div style={{ background: "rgba(15,23,42,0.6)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "24px", padding: "32px", backdropFilter: "blur(20px)" }}>
                    {result && <div style={{ background: result.type === "success" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", color: result.type === "success" ? "#34d399" : "#f87171", padding: "16px", borderRadius: "12px", marginBottom: "24px" }}>{result.message}</div>}

                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                        <div>
                            <label style={{ display: "block", fontSize: "0.75rem", color: "#94a3b8", marginBottom: "6px", fontWeight: "700", textTransform: "uppercase" }}>Link to Requisition *</label>
                            <select required value={form.reqId} onChange={e => setForm({...form, reqId: e.target.value})} style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "12px", color: "white" }}>
                                <option value="">Select an approved Requisition...</option>
                                {reqs.map(r => <option key={r.id} value={r.id}>{r.id} - {r.itemName} ({r.quantity} {r.unit})</option>)}
                            </select>
                        </div>

                        {selectedReq && (
                            <div style={{ background: "rgba(99,102,241,0.05)", border: "1px solid rgba(99,102,241,0.2)", padding: "16px", borderRadius: "12px" }}>
                                <div style={{ color: "#818cf8", fontWeight: "700" }}>{selectedReq.itemName}</div>
                                <div style={{ color: "#94a3b8", fontSize: "0.85rem", marginTop: "4px" }}>Ordering {selectedReq.quantity} {selectedReq.unit}. Original Est. Budget: ₹{selectedReq.estimatedCost}</div>
                            </div>
                        )}

                        <div>
                            <label style={{ display: "block", fontSize: "0.75rem", color: "#94a3b8", marginBottom: "6px", fontWeight: "700", textTransform: "uppercase" }}>Selected Vendor *</label>
                            <input required value={form.vendorName} onChange={e => setForm({...form, vendorName: e.target.value})} style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "12px", color: "white" }} />
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                            <div>
                                <label style={{ display: "block", fontSize: "0.75rem", color: "#94a3b8", marginBottom: "6px", fontWeight: "700", textTransform: "uppercase" }}>Final Negotiated Amount (₹) *</label>
                                <input required type="number" value={form.finalAmount} onChange={e => setForm({...form, finalAmount: e.target.value})} style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "12px", color: "white" }} />
                            </div>
                            <div>
                                <label style={{ display: "block", fontSize: "0.75rem", color: "#94a3b8", marginBottom: "6px", fontWeight: "700", textTransform: "uppercase" }}>Expected Delivery Date *</label>
                                <input required type="date" value={form.deliveryDate} onChange={e => setForm({...form, deliveryDate: e.target.value})} style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "12px", color: "white", colorScheme: "dark" }} />
                            </div>
                        </div>

                        <button type="submit" disabled={submitting || !form.reqId} style={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)", color: "white", border: "none", padding: "16px", borderRadius: "12px", fontWeight: "800", cursor: (submitting||!form.reqId)?"not-allowed":"pointer", marginTop: "10px", opacity: (submitting||!form.reqId)?0.5:1 }}>
                            {submitting ? "Processing..." : "Generate Purchase Order (Form 04)"}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}
