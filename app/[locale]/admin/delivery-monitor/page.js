"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import Link from "next/link";

// Dynamically import Leaflet to avoid SSR errors
const LiveMap = dynamic(() => import("@/components/admin/DeliveryMonitorMap"), { ssr: false });

export default function AdminDeliveryMonitor() {
    const { data: session } = useSession();
    const [data, setData] = useState({ summary: null, agents: [], alerts: [] });
    const [loading, setLoading] = useState(true);
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [activeTab, setActiveTab] = useState("map"); // "map" | "fleet" | "alerts"
    const intervalRef = useRef(null);

    const fetchData = useCallback(async () => {
        try {
            const res = await fetch("/api/admin/delivery-monitor");
            const result = await res.json();
            if (result.success) {
                setData(result);
                if (loading) setLoading(false);
            }
        } catch (e) {
            console.error("Delivery monitor fetch error:", e);
        }
    }, [loading]);

    useEffect(() => {
        fetchData();
        // Auto-refresh every 5 seconds
        intervalRef.current = setInterval(fetchData, 5000);
        return () => clearInterval(intervalRef.current);
    }, [fetchData]);

    const resolveAlert = async (alertId) => {
        try {
            await fetch("/api/admin/delivery-monitor", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ alertId })
            });
            fetchData();
        } catch (e) {
            console.error("Failed to resolve alert");
        }
    };

    const alertTypeColor = { DELAY: "#F59E0B", DEVIATION: "#8B5CF6", OFFLINE: "#EF4444", SOS: "#DC2626" };
    const alertTypeIcon = { DELAY: "⏱️", DEVIATION: "📍", OFFLINE: "📵", SOS: "🆘" };

    return (
        <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0b0f19 0%, #111827 100%)", color: "white", fontFamily: "'Inter', sans-serif", display: "flex", flexDirection: "column" }}>

            {/* Top Nav */}
            <div style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "0.85rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <Link href="/admin" style={{ color: "#9CA3AF", fontSize: "0.85rem", textDecoration: "none" }}>← Admin</Link>
                    <span style={{ color: "#4B5563" }}>|</span>
                    <span style={{ fontWeight: 900, fontSize: "1.1rem" }}>🛰️ Delivery Command Center</span>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10B981", boxShadow: "0 0 8px #10B981", animation: "pulse 2s infinite" }} />
                    <span style={{ fontSize: "0.75rem", color: "#34D399", fontWeight: "bold" }}>LIVE</span>
                </div>

                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                    {data.alerts.length > 0 && (
                        <div style={{ background: "#EF4444", color: "white", fontSize: "0.75rem", fontWeight: 900, padding: "4px 12px", borderRadius: "20px", animation: "pulse 2s infinite" }}>
                            🚨 {data.alerts.length} ACTIVE ALERTS
                        </div>
                    )}
                    <div style={{ fontSize: "0.75rem", color: "#6B7280" }}>Auto-refreshes every 5s</div>
                </div>
            </div>

            {/* KPI Bar */}
            {data.summary && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
                    {[
                        { label: "Total Riders", value: data.summary.totalAgents, color: "#60A5FA", icon: "🚴" },
                        { label: "Live Now (GPS)", value: data.summary.liveNow, color: "#34D399", icon: "📡" },
                        { label: "Offline During Delivery", value: data.summary.offlineDuringDelivery, color: "#F59E0B", icon: "📵" },
                        { label: "Active Alerts", value: data.summary.unresolvedAlerts, color: data.summary.unresolvedAlerts > 0 ? "#EF4444" : "#34D399", icon: "🚨" }
                    ].map((kpi, i) => (
                        <div key={i} style={{ padding: "1rem 1.5rem", borderRight: i < 3 ? "1px solid rgba(255,255,255,0.06)" : "none", textAlign: "center" }}>
                            <div style={{ fontSize: "0.7rem", fontWeight: 800, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.08em" }}>{kpi.icon} {kpi.label}</div>
                            <div style={{ fontSize: "1.8rem", fontWeight: 900, color: kpi.color, marginTop: "2px" }}>{kpi.value}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Tab Bar */}
            <div style={{ display: "flex", gap: "0", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
                {[
                    { id: "map", label: "🗺️ Live Fleet Map" },
                    { id: "fleet", label: `🚴 Rider Fleet (${data.agents.length})` },
                    { id: "alerts", label: `🚨 Alert Queue (${data.alerts.length})` }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            padding: "12px 24px", fontWeight: 800, fontSize: "0.85rem",
                            cursor: "pointer", border: "none", borderBottom: activeTab === tab.id ? "2px solid #6366F1" : "2px solid transparent",
                            background: "transparent",
                            color: activeTab === tab.id ? "#A5B4FC" : "#6B7280"
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <style>{`
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
            `}</style>

            {/* Content */}
            <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>

                {/* Live Map Tab */}
                {activeTab === "map" && (
                    <div style={{ height: "100%", minHeight: "600px" }}>
                        {!loading && (
                            <LiveMap
                                agents={data.agents}
                                alerts={data.alerts}
                                selectedAgent={selectedAgent}
                                onSelectAgent={setSelectedAgent}
                            />
                        )}
                    </div>
                )}

                {/* Fleet Tab */}
                {activeTab === "fleet" && (
                    <div style={{ padding: "1.5rem", overflowY: "auto", height: "100%" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "1.25rem" }}>
                            {data.agents.map(agent => {
                                const isLive = agent.isLive;
                                return (
                                    <div key={agent.id} style={{
                                        background: "rgba(255,255,255,0.03)",
                                        border: `1px solid ${isLive ? "rgba(52,211,153,0.3)" : "rgba(255,255,255,0.06)"}`,
                                        borderRadius: "16px", padding: "1.25rem"
                                    }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                                            <div>
                                                <div style={{ fontWeight: 900, fontSize: "1.05rem" }}>
                                                    {isLive ? "📡" : "⚫"} {agent.name}
                                                </div>
                                                <div style={{ fontSize: "0.75rem", color: "#9CA3AF" }}>
                                                    {agent.vehicleNumber} · {agent.phone}
                                                </div>
                                            </div>
                                            <span style={{
                                                background: isLive ? "rgba(52,211,153,0.2)" : "rgba(107,114,128,0.2)",
                                                color: isLive ? "#34D399" : "#6B7280",
                                                fontSize: "0.65rem", fontWeight: 900,
                                                padding: "4px 10px", borderRadius: "12px", textTransform: "uppercase"
                                            }}>
                                                {isLive ? "🟢 LIVE" : "⚫ OFFLINE"}
                                            </span>
                                        </div>

                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", background: "rgba(0,0,0,0.2)", padding: "10px", borderRadius: "12px", marginBottom: "1rem" }}>
                                            <div style={{ textAlign: "center" }}>
                                                <div style={{ fontSize: "0.6rem", color: "#6B7280", textTransform: "uppercase" }}>Speed</div>
                                                <div style={{ fontWeight: 900, color: "white" }}>{agent.speed ? `${agent.speed} km/h` : "–"}</div>
                                            </div>
                                            <div style={{ textAlign: "center" }}>
                                                <div style={{ fontSize: "0.6rem", color: "#6B7280", textTransform: "uppercase" }}>ETA</div>
                                                <div style={{ fontWeight: 900, color: "#FBBF24" }}>{agent.etaMinutes ? `${agent.etaMinutes} min` : "–"}</div>
                                            </div>
                                            <div style={{ textAlign: "center" }}>
                                                <div style={{ fontSize: "0.6rem", color: "#6B7280", textTransform: "uppercase" }}>Distance</div>
                                                <div style={{ fontWeight: 900, color: "#60A5FA" }}>{agent.distanceKm ? `${agent.distanceKm} km` : "–"}</div>
                                            </div>
                                        </div>

                                        {agent.activeOrder && (
                                            <div style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "10px", padding: "8px 12px" }}>
                                                <div style={{ fontSize: "0.7rem", color: "#A5B4FC" }}>Active Order</div>
                                                <div style={{ fontSize: "0.85rem", fontWeight: "bold" }}>#{agent.activeOrder.id.slice(-6).toUpperCase()} · {agent.activeOrder.status.replace(/_/g, ' ')}</div>
                                                <div style={{ fontSize: "0.75rem", color: "#9CA3AF", marginTop: "2px" }}>{agent.activeOrder.address?.slice(0, 60)}</div>
                                            </div>
                                        )}

                                        {agent.hasActiveAlerts && (
                                            <div style={{ marginTop: "8px", fontSize: "0.75rem", color: "#EF4444", fontWeight: "bold" }}>
                                                🚨 {agent.alertCount} unresolved alert{agent.alertCount > 1 ? "s" : ""}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Alerts Tab */}
                {activeTab === "alerts" && (
                    <div style={{ padding: "1.5rem", overflowY: "auto", height: "100%" }}>
                        {data.alerts.length === 0 ? (
                            <div style={{ padding: "4rem", textAlign: "center", background: "rgba(255,255,255,0.02)", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.06)" }}>
                                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✅</div>
                                <div style={{ fontWeight: 900, color: "#34D399", fontSize: "1.2rem" }}>All Clear — No Active Alerts</div>
                                <div style={{ color: "#6B7280", marginTop: "6px" }}>All delivery operations are proceeding normally.</div>
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                                {data.alerts.map(alert => (
                                    <div key={alert.id} style={{
                                        background: "rgba(255,255,255,0.03)",
                                        border: `1px solid ${alertTypeColor[alert.type] || "#EF4444"}40`,
                                        borderLeft: `5px solid ${alertTypeColor[alert.type] || "#EF4444"}`,
                                        borderRadius: "16px", padding: "1.25rem",
                                        display: "flex", justifyContent: "space-between", alignItems: "center"
                                    }}>
                                        <div>
                                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                                                <span style={{ fontSize: "1.2rem" }}>{alertTypeIcon[alert.type] || "⚠️"}</span>
                                                <span style={{ fontWeight: 900, color: alertTypeColor[alert.type], textTransform: "uppercase", fontSize: "0.85rem" }}>{alert.type}</span>
                                                <span style={{ fontSize: "0.75rem", color: "#9CA3AF" }}>· {alert.agent?.user?.name || "Rider"}</span>
                                            </div>
                                            <div style={{ fontSize: "0.9rem", color: "#D1D5DB" }}>{alert.message}</div>
                                            <div style={{ fontSize: "0.7rem", color: "#6B7280", marginTop: "4px" }}>
                                                {new Date(alert.createdAt).toLocaleString()}
                                                {alert.orderId && ` · Order #${alert.orderId.slice(-6).toUpperCase()}`}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => resolveAlert(alert.id)}
                                            style={{ background: "rgba(52,211,153,0.15)", border: "1px solid rgba(52,211,153,0.3)", color: "#34D399", padding: "8px 16px", borderRadius: "10px", fontWeight: "bold", cursor: "pointer", fontSize: "0.8rem", whiteSpace: "nowrap" }}
                                        >
                                            ✅ Resolve
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
