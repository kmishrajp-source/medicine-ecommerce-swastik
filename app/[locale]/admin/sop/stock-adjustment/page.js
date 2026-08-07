"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const ADJUSTMENT_REASONS = [
    "Damaged Goods", "Expiry Removal", "Customer Return", "Counting Error",
    "Theft/Loss", "Quality Rejection", "Sample Distribution", "Transfer to Branch", "Other"
];

export default function StockAdjustmentPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [products, setProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(true);
    const [form, setForm] = useState({ productId: "", adjustmentType: "DECREASE", quantity: "", reason: "Damaged Goods", notes: "", buyingPrice: "" });
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);
    const [searchProd, setSearchProd] = useState("");

    useEffect(() => {
        if (status === "unauthenticated") router.push("/admin/login");
    }, [status, router]);

    useEffect(() => {
        fetch("/api/products?limit=200")
            .then(r => r.json())
            .then(d => { if (d.success) setProducts(d.products || []); })
            .catch(() => {})
            .finally(() => setLoadingProducts(false));
    }, []);

    const filteredProducts = products.filter(p =>
        (p.name || "").toLowerCase().includes(searchProd.toLowerCase())
    );

    const selectedProduct = products.find(p => p.id === form.productId);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.productId || !form.quantity) return;
        setSubmitting(true);
        setResult(null);

        const qty = parseInt(form.quantity);
        const adjustedQty = form.adjustmentType === "DECREASE" ? -Math.abs(qty) : Math.abs(qty);

        try {
            const res = await fetch("/api/admin/stock", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    productId: form.productId,
                    quantity: adjustedQty,
                    buyingPrice: form.buyingPrice || 0,
                    notes: `[${form.reason}] ${form.notes}`,
                    type: "ADJUSTMENT"
                }),
            });
            const data = await res.json();
            if (data.success) {
                setResult({ type: "success", message: `✅ Stock adjusted! New stock: ${data.product.stock} units for "${data.product.name}"` });
                setForm(f => ({ ...f, productId: "", quantity: "", notes: "" }));
                setSearchProd("");
            } else {
                setResult({ type: "error", message: `❌ ${data.error || "Failed to adjust stock"}` });
            }
        } catch (err) {
            setResult({ type: "error", message: "❌ Network error. Please try again." });
        } finally {
            setSubmitting(false);
        }
    };

    const inputStyle = { width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "10px", padding: "12px 16px", color: "white", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" };
    const labelStyle = { display: "block", fontSize: "0.75rem", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" };

    return (
        <div style={{ minHeight: "100vh", background: "radial-gradient(circle at top left, #1c1917, #090d16)", padding: "40px 20px 60px", fontFamily: "'Inter', sans-serif", color: "#f8fafc" }}>
            <main style={{ maxWidth: "800px", margin: "0 auto" }}>
                <Link href="/admin/sop" style={{ color: "#94a3b8", textDecoration: "none", fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "24px" }}>← Back to SOP Hub</Link>

                <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px" }}>
                    <div style={{ width: "52px", height: "52px", background: "linear-gradient(135deg, #F59E0B, #D97706)", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem" }}>⚖️</div>
                    <div>
                        <div style={{ color: "#FCD34D", fontSize: "0.7rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.1em" }}>FORM 06</div>
                        <h1 style={{ margin: 0, fontSize: "1.8rem", fontWeight: "800", color: "white" }}>Stock Adjustment Form</h1>
                        <p style={{ margin: "4px 0 0", color: "#94a3b8", fontSize: "0.85rem" }}>For damage, expiry, loss, counting errors, or returns</p>
                    </div>
                </div>

                <div style={{ background: "rgba(15,23,42,0.6)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "24px", padding: "32px", backdropFilter: "blur(20px)" }}>
                    {result && (
                        <div style={{ background: result.type === "success" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", border: `1px solid ${result.type === "success" ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`, borderRadius: "12px", padding: "16px", marginBottom: "24px", color: result.type === "success" ? "#34d399" : "#f87171", fontWeight: "600" }}>
                            {result.message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                        {/* Product Search */}
                        <div>
                            <label style={labelStyle}>Search & Select Product *</label>
                            <input style={{ ...inputStyle, marginBottom: "8px" }} placeholder="Type medicine name..." value={searchProd} onChange={e => { setSearchProd(e.target.value); setForm(f => ({ ...f, productId: "" })); }} />
                            {searchProd && !form.productId && (
                                <div style={{ background: "rgba(15,23,42,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", maxHeight: "200px", overflowY: "auto" }}>
                                    {loadingProducts ? <div style={{ padding: "12px", color: "#64748b", textAlign: "center" }}>Loading...</div> :
                                        filteredProducts.length === 0 ? <div style={{ padding: "12px", color: "#64748b", textAlign: "center" }}>No products found</div> :
                                        filteredProducts.slice(0, 10).map(p => (
                                            <div key={p.id} onClick={() => { setForm(f => ({ ...f, productId: p.id })); setSearchProd(p.name); }} style={{ padding: "12px 16px", cursor: "pointer", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", justifyContent: "space-between" }}
                                                onMouseOver={e => e.currentTarget.style.background = "rgba(245,158,11,0.1)"}
                                                onMouseOut={e => e.currentTarget.style.background = "transparent"}>
                                                <span style={{ fontWeight: "600", color: "white" }}>{p.name}</span>
                                                <span style={{ color: p.stock <= 5 ? "#EF4444" : p.stock <= 20 ? "#F59E0B" : "#94a3b8", fontSize: "0.8rem" }}>Stock: {p.stock}</span>
                                            </div>
                                        ))
                                    }
                                </div>
                            )}
                        </div>

                        {selectedProduct && (
                            <div style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "12px", padding: "14px 18px" }}>
                                <div style={{ fontWeight: "700", color: "#FCD34D" }}>{selectedProduct.name}</div>
                                <div style={{ color: "#94a3b8", fontSize: "0.8rem", marginTop: "4px" }}>Current Stock: <strong style={{ color: selectedProduct.stock <= 5 ? "#EF4444" : "#34d399" }}>{selectedProduct.stock} units</strong> · MRP: ₹{selectedProduct.price}</div>
                            </div>
                        )}

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                            <div>
                                <label style={labelStyle}>Adjustment Type *</label>
                                <div style={{ display: "flex", gap: "8px" }}>
                                    {["INCREASE", "DECREASE"].map(t => (
                                        <button key={t} type="button" onClick={() => setForm(f => ({ ...f, adjustmentType: t }))} style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "none", cursor: "pointer", fontWeight: "800", fontSize: "0.85rem", background: form.adjustmentType === t ? (t === "INCREASE" ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.25)") : "rgba(255,255,255,0.04)", color: form.adjustmentType === t ? (t === "INCREASE" ? "#34d399" : "#f87171") : "#64748b", outline: form.adjustmentType === t ? `2px solid ${t === "INCREASE" ? "#10B981" : "#EF4444"}` : "none" }}>
                                            {t === "INCREASE" ? "📈 Add Stock" : "📉 Remove Stock"}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label style={labelStyle}>Quantity *</label>
                                <input type="number" min="1" style={inputStyle} value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} placeholder="How many units?" required />
                            </div>
                            <div style={{ gridColumn: "1 / -1" }}>
                                <label style={labelStyle}>Reason *</label>
                                <select style={inputStyle} value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}>
                                    {ADJUSTMENT_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>Buying Price (₹) — if restocking</label>
                                <input type="number" min="0" style={inputStyle} value={form.buyingPrice} onChange={e => setForm(f => ({ ...f, buyingPrice: e.target.value }))} placeholder="Leave blank if removing stock" />
                            </div>
                            <div style={{ gridColumn: "1 / -1" }}>
                                <label style={labelStyle}>Additional Notes</label>
                                <textarea rows={3} style={{ ...inputStyle, resize: "vertical" }} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Batch number, invoice number, or any other detail..." />
                            </div>
                        </div>

                        <button type="submit" disabled={submitting || !form.productId} style={{ background: "linear-gradient(135deg, #F59E0B, #D97706)", color: "white", border: "none", padding: "16px", borderRadius: "14px", fontWeight: "800", fontSize: "1rem", cursor: (submitting || !form.productId) ? "not-allowed" : "pointer", opacity: (submitting || !form.productId) ? 0.6 : 1 }}>
                            {submitting ? "⏳ Processing..." : "⚖️ Submit Stock Adjustment"}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}
