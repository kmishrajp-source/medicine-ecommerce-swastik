"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";

const TrackingMap = dynamic(() => import("@/components/CustomerTrackingMap"), { ssr: false });

const STATUS_STEPS = [
    { key: "Received", label: "Order Received", icon: "📦" },
    { key: "Pharmacist_Approved", label: "Pharmacist Verified", icon: "✅" },
    { key: "Ready_for_Packing", label: "Being Packed", icon: "🔖" },
    { key: "Out_for_Delivery", label: "Out for Delivery", icon: "🏍️" },
    { key: "Delivered", label: "Delivered", icon: "🎉" }
];

export default function CustomerTrackingPage({ params }) {
    const orderId = params?.orderId;
    const [tracking, setTracking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);
    const intervalRef = useRef(null);

    const fetchTracking = useCallback(async () => {
        if (!orderId) return;
        try {
            const res = await fetch(`/api/rider/location?orderId=${orderId}`);
            const data = await res.json();
            if (data.success) {
                setTracking(data);
                setLastUpdated(new Date());
            }
        } catch (e) {
            console.error("Tracking fetch error:", e);
        } finally {
            setLoading(false);
        }
    }, [orderId]);

    useEffect(() => {
        fetchTracking();
        // Only auto-refresh when out for delivery
        intervalRef.current = setInterval(fetchTracking, 5000);
        return () => clearInterval(intervalRef.current);
    }, [fetchTracking]);

    const currentStepIndex = STATUS_STEPS.findIndex(s =>
        tracking?.orderStatus?.toLowerCase().includes(s.key.toLowerCase().replace(/_/g, '_'))
    );

    if (loading) {
        return (
            <div style={{ minHeight: "100vh", background: "#0b0f19", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontFamily: "Inter, sans-serif" }}>
                <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>📦</div>
                    <div style={{ fontWeight: "bold" }}>Loading your order tracking...</div>
                </div>
            </div>
        );
    }

    if (!tracking) {
        return (
            <div style={{ minHeight: "100vh", background: "#0b0f19", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
                <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>❌</div>
                    <div>Order tracking data unavailable.</div>
                    <Link href="/" style={{ color: "#60A5FA", marginTop: "1rem", display: "inline-block" }}>← Go Home</Link>
                </div>
            </div>
        );
    }

    const isOutForDelivery = tracking.orderStatus === "Out_for_Delivery";
    const isDelivered = tracking.orderStatus === "Delivered";

    return (
        <div style={{ minHeight: "100vh", background: "#0b0f19", color: "white", fontFamily: "Inter, sans-serif" }}>

            {/* Header */}
            <div style={{ background: "linear-gradient(135deg, #1e3a5f, #1a1a2e)", padding: "1.25rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ maxWidth: "700px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                        <div style={{ fontWeight: 900, fontSize: "1.2rem" }}>🏍️ Track Your Order</div>
                        <div style={{ fontSize: "0.75rem", color: "#9CA3AF", marginTop: "2px" }}>
                            Order #{orderId?.slice(-8).toUpperCase()}
                            {lastUpdated && ` · Updated ${lastUpdated.toLocaleTimeString()}`}
                        </div>
                    </div>
                    {isOutForDelivery && (
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10B981", animation: "pulse 1.5s infinite" }} />
                            <span style={{ fontSize: "0.75rem", color: "#34D399", fontWeight: "bold" }}>LIVE TRACKING</span>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
            `}</style>

            <div style={{ maxWidth: "700px", margin: "0 auto", padding: "1.5rem" }}>

                {/* Delivery Status Timeline */}
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", padding: "1.5rem", marginBottom: "1.5rem" }}>
                    <div style={{ fontWeight: 900, marginBottom: "1.25rem", fontSize: "1rem" }}>Delivery Status</div>
                    <div style={{ position: "relative" }}>
                        {STATUS_STEPS.map((step, i) => {
                            const isActive = i === currentStepIndex;
                            const isDone = i < currentStepIndex || isDelivered;
                            return (
                                <div key={step.key} style={{ display: "flex", alignItems: "flex-start", gap: "1rem", marginBottom: i < STATUS_STEPS.length - 1 ? "1rem" : 0 }}>
                                    {/* Icon */}
                                    <div style={{
                                        width: "40px", height: "40px", borderRadius: "50%", flexShrink: 0,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        background: isDone ? "#10B981" : isActive ? "#6366F1" : "rgba(255,255,255,0.06)",
                                        border: isActive ? "2px solid #818CF8" : "none",
                                        fontSize: "1.1rem",
                                        boxShadow: isActive ? "0 0 16px rgba(99,102,241,0.5)" : "none"
                                    }}>
                                        {isDone ? "✅" : step.icon}
                                    </div>
                                    {/* Label */}
                                    <div style={{ flex: 1, paddingTop: "8px" }}>
                                        <div style={{ fontWeight: isActive ? 900 : isDone ? 700 : 400, color: isDone ? "#34D399" : isActive ? "white" : "#6B7280", fontSize: isActive ? "1rem" : "0.9rem" }}>
                                            {step.label}
                                            {isActive && (
                                                <span style={{ marginLeft: "8px", fontSize: "0.7rem", background: "#6366F1", color: "white", padding: "2px 8px", borderRadius: "10px", fontWeight: 900 }}>CURRENT</span>
                                            )}
                                        </div>
                                    </div>
                                    {/* Connector line */}
                                    {i < STATUS_STEPS.length - 1 && (
                                        <div style={{ position: "absolute", left: "19px", top: `${(i + 1) * 56 - 16}px`, width: "2px", height: "32px", background: isDone ? "#10B981" : "rgba(255,255,255,0.1)" }} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ETA Card */}
                {isOutForDelivery && tracking.etaMinutes !== null && (
                    <div style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(16,185,129,0.15))", border: "1px solid rgba(99,102,241,0.3)", borderRadius: "20px", padding: "1.5rem", marginBottom: "1.5rem", textAlign: "center" }}>
                        <div style={{ fontSize: "0.8rem", fontWeight: 800, color: "#A5B4FC", textTransform: "uppercase", letterSpacing: "0.1em" }}>Estimated Arrival</div>
                        <div style={{ fontSize: "3rem", fontWeight: 900, color: "white", margin: "8px 0" }}>
                            {tracking.etaMinutes < 1 ? "Arriving Now!" : `${tracking.etaMinutes} min`}
                        </div>
                        {tracking.distanceKm && (
                            <div style={{ fontSize: "0.85rem", color: "#9CA3AF" }}>
                                Rider is {tracking.distanceKm} km away
                                {tracking.riderSpeed > 0 && ` · travelling at ${tracking.riderSpeed} km/h`}
                            </div>
                        )}
                    </div>
                )}

                {/* Delivered Banner */}
                {isDelivered && (
                    <div style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: "20px", padding: "1.5rem", marginBottom: "1.5rem", textAlign: "center" }}>
                        <div style={{ fontSize: "3rem", marginBottom: "8px" }}>🎉</div>
                        <div style={{ fontWeight: 900, fontSize: "1.3rem", color: "#34D399" }}>Order Delivered!</div>
                        <div style={{ color: "#9CA3AF", fontSize: "0.85rem", marginTop: "4px" }}>Thank you for ordering from Swastik Medicare!</div>
                    </div>
                )}

                {/* Live Map */}
                {isOutForDelivery && tracking.riderLat && tracking.riderLng && (
                    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", overflow: "hidden", marginBottom: "1.5rem" }}>
                        <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid rgba(255,255,255,0.06)", fontWeight: 900, fontSize: "0.9rem" }}>
                            🗺️ Live Rider Location
                        </div>
                        <div style={{ height: "300px" }}>
                            <TrackingMap
                                riderLat={tracking.riderLat}
                                riderLng={tracking.riderLng}
                                riderHeading={tracking.riderHeading}
                                customerLat={tracking.customerLat}
                                customerLng={tracking.customerLng}
                                retailerLat={tracking.retailerLat}
                                retailerLng={tracking.retailerLng}
                            />
                        </div>
                    </div>
                )}

                {/* Rider Info */}
                {isOutForDelivery && tracking.riderName && (
                    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                            <div style={{ fontWeight: 900 }}>🏍️ {tracking.riderName}</div>
                            <div style={{ fontSize: "0.8rem", color: "#9CA3AF" }}>Your Delivery Partner · {tracking.vehicleNumber || "N/A"}</div>
                        </div>
                        {tracking.riderPhone && (
                            <a href={`tel:${tracking.riderPhone}`} style={{
                                background: "#10B981", color: "white", padding: "10px 18px",
                                borderRadius: "10px", fontWeight: "bold", fontSize: "0.85rem",
                                textDecoration: "none"
                            }}>
                                📞 Call Rider
                            </a>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
