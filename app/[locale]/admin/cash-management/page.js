"use client";
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function AdminCashManagement() {
    const { data: session } = useSession();
    const [data, setData] = useState({ summary: null, riders: [], pendingDeposits: [] });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("riders"); // "riders" | "deposits" | "audit"
    const [editingSlabRider, setEditingSlabRider] = useState(null);
    const [newSlabValue, setNewSlabValue] = useState("");
    const [confirmingDeposit, setConfirmingDeposit] = useState(null);
    const [rejectingDeposit, setRejectingDeposit] = useState(null);
    const [rejectReason, setRejectReason] = useState("");
    const [actionLoading, setActionLoading] = useState(false);
    const [selectedRiderDetail, setSelectedRiderDetail] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchCashData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin/cash-management");
            const result = await res.json();
            if (result.success) {
                setData(result);
            }
        } catch (err) {
            console.error("Failed to fetch cash management data", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCashData();
    }, [fetchCashData]);

    const handleUpdateSlab = async (riderId) => {
        const val = parseFloat(newSlabValue);
        if (isNaN(val) || val < 0) return alert("Please enter a valid amount");

        setActionLoading(true);
        try {
            const res = await fetch(`/api/admin/cash-management/${riderId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cashSlab: val })
            });
            const result = await res.json();
            if (result.success) {
                setEditingSlabRider(null);
                fetchCashData();
            } else {
                alert(result.error || "Failed to update slab");
            }
        } catch (e) {
            alert("Error updating slab");
        } finally {
            setActionLoading(false);
        }
    };

    const handleConfirmDeposit = async (depositId) => {
        if (!confirm("Confirm bank deposit receipt and reconcile rider's cash account?")) return;

        setActionLoading(true);
        try {
            const res = await fetch("/api/admin/cash-management/deposits", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ depositId, action: "CONFIRM" })
            });
            const result = await res.json();
            if (result.success) {
                alert(`✅ ${result.message}`);
                fetchCashData();
            } else {
                alert(result.error || "Action failed");
            }
        } catch (e) {
            alert("Error processing deposit");
        } finally {
            setActionLoading(false);
            setConfirmingDeposit(null);
        }
    };

    const handleRejectDeposit = async (depositId) => {
        if (!rejectReason) return alert("Please enter rejection reason");
        setActionLoading(true);
        try {
            const res = await fetch("/api/admin/cash-management/deposits", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ depositId, action: "REJECT", rejectedReason: rejectReason })
            });
            const result = await res.json();
            if (result.success) {
                alert(`Rejection recorded.`);
                setRejectingDeposit(null);
                setRejectReason("");
                fetchCashData();
            } else {
                alert(result.error || "Action failed");
            }
        } catch (e) {
            alert("Error rejecting deposit");
        } finally {
            setActionLoading(false);
        }
    };

    const filteredRiders = data.riders.filter(r =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.phone.includes(searchQuery) ||
        r.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0b0f19 0%, #111827 50%, #1f2937 100%)", color: "white", fontFamily: "'Inter', sans-serif" }}>

            {/* Top Nav */}
            <div style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "1rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <Link href="/admin" style={{ color: "#9CA3AF", fontSize: "0.85rem", textDecoration: "none" }}>← Admin</Link>
                    <span style={{ color: "#4B5563" }}>|</span>
                    <span style={{ fontWeight: 900, fontSize: "1.1rem" }}>💵 COD & Rider Cash Management</span>
                    <span style={{ background: "linear-gradient(135deg, #10B981, #059669)", color: "white", fontSize: "0.65rem", fontWeight: "black", padding: "3px 10px", borderRadius: "20px", letterSpacing: "0.1em" }}>RECONCILIATION LIVE</span>
                </div>
                <button onClick={fetchCashData} style={{ padding: "8px 18px", background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: "8px", color: "#34D399", fontWeight: "bold", cursor: "pointer", fontSize: "0.8rem" }}>
                    🔄 Refresh
                </button>
            </div>

            <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "2rem" }}>

                {/* Header */}
                <div style={{ marginBottom: "2rem" }}>
                    <h1 style={{ fontSize: "2.3rem", fontWeight: 900, margin: 0, letterSpacing: "-1px" }}>
                        Rider Cash & Bank Deposit Control
                    </h1>
                    <p style={{ color: "#9CA3AF", marginTop: "6px", fontSize: "0.95rem" }}>
                        Real-time tracking of rider cash holdings, Cash Slab limit enforcement, and Bank Deposit Reconciliation.
                    </p>
                </div>

                {/* Summary Cards */}
                {data.summary && (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem", marginBottom: "2rem" }}>
                        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "1.5rem" }}>
                            <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.1em" }}>Total Cash in Field</div>
                            <div style={{ fontSize: "2rem", fontWeight: 900, color: "#FBBF24", marginTop: "6px" }}>₹{data.summary.totalCashInField.toLocaleString()}</div>
                            <div style={{ fontSize: "0.75rem", color: "#6B7280", marginTop: "4px" }}>Across {data.summary.totalRiders} active riders</div>
                        </div>

                        <div style={{ background: data.summary.overLimitCount > 0 ? "rgba(239,68,68,0.1)" : "rgba(255,255,255,0.04)", border: `1px solid ${data.summary.overLimitCount > 0 ? "rgba(239,68,68,0.3)" : "rgba(255,255,255,0.08)"}`, borderRadius: "16px", padding: "1.5rem" }}>
                            <div style={{ fontSize: "0.75rem", fontWeight: 800, color: data.summary.overLimitCount > 0 ? "#FCA5A5" : "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.1em" }}>Slab Exceeded Riders</div>
                            <div style={{ fontSize: "2rem", fontWeight: 900, color: data.summary.overLimitCount > 0 ? "#EF4444" : "#10B981", marginTop: "6px" }}>{data.summary.overLimitCount}</div>
                            <div style={{ fontSize: "0.75rem", color: "#6B7280", marginTop: "4px" }}>Holdings above Cash Slab</div>
                        </div>

                        <div style={{ background: data.summary.pendingDepositsCount > 0 ? "rgba(245,158,11,0.1)" : "rgba(255,255,255,0.04)", border: `1px solid ${data.summary.pendingDepositsCount > 0 ? "rgba(245,158,11,0.3)" : "rgba(255,255,255,0.08)"}`, borderRadius: "16px", padding: "1.5rem" }}>
                            <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#FCD34D", textTransform: "uppercase", letterSpacing: "0.1em" }}>Pending Bank Deposits</div>
                            <div style={{ fontSize: "2rem", fontWeight: 900, color: "#F59E0B", marginTop: "6px" }}>{data.summary.pendingDepositsCount}</div>
                            <div style={{ fontSize: "0.75rem", color: "#6B7280", marginTop: "4px" }}>Awaiting admin verification</div>
                        </div>

                        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "1.5rem" }}>
                            <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.1em" }}>Total Reconciled</div>
                            <div style={{ fontSize: "2rem", fontWeight: 900, color: "#34D399", marginTop: "6px" }}>₹{data.summary.totalDeposited.toLocaleString()}</div>
                            <div style={{ fontSize: "0.75rem", color: "#6B7280", marginTop: "4px" }}>Confirmed company bank deposits</div>
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.1)", pb: "0.5rem" }}>
                    {[
                        { id: "riders", label: `🚴 Rider Cash Accounts (${data.riders.length})` },
                        { id: "deposits", label: `🏦 Pending Deposits Queue (${data.pendingDeposits.length})` }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                padding: "10px 20px", borderRadius: "10px", fontWeight: "bold", fontSize: "0.85rem",
                                cursor: "pointer", border: "none",
                                background: activeTab === tab.id ? "linear-gradient(135deg, #10B981, #059669)" : "transparent",
                                color: activeTab === tab.id ? "white" : "#9CA3AF"
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Rider Accounts Tab */}
                {activeTab === "riders" && (
                    <div>
                        <div style={{ marginBottom: "1rem" }}>
                            <input
                                type="text"
                                placeholder="Search rider by name, phone or email..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                style={{ width: "100%", maxWidth: "400px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "10px 16px", color: "white", outline: "none" }}
                            />
                        </div>

                        {loading ? (
                            <div style={{ padding: "3rem", textAlign: "center", color: "#9CA3AF" }}>Loading cash records...</div>
                        ) : filteredRiders.length === 0 ? (
                            <div style={{ padding: "3rem", textAlign: "center", color: "#6B7280" }}>No riders found.</div>
                        ) : (
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: "1.25rem" }}>
                                {filteredRiders.map(r => {
                                    const percent = Math.min(100, Math.round((r.cashHeld / (r.cashSlab || 1)) * 100));
                                    const isOver = r.isOverLimit;

                                    return (
                                        <div key={r.riderId} style={{
                                            background: "rgba(255,255,255,0.03)",
                                            border: `1px solid ${isOver ? "rgba(239,68,68,0.5)" : "rgba(255,255,255,0.08)"}`,
                                            borderRadius: "18px", padding: "1.5rem", position: "relative"
                                        }}>
                                            {/* Header */}
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                                                <div>
                                                    <div style={{ fontWeight: 900, fontSize: "1.1rem" }}>{r.name}</div>
                                                    <div style={{ fontSize: "0.8rem", color: "#9CA3AF" }}>📞 {r.phone} · 🚗 {r.vehicleNumber}</div>
                                                </div>
                                                <span style={{
                                                    background: isOver ? "#EF4444" : "#10B981",
                                                    color: "white", fontSize: "0.65rem", fontWeight: 900,
                                                    padding: "4px 10px", borderRadius: "12px", textTransform: "uppercase"
                                                }}>
                                                    {isOver ? "🚨 OVER SLAB" : "✅ NORMAL"}
                                                </span>
                                            </div>

                                            {/* Holding vs Slab Progress Bar */}
                                            <div style={{ marginBottom: "1.25rem" }}>
                                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "6px" }}>
                                                    <span style={{ color: "#9CA3AF" }}>Cash Held: <strong style={{ color: isOver ? "#EF4444" : "#FBBF24" }}>₹{r.cashHeld.toLocaleString()}</strong></span>
                                                    <span style={{ color: "#9CA3AF" }}>Slab Limit: <strong style={{ color: "white" }}>₹{r.cashSlab.toLocaleString()}</strong></span>
                                                </div>
                                                <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: "10px", height: "10px", overflow: "hidden" }}>
                                                    <div style={{
                                                        width: `${percent}%`, height: "100%",
                                                        background: isOver ? "linear-gradient(90deg, #F59E0B, #EF4444)" : "linear-gradient(90deg, #10B981, #059669)",
                                                        borderRadius: "10px", transition: "width 0.3s"
                                                    }} />
                                                </div>
                                                <div style={{ fontSize: "0.7rem", color: "#6B7280", marginTop: "4px", textAlign: "right" }}>{percent}% of assigned limit</div>
                                            </div>

                                            {/* Stats */}
                                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", background: "rgba(0,0,0,0.2)", padding: "10px", borderRadius: "12px", marginBottom: "1.25rem" }}>
                                                <div>
                                                    <div style={{ fontSize: "0.65rem", color: "#6B7280", textTransform: "uppercase" }}>Total Collected</div>
                                                    <div style={{ fontSize: "0.95rem", fontWeight: "bold", color: "#D1D5DB" }}>₹{r.totalCollected.toLocaleString()}</div>
                                                </div>
                                                <div>
                                                    <div style={{ fontSize: "0.65rem", color: "#6B7280", textTransform: "uppercase" }}>Total Reconciled</div>
                                                    <div style={{ fontSize: "0.95rem", fontWeight: "bold", color: "#34D399" }}>₹{r.totalDeposited.toLocaleString()}</div>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div style={{ display: "flex", gap: "8px" }}>
                                                <button
                                                    onClick={() => { setEditingSlabRider(r.riderId); setNewSlabValue(r.cashSlab); }}
                                                    style={{ flex: 1, padding: "8px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "white", fontSize: "0.75rem", fontWeight: "bold", cursor: "pointer" }}
                                                >
                                                    ⚙️ Edit Cash Slab
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Deposits Queue Tab */}
                {activeTab === "deposits" && (
                    <div>
                        {data.pendingDeposits.length === 0 ? (
                            <div style={{ padding: "4rem", textAlign: "center", background: "rgba(255,255,255,0.02)", borderRadius: "18px", border: "1px solid rgba(255,255,255,0.06)" }}>
                                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎉</div>
                                <div style={{ fontWeight: 900, fontSize: "1.2rem", color: "#34D399" }}>No Pending Deposits!</div>
                                <div style={{ color: "#6B7280", marginTop: "4px", fontSize: "0.85rem" }}>All rider bank deposits have been reviewed and reconciled.</div>
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                {data.pendingDeposits.map(d => (
                                    <div key={d.id} style={{
                                        background: "rgba(255,255,255,0.03)",
                                        border: "1px solid rgba(245,158,11,0.3)",
                                        borderRadius: "16px", padding: "1.5rem",
                                        display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1.5fr auto", gap: "1rem", alignItems: "center"
                                    }}>
                                        <div>
                                            <div style={{ fontWeight: 900, color: "white", fontSize: "1rem" }}>{d.account?.rider?.name || "Rider"}</div>
                                            <div style={{ fontSize: "0.75rem", color: "#9CA3AF" }}>{d.account?.rider?.email}</div>
                                            <div style={{ fontSize: "0.7rem", color: "#6B7280", marginTop: "2px" }}>Submitted: {new Date(d.createdAt).toLocaleString()}</div>
                                        </div>

                                        <div>
                                            <div style={{ fontSize: "1.3rem", fontWeight: 900, color: "#FBBF24" }}>₹{d.amount.toLocaleString()}</div>
                                            <div style={{ fontSize: "0.7rem", color: "#6B7280" }}>Deposit Amount</div>
                                        </div>

                                        <div>
                                            <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "white" }}>{d.bankName || "Bank Transfer"}</div>
                                            <div style={{ fontSize: "0.75rem", color: "#A5B4FC" }}>Ref: {d.bankRef || "N/A"}</div>
                                        </div>

                                        <div>
                                            {d.note && <div style={{ fontSize: "0.75rem", color: "#D1D5DB", fontStyle: "italic" }}>"{d.note}"</div>}
                                            {d.receiptUrl && (
                                                <a href={d.receiptUrl} target="_blank" rel="noreferrer" style={{ fontSize: "0.75rem", color: "#60A5FA", textDecoration: "underline", display: "inline-block", marginTop: "4px" }}>
                                                    📄 View Receipt Slip
                                                </a>
                                            )}
                                        </div>

                                        <div style={{ display: "flex", gap: "8px" }}>
                                            <button
                                                onClick={() => handleConfirmDeposit(d.id)}
                                                disabled={actionLoading}
                                                style={{
                                                    padding: "10px 16px", background: "#10B981", color: "white", border: "none",
                                                    borderRadius: "10px", fontWeight: "bold", fontSize: "0.8rem", cursor: "pointer"
                                                }}
                                            >
                                                ✅ Confirm & Reconcile
                                            </button>
                                            <button
                                                onClick={() => setRejectingDeposit(d.id)}
                                                disabled={actionLoading}
                                                style={{
                                                    padding: "10px 16px", background: "rgba(239,68,68,0.2)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.3)",
                                                    borderRadius: "10px", fontWeight: "bold", fontSize: "0.8rem", cursor: "pointer"
                                                }}
                                            >
                                                ❌ Reject
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

            </div>

            {/* Edit Slab Modal */}
            {editingSlabRider && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
                    <div style={{ background: "#1f2937", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "20px", padding: "2rem", width: "100%", maxWidth: "450px" }}>
                        <h3 style={{ margin: "0 0 1rem 0", color: "white", fontWeight: 900 }}>Set Rider Cash Slab Limit</h3>
                        <p style={{ color: "#9CA3AF", fontSize: "0.85rem", marginBottom: "1.25rem" }}>
                            The rider will automatically receive WhatsApp alert notifications whenever their cash held exceeds this limit.
                        </p>
                        <input
                            type="number"
                            value={newSlabValue}
                            onChange={e => setNewSlabValue(e.target.value)}
                            placeholder="Enter amount in ₹ (e.g. 5000)"
                            style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "12px 16px", color: "white", outline: "none", fontSize: "1rem", marginBottom: "1.5rem" }}
                        />
                        <div style={{ display: "flex", gap: "10px" }}>
                            <button onClick={() => setEditingSlabRider(null)} style={{ flex: 1, padding: "12px", background: "rgba(255,255,255,0.06)", border: "none", borderRadius: "10px", color: "#9CA3AF", fontWeight: "bold", cursor: "pointer" }}>Cancel</button>
                            <button onClick={() => handleUpdateSlab(editingSlabRider)} style={{ flex: 1, padding: "12px", background: "#10B981", border: "none", borderRadius: "10px", color: "white", fontWeight: "bold", cursor: "pointer" }}>Save Limit</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Reason Modal */}
            {rejectingDeposit && (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
                    <div style={{ background: "#1f2937", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "20px", padding: "2rem", width: "100%", maxWidth: "450px" }}>
                        <h3 style={{ margin: "0 0 1rem 0", color: "#EF4444", fontWeight: 900 }}>Reject Deposit Request</h3>
                        <input
                            type="text"
                            value={rejectReason}
                            onChange={e => setRejectReason(e.target.value)}
                            placeholder="Enter rejection reason for rider..."
                            style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "12px 16px", color: "white", outline: "none", fontSize: "0.95rem", marginBottom: "1.5rem" }}
                        />
                        <div style={{ display: "flex", gap: "10px" }}>
                            <button onClick={() => setRejectingDeposit(null)} style={{ flex: 1, padding: "12px", background: "rgba(255,255,255,0.06)", border: "none", borderRadius: "10px", color: "#9CA3AF", fontWeight: "bold", cursor: "pointer" }}>Cancel</button>
                            <button onClick={() => handleRejectDeposit(rejectingDeposit)} style={{ flex: 1, padding: "12px", background: "#EF4444", border: "none", borderRadius: "10px", color: "white", fontWeight: "bold", cursor: "pointer" }}>Confirm Reject</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
