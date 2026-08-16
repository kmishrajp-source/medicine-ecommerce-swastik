"use client";
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

const STATUS_CONFIG = {
    OFFERED: { color: "#F59E0B", bg: "rgba(245,158,11,0.1)", label: "🔔 New Job Offer!", pulse: true },
    ACCEPTED: { color: "#10B981", bg: "rgba(16,185,129,0.1)", label: "✅ Accepted", pulse: false },
    PICKUP_CONFIRMED: { color: "#6366F1", bg: "rgba(99,102,241,0.1)", label: "📦 Picked Up", pulse: false },
    IN_TRANSIT: { color: "#22c55e", bg: "rgba(34,197,94,0.1)", label: "🚴 In Transit", pulse: true },
    DELIVERED: { color: "#34D399", bg: "rgba(52,211,153,0.1)", label: "✅ Delivered", pulse: false },
    FAILED: { color: "#EF4444", bg: "rgba(239,68,68,0.1)", label: "❌ Failed", pulse: false }
};

const NEXT_STATUS = {
    ACCEPTED: { label: "✅ Confirm Pickup", next: "PICKUP_CONFIRMED" },
    PICKUP_CONFIRMED: { label: "🚴 Mark In Transit", next: "IN_TRANSIT" },
    IN_TRANSIT: { label: "✅ Mark Delivered", next: "DELIVERED" }
};

export default function RiderDashboardPage() {
    const { data: session } = useSession();
    const [rider, setRider] = useState(null);
    const [activeJob, setActiveJob] = useState(null);
    const [referralData, setReferralData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState("jobs"); // jobs | performance | referral
    const [statusLoading, setStatusLoading] = useState(false);
    const [copyMsg, setCopyMsg] = useState("");

    const fetchData = useCallback(async () => {
        try {
            const [profileRes, jobsRes] = await Promise.all([
                fetch("/api/rider/profile"),
                fetch("/api/rider/jobs?filter=active")
            ]);
            if (profileRes.ok) {
                const pd = await profileRes.json();
                setRider(pd.rider);
            }
            if (jobsRes.ok) {
                const jd = await jobsRes.json();
                setActiveJob(jd.jobs?.[0] || null);
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000); // Refresh every 10s for new job offers
        return () => clearInterval(interval);
    }, [fetchData]);

    const toggleAvailability = async () => {
        const newVal = !rider?.isAvailable;
        await fetch("/api/rider/profile", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isAvailable: newVal, isOnline: newVal })
        });
        setRider(prev => ({ ...prev, isAvailable: newVal, isOnline: newVal }));
    };

    const handleAccept = async (jobId) => {
        setStatusLoading(true);
        const res = await fetch(`/api/rider/jobs/${jobId}/accept`, { method: "POST" });
        const data = await res.json();
        if (data.success) await fetchData();
        else alert(data.error);
        setStatusLoading(false);
    };

    const handleDecline = async (jobId) => {
        if (!confirm("Decline this delivery job? This will affect your acceptance rate.")) return;
        setStatusLoading(true);
        await fetch(`/api/rider/jobs/${jobId}/reject`, { method: "POST" });
        await fetchData();
        setStatusLoading(false);
    };

    const handleStatusUpdate = async (jobId, newStatus) => {
        if (newStatus === "DELIVERED" && !confirm("Mark this delivery as completed?")) return;
        setStatusLoading(true);
        const res = await fetch(`/api/rider/jobs/${jobId}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus })
        });
        const data = await res.json();
        if (data.success) await fetchData();
        setStatusLoading(false);
    };

    const copyReferralLink = () => {
        const code = rider?.riderReferralCode;
        if (!code) return;
        const link = `https://www.swastikmed.online/en/rider/apply?ref=${code}`;
        navigator.clipboard.writeText(link);
        setCopyMsg("Link copied!");
        setTimeout(() => setCopyMsg(""), 2000);
    };

    if (loading) {
        return (
            <div style={{ minHeight: "100vh", background: "#0a0f1c", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
                <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🚴</div>
                    <div style={{ color: "#9CA3AF" }}>Loading your dashboard...</div>
                </div>
            </div>
        );
    }

    if (!rider) {
        return (
            <div style={{ minHeight: "100vh", background: "#0a0f1c", display: "flex", alignItems: "center", justifyContent: "center", color: "white", flexDirection: "column", gap: "1rem" }}>
                <div style={{ fontSize: "3rem" }}>🚴</div>
                <h2 style={{ fontWeight: 900 }}>Rider Profile Not Found</h2>
                <p style={{ color: "#9CA3AF" }}>You don't have a delivery partner account yet.</p>
                <Link href="/en/rider/apply" style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)", color: "white", padding: "12px 28px", borderRadius: "12px", textDecoration: "none", fontWeight: 700 }}>Apply Now</Link>
            </div>
        );
    }

    const isActive = rider.onboardingStatus === "Active";
    const statusConf = activeJob ? STATUS_CONFIG[activeJob.status] : null;
    const nextAction = activeJob ? NEXT_STATUS[activeJob.status] : null;

    return (
        <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0a0f1c 0%, #0d1b2e 100%)", fontFamily: "'Inter', sans-serif", color: "white" }}>
            {/* Header */}
            <div style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "1rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Link href="/" style={{ color: "#9CA3AF", fontSize: "0.8rem", textDecoration: "none" }}>← Home</Link>
                    <span style={{ color: "#4B5563" }}>|</span>
                    <span style={{ fontWeight: 900 }}>🚴 Rider Dashboard</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "0.75rem", color: isActive ? "#22c55e" : "#EF4444" }}>●{isActive ? " Active" : " Not Active"}</span>
                    {isActive && (
                        <button onClick={toggleAvailability}
                            style={{ padding: "6px 14px", borderRadius: "20px", border: `1px solid ${rider.isAvailable ? "#22c55e" : "#6B7280"}`, background: rider.isAvailable ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.05)", color: rider.isAvailable ? "#22c55e" : "#9CA3AF", cursor: "pointer", fontWeight: 700, fontSize: "0.78rem" }}>
                            {rider.isAvailable ? "🟢 Available" : "⚫ Go Online"}
                        </button>
                    )}
                </div>
            </div>

            <div style={{ maxWidth: "700px", margin: "0 auto", padding: "1.5rem" }}>
                {/* Welcome + Stats Bar */}
                <div style={{ marginBottom: "1.5rem" }}>
                    <h1 style={{ fontSize: "1.3rem", fontWeight: 900, marginBottom: "0.25rem" }}>Welcome, {rider.name || rider.user?.name} 👋</h1>
                    <p style={{ color: "#9CA3AF", fontSize: "0.85rem" }}>{rider.city} {rider.area ? `• ${rider.area}` : ""} • {rider.vehicleType}</p>
                </div>

                {/* KPI Strip */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", marginBottom: "1.5rem" }}>
                    {[
                        { label: "Deliveries", value: rider.totalDeliveries, color: "#60A5FA" },
                        { label: "Rating", value: `${rider.customerRating?.toFixed(1) || "5.0"}⭐`, color: "#F59E0B" },
                        { label: "Acceptance", value: `${rider.acceptanceRate?.toFixed(0) || 100}%`, color: "#22c55e" },
                        { label: "Reliability", value: `${rider.reliabilityScore?.toFixed(0) || 100}`, color: "#A78BFA" }
                    ].map((kpi, i) => (
                        <div key={i} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "12px", textAlign: "center" }}>
                            <div style={{ fontSize: "0.6rem", color: "#6B7280", textTransform: "uppercase", marginBottom: "4px" }}>{kpi.label}</div>
                            <div style={{ fontSize: "1.1rem", fontWeight: 900, color: kpi.color }}>{kpi.value}</div>
                        </div>
                    ))}
                </div>

                {/* Active Job / New Offer */}
                {activeJob && (
                    <div style={{ background: statusConf?.bg || "rgba(255,255,255,0.03)", border: `1px solid ${statusConf?.color || "rgba(255,255,255,0.1)"}40`, borderLeft: `4px solid ${statusConf?.color || "#6366F1"}`, borderRadius: "16px", padding: "1.25rem", marginBottom: "1.5rem", ...(statusConf?.pulse ? { animation: "pulse 2s infinite" } : {}) }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                            <div>
                                <div style={{ fontWeight: 900, fontSize: "1.05rem", color: statusConf?.color }}>{statusConf?.label}</div>
                                <div style={{ fontSize: "0.75rem", color: "#9CA3AF", marginTop: "2px" }}>Order #{activeJob.order?.id?.slice(-6).toUpperCase()}</div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                                <div style={{ fontWeight: 900, color: "#22c55e" }}>₹{activeJob.order?.total}</div>
                                <div style={{ fontSize: "0.7rem", color: "#9CA3AF" }}>{activeJob.order?.paymentMethod}</div>
                            </div>
                        </div>

                        <div style={{ display: "grid", gap: "6px", marginBottom: "1rem" }}>
                            <div style={{ fontSize: "0.85rem", color: "#D1D5DB" }}>📦 <strong>Pickup:</strong> {activeJob.pickupAddress}</div>
                            <div style={{ fontSize: "0.85rem", color: "#D1D5DB" }}>📍 <strong>Drop:</strong> {activeJob.dropAddress}</div>
                        </div>

                        {/* Action Buttons */}
                        {activeJob.status === "OFFERED" && (
                            <div style={{ display: "flex", gap: "10px" }}>
                                <button onClick={() => handleAccept(activeJob.id)} disabled={statusLoading}
                                    style={{ flex: 1, padding: "12px", background: "linear-gradient(135deg, #22c55e, #16a34a)", border: "none", borderRadius: "10px", color: "white", fontWeight: 900, cursor: "pointer", fontSize: "0.9rem" }}>
                                    {statusLoading ? "..." : "✅ Accept Job"}
                                </button>
                                <button onClick={() => handleDecline(activeJob.id)} disabled={statusLoading}
                                    style={{ padding: "12px 20px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "10px", color: "#EF4444", fontWeight: 700, cursor: "pointer", fontSize: "0.9rem" }}>
                                    Decline
                                </button>
                            </div>
                        )}
                        {nextAction && activeJob.status !== "OFFERED" && (
                            <button onClick={() => handleStatusUpdate(activeJob.id, nextAction.next)} disabled={statusLoading}
                                style={{ width: "100%", padding: "12px", background: "linear-gradient(135deg, #6366F1, #7C3AED)", border: "none", borderRadius: "10px", color: "white", fontWeight: 900, cursor: "pointer", fontSize: "0.95rem" }}>
                                {statusLoading ? "Updating..." : nextAction.label}
                            </button>
                        )}
                    </div>
                )}

                {/* Onboarding Status Banner */}
                {!isActive && (
                    <div style={{ background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: "12px", padding: "1rem 1.25rem", marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                            <div style={{ fontWeight: 700, color: "#F59E0B", marginBottom: "2px" }}>⏳ Application: {rider.onboardingStatus}</div>
                            <div style={{ color: "#9CA3AF", fontSize: "0.8rem" }}>Our team is reviewing your profile. You'll be notified when activated.</div>
                        </div>
                    </div>
                )}

                {/* Tab Navigation */}
                <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,0.08)", marginBottom: "1.5rem" }}>
                    {[
                        { id: "jobs", label: "📦 Jobs" },
                        { id: "performance", label: "📊 Performance" },
                        { id: "referral", label: "🎁 Referral" }
                    ].map(t => (
                        <button key={t.id} onClick={() => setTab(t.id)}
                            style={{ padding: "10px 20px", background: "transparent", border: "none", borderBottom: tab === t.id ? "2px solid #6366F1" : "2px solid transparent", color: tab === t.id ? "#A5B4FC" : "#6B7280", fontWeight: 700, cursor: "pointer", fontSize: "0.85rem" }}>
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Performance Tab */}
                {tab === "performance" && (
                    <div style={{ display: "grid", gap: "1rem" }}>
                        {[
                            { label: "Total Deliveries", value: rider.totalDeliveries, icon: "📦" },
                            { label: "Successful", value: rider.successfulDeliveries, icon: "✅" },
                            { label: "Cancelled", value: rider.cancelledDeliveries, icon: "❌" },
                            { label: "Avg Delivery Time", value: `${rider.avgDeliveryTimeMinutes?.toFixed(0) || 0} min`, icon: "⏱️" },
                            { label: "Customer Rating", value: `${rider.customerRating?.toFixed(1) || "5.0"} / 5.0 ⭐`, icon: "🌟" },
                            { label: "Reliability Score", value: `${rider.reliabilityScore?.toFixed(0) || 100} / 100`, icon: "🏆" },
                            { label: "Pending Earnings", value: `₹${rider.pendingEarnings?.toFixed(0) || 0}`, icon: "💰" },
                            { label: "Total Earned", value: `₹${rider.totalEarnings?.toFixed(0) || 0}`, icon: "💼" }
                        ].map((stat, i) => (
                            <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", padding: "1rem 1.25rem", display: "flex", justifyContent: "space-between" }}>
                                <span style={{ color: "#9CA3AF" }}>{stat.icon} {stat.label}</span>
                                <span style={{ fontWeight: 900, color: "white" }}>{stat.value}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Referral Tab */}
                {tab === "referral" && (
                    <div>
                        <div style={{ background: "rgba(99,102,241,0.05)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: "16px", padding: "1.5rem", marginBottom: "1rem" }}>
                            <div style={{ fontWeight: 900, fontSize: "1.1rem", marginBottom: "0.5rem" }}>🎁 Refer a Delivery Partner</div>
                            <p style={{ color: "#9CA3AF", fontSize: "0.85rem", marginBottom: "1rem" }}>
                                Earn a reward for every delivery partner you refer who completes {10} qualifying deliveries.
                            </p>
                            {rider.riderReferralCode ? (
                                <>
                                    <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "10px", padding: "12px", marginBottom: "1rem", fontFamily: "monospace", fontSize: "1.1rem", fontWeight: 900, letterSpacing: "0.1em", textAlign: "center" }}>
                                        {rider.riderReferralCode}
                                    </div>
                                    <div style={{ display: "flex", gap: "8px" }}>
                                        <button onClick={copyReferralLink}
                                            style={{ flex: 1, padding: "10px", background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: "10px", color: "#A5B4FC", fontWeight: 700, cursor: "pointer", fontSize: "0.85rem" }}>
                                            {copyMsg || "📋 Copy Link"}
                                        </button>
                                        <a href={`https://wa.me/?text=${encodeURIComponent(`Join me at Swastik Medicare as a delivery partner! Apply: https://swastikmed.online/en/rider/apply?ref=${rider.riderReferralCode}`)}`}
                                            target="_blank" rel="noreferrer"
                                            style={{ flex: 1, padding: "10px", background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: "10px", color: "#22c55e", fontWeight: 700, textDecoration: "none", textAlign: "center", fontSize: "0.85rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                            📱 Share on WhatsApp
                                        </a>
                                    </div>
                                </>
                            ) : (
                                <button onClick={async () => {
                                    const res = await fetch("/api/refer/rider");
                                    const data = await res.json();
                                    if (data.code) setRider(p => ({ ...p, riderReferralCode: data.code }));
                                }} style={{ width: "100%", padding: "10px", background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", borderRadius: "10px", color: "#A5B4FC", fontWeight: 700, cursor: "pointer" }}>
                                    Generate My Referral Code
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {tab === "jobs" && !activeJob && (
                    <div style={{ textAlign: "center", padding: "3rem", background: "rgba(255,255,255,0.02)", borderRadius: "16px", border: "1px dashed rgba(255,255,255,0.08)" }}>
                        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📭</div>
                        <div style={{ fontWeight: 700, color: "#9CA3AF" }}>{rider.isAvailable ? "No active jobs right now. Stay online to receive offers." : "You're offline. Go online to receive delivery jobs."}</div>
                    </div>
                )}
            </div>

            <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }`}</style>
        </div>
    );
}
