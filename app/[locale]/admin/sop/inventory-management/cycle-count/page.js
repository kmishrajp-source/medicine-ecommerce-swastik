"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function CycleCountPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [abcData, setAbcData] = useState(null);
    const [type, setType] = useState("DAILY"); // DAILY, WEEKLY, MONTHLY
    const [countList, setCountList] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);

    useEffect(() => {
        if (status === "unauthenticated") router.push("/admin/login");
    }, [status, router]);

    useEffect(() => {
        fetch("/api/admin/sop/inventory/abc-analysis").then(r => r.json()).then(d => {
            if (d.success) {
                setAbcData(d.products);
                generateList(d.products, "DAILY");
            }
        }).catch(() => {});
    }, []);

    const generateList = (products, selectedType) => {
        setType(selectedType);
        let targetClass = "A"; // Daily counts focus on fast-moving A class
        if (selectedType === "WEEKLY") targetClass = "B"; // Weekly on B class
        if (selectedType === "MONTHLY") targetClass = "ALL"; // Monthly on everything

        let filtered = products;
        if (targetClass !== "ALL") {
            filtered = products.filter(p => p.abcClass === targetClass);
            // Randomly select up to 10 items for Daily, 20 for Weekly to make cycle counts manageable
            filtered = filtered.sort(() => 0.5 - Math.random()).slice(0, selectedType === "DAILY" ? 10 : 20);
        }

        const initialList = filtered.map(p => ({
            productId: p.id,
            name: p.name,
            systemStock: p.stock,
            physicalCount: "", // blank initially
            variance: 0
        }));
        setCountList(initialList);
        setResult(null);
    };

    const handleCountChange = (productId, value) => {
        setCountList(prev => prev.map(item => {
            if (item.productId === productId) {
                const physicalCount = value === "" ? "" : parseInt(value) || 0;
                const variance = physicalCount === "" ? 0 : physicalCount - item.systemStock;
                return { ...item, physicalCount, variance };
            }
            return item;
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setResult(null);

        // Only submit items where physical count was entered
        const completedCounts = countList.filter(c => c.physicalCount !== "");

        try {
            const res = await fetch("/api/admin/sop/inventory/cycle-count", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type,
                    counts: completedCounts,
                    notes: `Routine ${type} cycle count.`
                })
            });

            const data = await res.json();
            if (data.success) {
                setResult({ type: "success", message: `✅ Cycle count recorded! Found ${data.cycleCount.variancesFound} discrepancies out of ${data.cycleCount.itemsCounted} items. Stock adjusted automatically.` });
                // Remove counted items from list
                setCountList(prev => prev.filter(c => c.physicalCount === ""));
            } else {
                setResult({ type: "error", message: data.error });
            }
        } catch (err) {
            setResult({ type: "error", message: "Network error" });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{ minHeight: "100vh", background: "radial-gradient(circle at top left, #064e3b, #090d16)", padding: "40px 20px 60px", fontFamily: "'Inter', sans-serif", color: "#f8fafc" }}>
            <main style={{ maxWidth: "800px", margin: "0 auto" }}>
                <Link href="/admin/sop/inventory-management" style={{ color: "#94a3b8", textDecoration: "none", fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "24px" }}>← Back to Inventory Dashboard</Link>

                <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px" }}>
                    <div style={{ width: "52px", height: "52px", background: "linear-gradient(135deg, #10B981, #059669)", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem" }}>⏱️</div>
                    <div>
                        <div style={{ color: "#34d399", fontSize: "0.7rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.1em" }}>CHAPTER 9</div>
                        <h1 style={{ margin: 0, fontSize: "1.8rem", fontWeight: "800", color: "white" }}>Cycle Count Checklist</h1>
                    </div>
                </div>

                <div style={{ display: "flex", gap: "8px", marginBottom: "24px", background: "rgba(255,255,255,0.05)", padding: "4px", borderRadius: "12px", width: "fit-content" }}>
                    {["DAILY", "WEEKLY", "MONTHLY"].map(t => (
                        <button key={t} onClick={() => generateList(abcData, t)} style={{ padding: "8px 20px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "700", fontSize: "0.85rem", background: type === t ? "#10B981" : "transparent", color: type === t ? "white" : "#94a3b8" }}>
                            {t}
                        </button>
                    ))}
                </div>

                <div style={{ background: "rgba(15,23,42,0.6)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "24px", padding: "32px", backdropFilter: "blur(20px)" }}>
                    {result && (
                        <div style={{ background: result.type === "success" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)", border: `1px solid ${result.type === "success" ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`, borderRadius: "12px", padding: "16px", marginBottom: "24px", color: result.type === "success" ? "#34d399" : "#f87171", fontWeight: "600" }}>
                            {result.message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div style={{ display: "grid", gap: "12px", marginBottom: "24px" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "12px", padding: "0 16px", color: "#94a3b8", fontSize: "0.75rem", fontWeight: "700", textTransform: "uppercase" }}>
                                <div>Product Name</div>
                                <div style={{ textAlign: "center" }}>System Stock</div>
                                <div>Physical Count</div>
                                <div style={{ textAlign: "right" }}>Variance</div>
                            </div>
                            
                            {countList.length === 0 ? <div style={{ textAlign: "center", color: "#64748b", padding: "20px" }}>No items to count.</div> : null}
                            
                            {countList.map((item, idx) => (
                                <div key={item.productId} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "12px", alignItems: "center", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "12px 16px" }}>
                                    <div style={{ color: "white", fontWeight: "600", fontSize: "0.9rem" }}>{item.name}</div>
                                    <div style={{ color: "#94a3b8", textAlign: "center", fontWeight: "700" }}>{item.systemStock}</div>
                                    <div>
                                        <input type="number" min="0" value={item.physicalCount} onChange={e => handleCountChange(item.productId, e.target.value)} style={{ width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px", padding: "8px 12px", color: "white", outline: "none", textAlign: "center", fontWeight: "800" }} placeholder="?" />
                                    </div>
                                    <div style={{ textAlign: "right", fontWeight: "800", color: item.variance === 0 ? "#94a3b8" : item.variance > 0 ? "#10B981" : "#EF4444" }}>
                                        {item.physicalCount === "" ? "—" : item.variance > 0 ? `+${item.variance}` : item.variance}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button type="submit" disabled={submitting || countList.filter(c => c.physicalCount !== "").length === 0} style={{ width: "100%", background: "linear-gradient(135deg, #10B981, #059669)", color: "white", border: "none", padding: "16px", borderRadius: "14px", fontWeight: "800", fontSize: "1rem", cursor: "pointer", opacity: submitting ? 0.7 : 1 }}>
                            {submitting ? "⏳ Processing..." : "✅ Submit Count & Adjust Stock"}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}
