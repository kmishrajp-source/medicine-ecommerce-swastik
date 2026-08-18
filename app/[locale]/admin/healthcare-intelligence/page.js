"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const intentColors = {
    AMBULANCE: "#ef4444",
    HOSPITAL_SEARCH: "#3b82f6",
    LAB_SEARCH: "#a855f7",
    INSURANCE: "#f59e0b",
    MEDICINE_SEARCH: "#22c55e",
    UNKNOWN: "#64748b"
};

export default function HealthcareCommandCenter() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/admin/healthcare-intelligence")
            .then(r => r.json())
            .then(d => { setData(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    if (loading) return (
        <div style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}>
            Loading Healthcare Intelligence...
        </div>
    );

    if (!data || data.error) return (
        <div style={{ padding: "2rem", color: "#ef4444" }}>
            Failed to load command center data.
        </div>
    );

    const { today, providerStatus, alerts, recentSearches } = data;

    return (
        <div style={{ minHeight: "100vh", background: "#0f172a", color: "white", padding: "2rem", fontFamily: "'Outfit', sans-serif" }}>
            {/* Header */}
            <div style={{ marginBottom: "2rem" }}>
                <Link href="/en/admin" style={{ color: "#64748b", fontSize: "0.8rem", textDecoration: "none" }}>← Admin Dashboard</Link>
                <h1 style={{ fontSize: "2rem", fontWeight: 900, marginTop: "0.5rem" }}>Healthcare Intelligence</h1>
                <p style={{ color: "#64748b", fontSize: "0.85rem" }}>Today's Healthcare Operations Overview</p>
            </div>

            {/* AI Alerts */}
            {alerts.length > 0 && (
                <div style={{ marginBottom: "2rem", display: "grid", gap: "0.75rem" }}>
                    {alerts.map((a, i) => (
                        <div key={i} style={{
                            background: a.type === "CRITICAL" ? "rgba(239,68,68,0.15)" : a.type === "WARNING" ? "rgba(245,158,11,0.15)" : "rgba(59,130,246,0.1)",
                            border: `1px solid ${a.type === "CRITICAL" ? "rgba(239,68,68,0.4)" : a.type === "WARNING" ? "rgba(245,158,11,0.4)" : "rgba(59,130,246,0.3)"}`,
                            borderRadius: "12px",
                            padding: "1rem 1.5rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            fontSize: "0.9rem",
                            fontWeight: 600
                        }}>
                            <span style={{ fontSize: "1.2rem" }}>{a.icon}</span>
                            <span>{a.msg}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Today's Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
                {[
                    { label: "Medicine Orders", value: today.medicineOrders, icon: "💊", color: "#6366f1" },
                    { label: "Generic Searches", value: today.genericSearches, icon: "🔍", color: "#22c55e" },
                    { label: "Doctor Appointments", value: today.doctorAppts, icon: "👨‍⚕️", color: "#3b82f6" },
                    { label: "Lab Bookings", value: today.labBookings, icon: "🧪", color: "#a855f7" },
                    { label: "Ambulance Requests", value: today.ambulanceRequests, icon: "🚑", color: today.ambulanceRequests > 0 ? "#ef4444" : "#64748b" },
                    { label: "Insurance Requests", value: today.insuranceRequests, icon: "🛡️", color: "#f59e0b" },
                ].map((s, i) => (
                    <div key={i} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "1.5rem" }}>
                        <div style={{ fontSize: "1.5rem", marginBottom: "8px" }}>{s.icon}</div>
                        <div style={{ fontSize: "2rem", fontWeight: 900, color: s.color }}>{s.value ?? "—"}</div>
                        <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Provider Status */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "2rem" }}>
                <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "1.5rem" }}>
                    <h3 style={{ fontSize: "0.85rem", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "1rem" }}>Provider Verification Status</h3>
                    <div style={{ display: "grid", gap: "0.75rem" }}>
                        {[
                            { label: "Verified Hospitals", value: providerStatus.verifiedHospitals, color: "#22c55e" },
                            { label: "Pending Hospitals", value: providerStatus.unverifiedHospitals, color: "#f59e0b" },
                            { label: "Verified Labs", value: providerStatus.verifiedLabs, color: "#22c55e" },
                            { label: "Available Ambulances", value: providerStatus.verifiedAmbulances, color: providerStatus.verifiedAmbulances === 0 ? "#ef4444" : "#22c55e" },
                        ].map((p, i) => (
                            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>{p.label}</span>
                                <span style={{ fontSize: "1.1rem", fontWeight: 800, color: p.color }}>{p.value}</span>
                            </div>
                        ))}
                    </div>
                    <Link href="/en/admin/provider-verification" style={{ display: "inline-block", marginTop: "1rem", fontSize: "0.75rem", color: "#6366f1", textDecoration: "none", fontWeight: 700 }}>
                        Manage Verifications →
                    </Link>
                </div>

                {/* Recent Searches */}
                <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "1.5rem" }}>
                    <h3 style={{ fontSize: "0.85rem", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "1rem" }}>Recent AI Searches</h3>
                    <div style={{ display: "grid", gap: "0.5rem", maxHeight: "220px", overflowY: "auto" }}>
                        {recentSearches.length === 0 ? (
                            <p style={{ color: "#475569", fontSize: "0.85rem" }}>No searches yet today.</p>
                        ) : recentSearches.map((s, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                <span style={{
                                    background: intentColors[s.resolvedIntent] + "20",
                                    color: intentColors[s.resolvedIntent] || "#64748b",
                                    fontSize: "0.6rem", fontWeight: 800, padding: "2px 8px", borderRadius: "999px", textTransform: "uppercase", whiteSpace: "nowrap"
                                }}>
                                    {s.isEmergency ? "🚨 EMRG" : s.resolvedIntent?.replace("_", " ")}
                                </span>
                                <span style={{ fontSize: "0.8rem", color: "#e2e8f0", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                    {s.rawQuery}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Links */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.75rem" }}>
                {[
                    { href: "/en/admin/insurance", label: "Insurance Management" },
                    { href: "/en/admin/provider-verification", label: "Provider Verification" },
                    { href: "/en/admin/delivery-monitor", label: "Delivery Monitor" },
                    { href: "/en/admin/rider-intelligence", label: "Rider Intelligence" },
                ].map((l, i) => (
                    <Link key={i} href={l.href} style={{
                        background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)",
                        borderRadius: "12px", padding: "1rem", textDecoration: "none",
                        color: "#a5b4fc", fontSize: "0.8rem", fontWeight: 700, textAlign: "center"
                    }}>
                        {l.label} →
                    </Link>
                ))}
            </div>
        </div>
    );
}
