"use client";
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function RiderCashPortal() {
    const { data: session } = useSession();
    const [account, setAccount] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showDepositForm, setShowDepositForm] = useState(false);
    const [formData, setFormData] = useState({
        amount: "",
        bankName: "HDFC Bank (Swastik Medicare)",
        bankRef: "",
        note: "",
        receiptUrl: ""
    });

    const fetchRiderCash = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/rider/cash");
            const data = await res.json();
            if (data.success) {
                setAccount(data.account);
            }
        } catch (err) {
            console.error("Failed to load cash data", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRiderCash();
    }, [fetchRiderCash]);

    const handleSubmitDeposit = async (e) => {
        e.preventDefault();
        if (!formData.amount || parseFloat(formData.amount) <= 0) return alert("Enter a valid amount");

        setSubmitting(true);
        try {
            const res = await fetch("/api/rider/cash/deposit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });
            const result = await res.json();
            if (result.success) {
                alert(`✅ Deposit request submitted successfully!\nPending admin confirmation.`);
                setShowDepositForm(false);
                setFormData({ amount: "", bankName: "HDFC Bank (Swastik Medicare)", bankRef: "", note: "", receiptUrl: "" });
                fetchRiderCash();
            } else {
                alert(result.error || "Submission failed");
            }
        } catch (e) {
            alert("Error submitting deposit");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div style={{ minHeight: "100vh", background: "#0b0f19", color: "white", padding: "3rem", textAlign: "center" }}>Loading cash portal...</div>;
    }

    const isOver = account?.isOverLimit;
    const percent = Math.min(100, Math.round(((account?.cashHeld || 0) / (account?.cashSlab || 1)) * 100));

    return (
        <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0b0f19 0%, #111827 100%)", color: "white", fontFamily: "'Inter', sans-serif" }}>

            {/* Nav */}
            <div style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "1rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontWeight: 900, fontSize: "1.1rem" }}>🚴 Rider Cash Portal</div>
                <button onClick={fetchRiderCash} style={{ background: "rgba(255,255,255,0.06)", border: "none", color: "#9CA3AF", padding: "6px 12px", borderRadius: "8px", cursor: "pointer", fontSize: "0.8rem" }}>🔄 Refresh</button>
            </div>

            <div style={{ maxWidth: "600px", margin: "0 auto", padding: "1.5rem" }}>

                {/* Over Limit Alert Banner */}
                {isOver && (
                    <div style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.4)", borderRadius: "16px", padding: "1.25rem", marginBottom: "1.5rem", borderLeft: "6px solid #EF4444" }}>
                        <div style={{ fontWeight: 900, color: "#EF4444", fontSize: "1rem", marginBottom: "4px" }}>🚨 CASH SLAB EXCEEDED</div>
                        <div style={{ fontSize: "0.85rem", color: "#FCA5A5", lineHeight: 1.5 }}>
                            Your cash held (<strong>₹{account.cashHeld.toLocaleString()}</strong>) has exceeded your limit of <strong>₹{account.cashSlab.toLocaleString()}</strong>. Please deposit excess cash into company bank account now.
                        </div>
                    </div>
                )}

                {/* Main Cash Balance Card */}
                <div style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${isOver ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.08)"}`, borderRadius: "20px", padding: "2rem", marginBottom: "1.5rem" }}>
                    <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.1em" }}>Current Cash Held</div>
                    <div style={{ fontSize: "2.8rem", fontWeight: 900, color: isOver ? "#EF4444" : "#FBBF24", marginTop: "4px" }}>₹{(account?.cashHeld || 0).toLocaleString()}</div>

                    {/* Progress */}
                    <div style={{ marginTop: "1.25rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "6px", color: "#9CA3AF" }}>
                            <span>Assigned Limit: ₹{(account?.cashSlab || 5000).toLocaleString()}</span>
                            <span>{percent}%</span>
                        </div>
                        <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: "10px", height: "12px", overflow: "hidden" }}>
                            <div style={{
                                width: `${percent}%`, height: "100%",
                                background: isOver ? "linear-gradient(90deg, #F59E0B, #EF4444)" : "linear-gradient(90deg, #10B981, #059669)",
                                borderRadius: "10px", transition: "width 0.3s"
                            }} />
                        </div>
                    </div>

                    {/* Submit Deposit Button */}
                    <button
                        onClick={() => setShowDepositForm(true)}
                        style={{
                            width: "100%", marginTop: "1.5rem", padding: "14px",
                            background: "linear-gradient(135deg, #10B981, #059669)", color: "white",
                            border: "none", borderRadius: "12px", fontWeight: 900, fontSize: "0.95rem",
                            cursor: "pointer", boxShadow: "0 4px 20px rgba(16,185,129,0.3)"
                        }}
                    >
                        🏦 Deposit Cash to Bank Account
                    </button>
                </div>

                {/* All Time Stats */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
                    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "1.25rem" }}>
                        <div style={{ fontSize: "0.7rem", color: "#9CA3AF", textTransform: "uppercase" }}>Total Collected</div>
                        <div style={{ fontSize: "1.3rem", fontWeight: 900, color: "white", marginTop: "4px" }}>₹{(account?.totalCollected || 0).toLocaleString()}</div>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "1.25rem" }}>
                        <div style={{ fontSize: "0.7rem", color: "#9CA3AF", textTransform: "uppercase" }}>Total Reconciled</div>
                        <div style={{ fontSize: "1.3rem", fontWeight: 900, color: "#34D399", marginTop: "4px" }}>₹{(account?.totalDeposited || 0).toLocaleString()}</div>
                    </div>
                </div>

                {/* Pending Deposits */}
                {account?.deposits?.length > 0 && (
                    <div style={{ marginBottom: "1.5rem" }}>
                        <div style={{ fontWeight: 800, fontSize: "0.9rem", color: "#9CA3AF", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Recent Deposit Submissions</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            {account.deposits.slice(0, 5).map(d => (
                                <div key={d.id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div>
                                        <div style={{ fontWeight: 800, fontSize: "0.95rem" }}>₹{d.amount.toLocaleString()}</div>
                                        <div style={{ fontSize: "0.75rem", color: "#9CA3AF" }}>Ref: {d.bankRef || "N/A"} · {new Date(d.createdAt).toLocaleDateString()}</div>
                                    </div>
                                    <span style={{
                                        background: d.status === "CONFIRMED" ? "rgba(16,185,129,0.2)" : d.status === "REJECTED" ? "rgba(239,68,68,0.2)" : "rgba(245,158,11,0.2)",
                                        color: d.status === "CONFIRMED" ? "#34D399" : d.status === "REJECTED" ? "#EF4444" : "#F59E0B",
                                        fontSize: "0.7rem", fontWeight: "bold", padding: "4px 10px", borderRadius: "10px"
                                    }}>
                                        {d.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Recent Collections Log */}
                <div>
                    <div style={{ fontWeight: 800, fontSize: "0.9rem", color: "#9CA3AF", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Recent Collections Audit</div>
                    {account?.transactions?.length === 0 ? (
                        <div style={{ color: "#6B7280", fontSize: "0.85rem" }}>No cash transactions yet.</div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            {account.transactions.slice(0, 10).map(t => (
                                <div key={t.id} style={{ background: "rgba(255,255,255,0.02)", borderRadius: "10px", padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div>
                                        <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "white" }}>{t.note || t.type}</div>
                                        <div style={{ fontSize: "0.7rem", color: "#6B7280" }}>{new Date(t.createdAt).toLocaleString()}</div>
                                    </div>
                                    <div style={{ fontWeight: 900, color: t.type === "COLLECTION" ? "#FBBF24" : t.type === "DEPOSIT" ? "#34D399" : "#60A5FA" }}>
                                        {t.type === "COLLECTION" ? "+" : "-" }₹{t.amount.toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>

            {/* Deposit Submission Modal */}
            {showDepositForm && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }}>
                    <div style={{ background: "#1f2937", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "24px", padding: "2rem", width: "100%", maxWidth: "500px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                            <h3 style={{ margin: 0, fontWeight: 900, color: "white" }}>Submit Bank Cash Deposit</h3>
                            <button onClick={() => setShowDepositForm(false)} style={{ background: "none", border: "none", color: "#9CA3AF", fontSize: "1.2rem", cursor: "pointer" }}>✕</button>
                        </div>

                        <form onSubmit={handleSubmitDeposit}>
                            <div style={{ marginBottom: "1.25rem" }}>
                                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, color: "#9CA3AF", marginBottom: "6px", textTransform: "uppercase" }}>Amount Deposited (₹)</label>
                                <input
                                    type="number"
                                    required
                                    value={formData.amount}
                                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                    placeholder="Enter amount (e.g. 5000)"
                                    style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "12px", color: "white", outline: "none", fontSize: "1.1rem" }}
                                />
                            </div>

                            <div style={{ marginBottom: "1.25rem" }}>
                                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, color: "#9CA3AF", marginBottom: "6px", textTransform: "uppercase" }}>Bank Name / Account</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.bankName}
                                    onChange={e => setFormData({ ...formData, bankName: e.target.value })}
                                    style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "12px", color: "white", outline: "none", fontSize: "0.9rem" }}
                                />
                            </div>

                            <div style={{ marginBottom: "1.25rem" }}>
                                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, color: "#9CA3AF", marginBottom: "6px", textTransform: "uppercase" }}>UTR / Reference Number</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.bankRef}
                                    onChange={e => setFormData({ ...formData, bankRef: e.target.value })}
                                    placeholder="Bank transaction UTR/Ref ID"
                                    style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "12px", color: "white", outline: "none", fontSize: "0.9rem" }}
                                />
                            </div>

                            <div style={{ marginBottom: "1.5rem" }}>
                                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, color: "#9CA3AF", marginBottom: "6px", textTransform: "uppercase" }}>Optional Notes / Remarks</label>
                                <input
                                    type="text"
                                    value={formData.note}
                                    onChange={e => setFormData({ ...formData, note: e.target.value })}
                                    placeholder="Branch name or comments"
                                    style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "12px", color: "white", outline: "none", fontSize: "0.9rem" }}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                style={{
                                    width: "100%", padding: "14px", background: "#10B981", color: "white",
                                    border: "none", borderRadius: "12px", fontWeight: 900, fontSize: "1rem", cursor: "pointer"
                                }}
                            >
                                {submitting ? "Submitting..." : "Submit for Admin Reconciliation"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}
