"use client";
import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function AdminApprovals() {
    const { data: session } = useSession();
    const [pending, setPending] = useState({
        doctors: [], labs: [], pharmas: [], mrs: [],
        hospitals: [], retailers: [], stockists: [], distributors: []
    });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("all");
    const [processingId, setProcessingId] = useState(null);

    const fetchApprovals = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/approvals');
            const data = await res.json();
            if (data.success) {
                setPending(data.pending);
            }
        } catch (e) {
            console.error("Failed to load approvals", e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchApprovals();
    }, [fetchApprovals]);

    const handleAction = async (type, id, action) => {
        setProcessingId(id);
        try {
            const res = await fetch('/api/admin/approvals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, id, action })
            });
            const data = await res.json();
            if (data.success) {
                alert(`Partner ${action === 'approve' ? 'APPROVED' : 'REJECTED'} successfully!`);
                fetchApprovals();
            } else {
                alert(data.error || "Action failed");
            }
        } catch (e) {
            alert("Error updating partner status");
        } finally {
            setProcessingId(null);
        }
    };

    const categories = [
        { key: "hospitals", label: "🏥 Hospitals", items: pending.hospitals || [] },
        { key: "retailers", label: "💊 Retailers", items: pending.retailers || [] },
        { key: "distributors", label: "📦 Distributors", items: pending.distributors || [] },
        { key: "stockists", label: "🏬 Stockists", items: pending.stockists || [] },
        { key: "doctors", label: "👨‍⚕️ Doctors", items: pending.doctors || [] },
        { key: "labs", label: "🧪 Labs", items: pending.labs || [] },
        { key: "pharmas", label: "🏭 Pharma Cos.", items: pending.pharmas || [] },
        { key: "mrs", label: "💼 Medical Reps", items: pending.mrs || [] }
    ];

    const totalPendingCount = categories.reduce((sum, cat) => sum + cat.items.length, 0);

    return (
        <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0b0f19 0%, #111827 100%)", color: "white", fontFamily: "'Inter', sans-serif" }}>

            {/* Nav */}
            <div style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "1rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <Link href="/admin" style={{ color: "#9CA3AF", fontSize: "0.85rem", textDecoration: "none" }}>← Admin</Link>
                    <span style={{ color: "#4B5563" }}>|</span>
                    <span style={{ fontWeight: 900, fontSize: "1.1rem" }}>🛡️ Partner Verification Portal</span>
                </div>
                <button onClick={fetchApprovals} style={{ background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.3)", color: "#A5B4FC", padding: "8px 16px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>
                    🔄 Refresh Queue
                </button>
            </div>

            <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "2rem" }}>

                <div style={{ marginBottom: "2rem" }}>
                    <h1 style={{ fontSize: "2.2rem", fontWeight: 900, margin: 0, letterSpacing: "-1px" }}>
                        Partner Application Approvals
                    </h1>
                    <p style={{ color: "#9CA3AF", marginTop: "6px", fontSize: "0.95rem" }}>
                        Review unverified partner applications across all 8 healthcare tiers before authorizing platform access.
                    </p>
                </div>

                {/* Categories Tab Bar */}
                <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginBottom: "2rem" }}>
                    <button
                        onClick={() => setActiveTab("all")}
                        style={{
                            padding: "10px 18px", borderRadius: "12px", fontWeight: 800, fontSize: "0.8rem",
                            cursor: "pointer", border: "none",
                            background: activeTab === "all" ? "#6366F1" : "rgba(255,255,255,0.05)",
                            color: activeTab === "all" ? "white" : "#9CA3AF"
                        }}
                    >
                        ALL PENDING ({totalPendingCount})
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat.key}
                            onClick={() => setActiveTab(cat.key)}
                            style={{
                                padding: "10px 18px", borderRadius: "12px", fontWeight: 800, fontSize: "0.8rem",
                                cursor: "pointer", border: "none",
                                background: activeTab === cat.key ? "#6366F1" : "rgba(255,255,255,0.05)",
                                color: activeTab === cat.key ? "white" : "#9CA3AF"
                            }}
                        >
                            {cat.label} ({cat.items.length})
                        </button>
                    ))}
                </div>

                {/* Content */}
                {loading ? (
                    <div style={{ padding: "4rem", textAlign: "center", color: "#9CA3AF" }}>Loading verification queue...</div>
                ) : totalPendingCount === 0 ? (
                    <div style={{ padding: "5rem", textAlign: "center", background: "rgba(255,255,255,0.02)", borderRadius: "24px", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <div style={{ fontSize: "3.5rem", marginBottom: "1rem" }}>🎉</div>
                        <h2 style={{ color: "#34D399", fontWeight: 900, margin: 0 }}>All Verification Queues Clear!</h2>
                        <p style={{ color: "#6B7280", marginTop: "8px" }}>Every partner registration has been reviewed and verified.</p>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
                        {categories
                            .filter(cat => activeTab === "all" || activeTab === cat.key)
                            .map(cat => {
                                if (cat.items.length === 0) return null;
                                return (
                                    <div key={cat.key}>
                                        <h3 style={{ color: "white", fontWeight: 900, marginBottom: "1rem", fontSize: "1.2rem" }}>
                                            {cat.label} <span style={{ color: "#6366F1" }}>({cat.items.length})</span>
                                        </h3>
                                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: "1.25rem" }}>
                                            {cat.items.map(item => {
                                                const title = item.name || item.shopName || item.companyName || item.agencyName || item.driverName || "Partner";
                                                const sub = item.licenseNumber || item.drugLicenseNo || item.specialization || item.address || item.city || "Pending Details";
                                                const phone = item.phone || item.altPhone || "N/A";
                                                const isProc = processingId === item.id;

                                                return (
                                                    <div key={item.id} style={{
                                                        background: "rgba(255,255,255,0.03)",
                                                        border: "1px solid rgba(255,255,255,0.08)",
                                                        borderRadius: "18px", padding: "1.5rem"
                                                    }}>
                                                        <div style={{ fontWeight: 900, fontSize: "1.1rem", color: "white", marginBottom: "4px" }}>{title}</div>
                                                        <div style={{ fontSize: "0.85rem", color: "#9CA3AF", marginBottom: "4px" }}>{sub}</div>
                                                        <div style={{ fontSize: "0.8rem", color: "#6B7280", marginBottom: "1.25rem" }}>📞 {phone} {item.city && `· 📍 ${item.city}`}</div>

                                                        <div style={{ display: "flex", gap: "10px" }}>
                                                            <button
                                                                onClick={() => handleAction(cat.key.slice(0, -1), item.id, 'approve')}
                                                                disabled={isProc}
                                                                style={{
                                                                    flex: 1, padding: "10px", background: "#10B981", color: "white",
                                                                    border: "none", borderRadius: "10px", fontWeight: "bold", fontSize: "0.8rem", cursor: "pointer"
                                                                }}
                                                            >
                                                                {isProc ? "Saving..." : "✅ Approve & Verify"}
                                                            </button>
                                                            <button
                                                                onClick={() => handleAction(cat.key.slice(0, -1), item.id, 'reject')}
                                                                disabled={isProc}
                                                                style={{
                                                                    flex: 1, padding: "10px", background: "rgba(239,68,68,0.2)", color: "#EF4444",
                                                                    border: "1px solid rgba(239,68,68,0.3)", borderRadius: "10px", fontWeight: "bold", fontSize: "0.8rem", cursor: "pointer"
                                                                }}
                                                            >
                                                                ❌ Reject
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                )}

            </div>
        </div>
    );
}
