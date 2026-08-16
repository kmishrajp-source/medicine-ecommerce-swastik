"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function RiderIntelligenceCenter() {
    const { data: session } = useSession();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await fetch("/api/admin/rider-analytics");
                if (res.ok) {
                    const json = await res.json();
                    setData(json);
                }
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        if (session?.user?.role === "ADMIN") fetchAnalytics();
    }, [session]);

    if (!session || session.user.role !== "ADMIN") return <div style={{ padding: "2rem", color: "white" }}>Unauthorized</div>;
    if (loading) return <div style={{ padding: "2rem", color: "white" }}>Loading AI Command Center...</div>;
    if (!data) return <div style={{ padding: "2rem", color: "white" }}>Failed to load data.</div>;

    const { summary, fleetAlerts, aiInsights, channelAnalytics, shortageZones, recentApplications, pendingReferralRewards } = data;

    return (
        <div style={{ minHeight: "100vh", background: "#0f172a", fontFamily: "'Inter', sans-serif", color: "white", padding: "2rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem" }}>
                <div>
                    <h1 style={{ fontSize: "2rem", fontWeight: 900, margin: 0, background: "linear-gradient(135deg, #38bdf8, #818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                        Delivery Intelligence Center
                    </h1>
                    <p style={{ color: "#94a3b8", margin: "0.5rem 0 0 0" }}>AI-powered monitoring, recruitment, and fraud detection</p>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                    <Link href="/en/admin/riders" style={{ padding: "10px 16px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "white", textDecoration: "none", fontSize: "0.9rem", fontWeight: 600 }}>Fleet Directory</Link>
                    <Link href="/en/admin/rider-campaigns" style={{ padding: "10px 16px", background: "rgba(56,189,248,0.1)", border: "1px solid rgba(56,189,248,0.3)", borderRadius: "8px", color: "#38bdf8", textDecoration: "none", fontSize: "0.9rem", fontWeight: 600 }}>Recruitment Campaigns</Link>
                    <Link href="/en/admin/rider-referrals" style={{ padding: "10px 16px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", border: "none", borderRadius: "8px", color: "white", textDecoration: "none", fontSize: "0.9rem", fontWeight: 600 }}>Referrals & Fraud</Link>
                </div>
            </div>

            {/* AI Insights Banner */}
            {aiInsights?.length > 0 && (
                <div style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.3)", borderRadius: "12px", padding: "1.5rem", marginBottom: "2rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1rem" }}>
                        <span style={{ fontSize: "1.5rem" }}>🧠</span>
                        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0, color: "#c4b5fd" }}>AI Executive Briefing</h2>
                    </div>
                    <ul style={{ margin: 0, paddingLeft: "1.5rem", color: "#e2e8f0", display: "grid", gap: "0.5rem" }}>
                        {aiInsights.map((insight, i) => (
                            <li key={i} style={{ lineHeight: 1.5 }}>{insight}</li>
                        ))}
                    </ul>
                </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem" }}>
                
                {/* Main Column */}
                <div>
                    {/* Live Fleet KPI */}
                    <div style={{ background: "rgba(30,41,59,0.5)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px", padding: "1.5rem", marginBottom: "2rem" }}>
                        <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 1.5rem 0", color: "#94a3b8" }}>Live Fleet Operations</h3>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
                            {[
                                { label: "Active Fleet", value: summary.activeRiders, sub: `${summary.totalRiders} total registered` },
                                { label: "Available Now", value: summary.availableRiders, sub: `${summary.onlineRiders} currently online` },
                                { label: "In Transit", value: summary.inTransitJobs, color: "#22c55e", sub: "Out for delivery" },
                                { label: "Jobs Searching", value: summary.searchingJobs, color: summary.searchingJobs > 3 ? "#ef4444" : "#f59e0b", sub: "Awaiting acceptance" }
                            ].map((k, i) => (
                                <div key={i}>
                                    <div style={{ fontSize: "0.8rem", color: "#64748b", textTransform: "uppercase", marginBottom: "4px" }}>{k.label}</div>
                                    <div style={{ fontSize: "2rem", fontWeight: 900, color: k.color || "white", lineHeight: 1.1 }}>{k.value}</div>
                                    <div style={{ fontSize: "0.75rem", color: "#475569", marginTop: "4px" }}>{k.sub}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Zone Shortages */}
                    <div style={{ background: "rgba(30,41,59,0.5)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px", padding: "1.5rem", marginBottom: "2rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                            <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: 0, color: "#94a3b8" }}>Supply vs Demand Intelligence</h3>
                            <span style={{ fontSize: "0.8rem", color: "#64748b" }}>Live Zone Analysis</span>
                        </div>
                        {shortageZones.length === 0 ? (
                            <div style={{ color: "#22c55e", fontSize: "0.9rem", padding: "1rem", background: "rgba(34,197,94,0.1)", borderRadius: "8px" }}>✅ All zones are adequately staffed.</div>
                        ) : (
                            <div style={{ display: "grid", gap: "1rem" }}>
                                {shortageZones.map(zone => (
                                    <div key={zone.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", background: "rgba(0,0,0,0.2)", borderRadius: "8px", borderLeft: `4px solid ${zone.shortageScore >= 80 ? "#ef4444" : "#f59e0b"}` }}>
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: "1rem" }}>{zone.area}, {zone.city}</div>
                                            <div style={{ color: "#94a3b8", fontSize: "0.85rem", marginTop: "4px", maxWidth: "500px" }}>{zone.aiRecommendation}</div>
                                        </div>
                                        <div style={{ textAlign: "right" }}>
                                            <div style={{ fontSize: "0.8rem", color: "#64748b", textTransform: "uppercase" }}>Shortage Score</div>
                                            <div style={{ fontWeight: 900, fontSize: "1.2rem", color: zone.shortageScore >= 80 ? "#ef4444" : "#f59e0b" }}>{zone.shortageScore} / 100</div>
                                            <div style={{ fontSize: "0.8rem", color: "#38bdf8", marginTop: "4px" }}>Needs {zone.recommendedRiderCount} riders</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column */}
                <div>
                    {/* Fleet Performance Alerts */}
                    <div style={{ background: "rgba(30,41,59,0.5)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px", padding: "1.5rem", marginBottom: "2rem" }}>
                        <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 1.5rem 0", color: "#94a3b8" }}>Fleet Performance Alerts</h3>
                        {fleetAlerts.length === 0 ? (
                            <div style={{ color: "#94a3b8", fontSize: "0.9rem" }}>No critical alerts.</div>
                        ) : (
                            <div style={{ display: "grid", gap: "10px" }}>
                                {fleetAlerts.map((a, i) => (
                                    <Link href={`/en/admin/riders/${a.riderId}`} key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px", background: "rgba(239,68,68,0.1)", borderRadius: "8px", textDecoration: "none", color: "inherit", border: "1px solid rgba(239,68,68,0.2)" }}>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "#fca5a5" }}>{a.type.replace("_", " ")}</div>
                                            <div style={{ color: "#e2e8f0", fontSize: "0.85rem", marginTop: "2px" }}>{a.riderName}</div>
                                        </div>
                                        <div style={{ fontWeight: 900, color: "#ef4444" }}>{typeof a.value === "number" ? a.value.toFixed(1) : a.value}</div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Fraud & Referrals */}
                    <div style={{ background: "rgba(30,41,59,0.5)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "12px", padding: "1.5rem" }}>
                        <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: "0 0 1.5rem 0", color: "#94a3b8" }}>Risk & Growth Queue</h3>
                        <div style={{ display: "grid", gap: "1rem" }}>
                            <div style={{ padding: "1rem", background: summary.openFraudFlags > 0 ? "rgba(239,68,68,0.15)" : "rgba(0,0,0,0.2)", borderRadius: "8px", border: summary.openFraudFlags > 0 ? "1px solid rgba(239,68,68,0.3)" : "none" }}>
                                <div style={{ fontSize: "0.85rem", color: "#94a3b8" }}>Open Fraud Flags</div>
                                <div style={{ fontSize: "1.5rem", fontWeight: 900, color: summary.openFraudFlags > 0 ? "#ef4444" : "white" }}>{summary.openFraudFlags}</div>
                            </div>
                            <div style={{ padding: "1rem", background: "rgba(0,0,0,0.2)", borderRadius: "8px" }}>
                                <div style={{ fontSize: "0.85rem", color: "#94a3b8" }}>Pending Referral Rewards</div>
                                <div style={{ fontSize: "1.5rem", fontWeight: 900 }}>{pendingReferralRewards}</div>
                            </div>
                            <div style={{ padding: "1rem", background: "rgba(0,0,0,0.2)", borderRadius: "8px" }}>
                                <div style={{ fontSize: "0.85rem", color: "#94a3b8" }}>Recent Applications (24h)</div>
                                <div style={{ fontSize: "1.5rem", fontWeight: 900 }}>{recentApplications.length}</div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
