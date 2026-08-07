"use client";
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function DistributorDashboard() {
    const { data: session } = useSession();
    const [data, setData] = useState({ distributor: null, catalog: [], shortageAlerts: [], retailerNetwork: [] });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("catalog"); // "catalog" | "alerts" | "retailers" | "settings"
    const [editBrands, setEditBrands] = useState("");
    const [editCoverage, setEditCoverage] = useState("");
    const [saving, setSaving] = useState(false);

    const fetchDashboard = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/distributor/dashboard");
            const result = await res.json();
            if (result.success) {
                setData(result);
                setEditBrands(result.distributor?.brands || "");
                setEditCoverage(result.distributor?.coverageArea || "");
            }
        } catch (e) {
            console.error("Failed to load distributor dashboard", e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    const handleSaveSettings = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch("/api/distributor/dashboard", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ brands: editBrands, coverageArea: editCoverage })
            });
            const result = await res.json();
            if (result.success) {
                alert("✅ Distribution profile updated successfully!");
                fetchDashboard();
            } else {
                alert(result.error || "Update failed");
            }
        } catch (err) {
            alert("Error saving settings");
        } finally {
            setSaving(false);
        }
    };

    const handleWhatsAppRetailer = (retailer, item) => {
        const msg = encodeURIComponent(`Hello ${retailer.shopName}, I am from ${data.distributor?.companyName || 'Swastik Partner Distributor'}.\nWe have stock available for *${item.name}* (MRP ₹${item.mrp}).\nPlease reply with your bulk order requirement.`);
        window.open(`https://wa.me/91${retailer.phone}?text=${msg}`, "_blank");
    };

    const dist = data.distributor;

    return (
        <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)", color: "white", fontFamily: "'Inter', sans-serif" }}>

            {/* Top Bar */}
            <div style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "1rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <span style={{ fontSize: "1.3rem" }}>📦</span>
                    <div>
                        <div style={{ fontWeight: 900, fontSize: "1.1rem" }}>{dist?.companyName || "Distributor Portal"}</div>
                        <div style={{ fontSize: "0.75rem", color: "#9CA3AF" }}>📍 {dist?.city || "Gorakhpur"} {dist?.verified ? "· ✅ Verified Partner" : "· ⏳ Unverified"}</div>
                    </div>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                    <button onClick={fetchDashboard} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "white", padding: "8px 16px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", fontSize: "0.8rem" }}>
                        🔄 Refresh
                    </button>
                </div>
            </div>

            <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "2rem" }}>

                {/* KPI Bar */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem", marginBottom: "2rem" }}>
                    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "1.5rem" }}>
                        <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.1em" }}>Managed Products</div>
                        <div style={{ fontSize: "2rem", fontWeight: 900, color: "#60A5FA", marginTop: "4px" }}>{data.catalog.length}</div>
                        <div style={{ fontSize: "0.75rem", color: "#6B7280", marginTop: "2px" }}>Active distribution catalog</div>
                    </div>

                    <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "16px", padding: "1.5rem" }}>
                        <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#FCA5A5", textTransform: "uppercase", letterSpacing: "0.1em" }}>Regional Shortage Alerts</div>
                        <div style={{ fontSize: "2rem", fontWeight: 900, color: "#EF4444", marginTop: "4px" }}>{data.shortageAlerts.length}</div>
                        <div style={{ fontSize: "0.75rem", color: "#6B7280", marginTop: "2px" }}>High demand opportunities</div>
                    </div>

                    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "1.5rem" }}>
                        <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.1em" }}>Retailer Network</div>
                        <div style={{ fontSize: "2rem", fontWeight: 900, color: "#34D399", marginTop: "4px" }}>{data.retailerNetwork.length}</div>
                        <div style={{ fontSize: "0.75rem", color: "#6B7280", marginTop: "2px" }}>Pharmacies in your territory</div>
                    </div>

                    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "1.5rem" }}>
                        <div style={{ fontSize: "0.75rem", fontWeight: 800, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.1em" }}>Coverage Districts</div>
                        <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#A5B4FC", marginTop: "8px" }}>{dist?.coverageArea || "Gorakhpur Region"}</div>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.1)", pb: "0.5rem" }}>
                    {[
                        { id: "catalog", label: `📦 Distribution Catalog (${data.catalog.length})` },
                        { id: "alerts", label: `🚨 Shortage Opportunities (${data.shortageAlerts.length})` },
                        { id: "retailers", label: `🏪 Retailer Network (${data.retailerNetwork.length})` },
                        { id: "settings", label: "⚙️ Profile & Brands" }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                padding: "10px 20px", borderRadius: "10px", fontWeight: "bold", fontSize: "0.85rem",
                                cursor: "pointer", border: "none",
                                background: activeTab === tab.id ? "linear-gradient(135deg, #3B82F6, #1D4ED8)" : "transparent",
                                color: activeTab === tab.id ? "white" : "#9CA3AF"
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {loading ? (
                    <div style={{ padding: "4rem", textAlign: "center", color: "#9CA3AF" }}>Loading distribution portal...</div>
                ) : activeTab === "catalog" ? (
                    <div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.25rem" }}>
                            {data.catalog.map(item => (
                                <div key={item.id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "1.25rem" }}>
                                    <div style={{ fontWeight: 900, fontSize: "1rem", color: "white", marginBottom: "4px" }}>{item.name}</div>
                                    <div style={{ fontSize: "0.75rem", color: "#9CA3AF", marginBottom: "8px" }}>{item.salt || "No salt data"} {item.brand && `· ${item.brand}`}</div>

                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(0,0,0,0.2)", padding: "10px", borderRadius: "10px" }}>
                                        <div>
                                            <div style={{ fontSize: "0.65rem", color: "#6B7280", textTransform: "uppercase" }}>MRP</div>
                                            <div style={{ fontWeight: 900, color: "#34D399" }}>₹{item.mrp}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: "0.65rem", color: "#6B7280", textTransform: "uppercase" }}>System Stock</div>
                                            <div style={{ fontWeight: 900, color: item.stock < 20 ? "#EF4444" : "white" }}>{item.stock} units</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : activeTab === "alerts" ? (
                    <div>
                        <p style={{ color: "#9CA3AF", fontSize: "0.9rem", marginBottom: "1.25rem" }}>
                            These medicines are currently flagged as low-stock in your region. Contact verified pharmacies to fulfill their restock needs.
                        </p>
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            {data.shortageAlerts.map(alert => (
                                <div key={alert.id} style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "16px", padding: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div>
                                        <div style={{ fontWeight: 900, color: "white", fontSize: "1.05rem" }}>⚠️ {alert.name}</div>
                                        <div style={{ fontSize: "0.8rem", color: "#FCA5A5", marginTop: "2px" }}>Salt: {alert.salt || "N/A"} · Brand: {alert.brand || "N/A"}</div>
                                        <div style={{ fontSize: "0.75rem", color: "#9CA3AF", marginTop: "4px" }}>On-hand regional stock: <strong style={{ color: "#EF4444" }}>{alert.currentStock} units remaining</strong></div>
                                    </div>

                                    {data.retailerNetwork.length > 0 && (
                                        <button
                                            onClick={() => handleWhatsAppRetailer(data.retailerNetwork[0], alert)}
                                            style={{ background: "#25D366", color: "white", border: "none", padding: "10px 18px", borderRadius: "10px", fontWeight: "bold", fontSize: "0.8rem", cursor: "pointer" }}
                                        >
                                            📲 Broadcast Restock offer via WA
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ) : activeTab === "retailers" ? (
                    <div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1.25rem" }}>
                            {data.retailerNetwork.map(ret => (
                                <div key={ret.id} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "1.25rem" }}>
                                    <div style={{ fontWeight: 900, fontSize: "1rem", color: "white", marginBottom: "4px" }}>🏪 {ret.shopName}</div>
                                    <div style={{ fontSize: "0.8rem", color: "#9CA3AF", marginBottom: "6px" }}>📍 {ret.address}</div>
                                    <div style={{ fontSize: "0.8rem", color: "#60A5FA", marginBottom: "1rem" }}>📞 {ret.phone}</div>

                                    <button
                                        onClick={() => {
                                            const msg = encodeURIComponent(`Hello ${ret.shopName}, I am from ${dist?.companyName || 'Swastik Partner Distributor'}. We supply ${dist?.brands || 'pharma products'}. Please share your current order list.`);
                                            window.open(`https://wa.me/91${ret.phone}?text=${msg}`, "_blank");
                                        }}
                                        style={{ width: "100%", background: "#25D366", color: "white", border: "none", padding: "10px", borderRadius: "10px", fontWeight: "bold", fontSize: "0.8rem", cursor: "pointer" }}
                                    >
                                        💬 WhatsApp Retailer Direct
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : activeTab === "settings" ? (
                    <div style={{ maxWidth: "600px" }}>
                        <form onSubmit={handleSaveSettings} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", padding: "2rem" }}>
                            <h3 style={{ margin: "0 0 1.5rem 0", fontWeight: 900, color: "white" }}>Distributor Profile Settings</h3>

                            <div style={{ marginBottom: "1.25rem" }}>
                                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, color: "#9CA3AF", marginBottom: "6px", textTransform: "uppercase" }}>Distributed Brands (Comma separated)</label>
                                <textarea
                                    rows={3}
                                    value={editBrands}
                                    onChange={e => setEditBrands(e.target.value)}
                                    placeholder="Sun Pharma, Cipla, Mankind, Torrent..."
                                    style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "12px", color: "white", outline: "none", fontSize: "0.9rem" }}
                                />
                            </div>

                            <div style={{ marginBottom: "1.5rem" }}>
                                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, color: "#9CA3AF", marginBottom: "6px", textTransform: "uppercase" }}>Coverage Districts / Areas</label>
                                <input
                                    type="text"
                                    value={editCoverage}
                                    onChange={e => setEditCoverage(e.target.value)}
                                    placeholder="Gorakhpur, Basti, Deoria, Maharajganj..."
                                    style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "12px", color: "white", outline: "none", fontSize: "0.9rem" }}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={saving}
                                style={{ width: "100%", padding: "14px", background: "#3B82F6", color: "white", border: "none", borderRadius: "12px", fontWeight: 900, cursor: "pointer" }}
                            >
                                {saving ? "Saving..." : "Save Profile & Brands"}
                            </button>
                        </form>
                    </div>
                ) : null}

            </div>
        </div>
    );
}
