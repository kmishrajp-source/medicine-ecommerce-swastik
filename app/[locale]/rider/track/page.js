"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function RiderTrackPage() {
    const { data: session } = useSession();
    const [isTracking, setIsTracking] = useState(false);
    const [status, setStatus] = useState("idle"); // idle | requesting | active | error
    const [currentPos, setCurrentPos] = useState(null);
    const [pingCount, setPingCount] = useState(0);
    const [lastPing, setLastPing] = useState(null);
    const [orderId, setOrderId] = useState("");
    const [batteryLevel, setBatteryLevel] = useState(null);
    const watchIdRef = useRef(null);
    const intervalRef = useRef(null);
    const posRef = useRef(null);

    // Try to get battery level
    useEffect(() => {
        if (navigator.getBattery) {
            navigator.getBattery().then(b => setBatteryLevel(Math.round(b.level * 100)));
        }
    }, []);

    const sendPing = useCallback(async (pos) => {
        try {
            const body = {
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
                heading: pos.coords.heading || null,
                speed: pos.coords.speed ? parseFloat((pos.coords.speed * 3.6).toFixed(1)) : null, // m/s to km/h
                accuracy: pos.coords.accuracy || null,
                batteryLevel: batteryLevel,
                orderId: orderId || null
            };

            const res = await fetch("/api/rider/location", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                setPingCount(c => c + 1);
                setLastPing(new Date());
                setCurrentPos({
                    lat: pos.coords.latitude.toFixed(6),
                    lng: pos.coords.longitude.toFixed(6),
                    speed: body.speed,
                    accuracy: pos.coords.accuracy?.toFixed(0)
                });
            }
        } catch (e) {
            console.error("Ping failed:", e);
        }
    }, [batteryLevel, orderId]);

    const startTracking = () => {
        if (!navigator.geolocation) {
            setStatus("error");
            alert("Geolocation is not supported on this device/browser.");
            return;
        }

        setStatus("requesting");

        watchIdRef.current = navigator.geolocation.watchPosition(
            (pos) => {
                posRef.current = pos;
                setStatus("active");
                setIsTracking(true);
            },
            (err) => {
                setStatus("error");
                alert(`GPS error: ${err.message}`);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );

        // Ping server every 5 seconds
        intervalRef.current = setInterval(() => {
            if (posRef.current) {
                sendPing(posRef.current);
            }
        }, 5000);
    };

    const stopTracking = async () => {
        if (watchIdRef.current) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setIsTracking(false);
        setStatus("idle");
        posRef.current = null;
    };

    useEffect(() => {
        return () => {
            if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    // Re-bind sendPing to interval when orderId/batteryLevel changes
    useEffect(() => {
        if (!isTracking) return;
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            if (posRef.current) sendPing(posRef.current);
        }, 5000);
    }, [sendPing, isTracking]);

    return (
        <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0b0f19 0%, #1e293b 100%)", color: "white", fontFamily: "Inter, sans-serif" }}>

            {/* Nav */}
            <div style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "1rem 1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                <Link href="/rider/cash" style={{ color: "#9CA3AF", fontSize: "0.85rem", textDecoration: "none" }}>← Rider Portal</Link>
                <span style={{ color: "#4B5563" }}>|</span>
                <span style={{ fontWeight: 900, fontSize: "1.05rem" }}>📡 GPS Delivery Tracker</span>
                {isTracking && (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10B981", animation: "pulse 1.5s infinite" }} />
                        <span style={{ fontSize: "0.7rem", color: "#34D399", fontWeight: "bold" }}>BROADCASTING LIVE</span>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
            `}</style>

            <div style={{ maxWidth: "500px", margin: "0 auto", padding: "2rem 1.5rem" }}>

                <h1 style={{ fontSize: "1.8rem", fontWeight: 900, marginBottom: "0.5rem" }}>Start GPS Tracking</h1>
                <p style={{ color: "#9CA3AF", fontSize: "0.9rem", marginBottom: "2rem" }}>
                    Your real-time location is shared with customers and the operations team while tracking is active.
                </p>

                {/* Active Order ID Input */}
                <div style={{ marginBottom: "1.5rem" }}>
                    <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "6px" }}>
                        Active Order ID (Optional)
                    </label>
                    <input
                        type="text"
                        value={orderId}
                        onChange={e => setOrderId(e.target.value.trim())}
                        disabled={isTracking}
                        placeholder="Paste Order ID to link tracking to this order"
                        style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "12px", color: "white", outline: "none", fontSize: "0.9rem" }}
                    />
                </div>

                {/* Main Toggle Button */}
                <button
                    onClick={isTracking ? stopTracking : startTracking}
                    disabled={status === "requesting"}
                    style={{
                        width: "100%", padding: "20px", borderRadius: "20px", border: "none",
                        fontWeight: 900, fontSize: "1.1rem", cursor: status === "requesting" ? "wait" : "pointer",
                        background: isTracking
                            ? "linear-gradient(135deg, #EF4444, #B91C1C)"
                            : "linear-gradient(135deg, #10B981, #059669)",
                        color: "white",
                        boxShadow: isTracking
                            ? "0 8px 32px rgba(239,68,68,0.4)"
                            : "0 8px 32px rgba(16,185,129,0.4)",
                        transition: "all 0.3s"
                    }}
                >
                    {status === "requesting" ? "📡 Requesting GPS Access..." :
                     isTracking ? "🔴 Stop GPS Broadcasting" :
                     "🟢 Start GPS Broadcasting"}
                </button>

                {/* Status Panel */}
                {isTracking && (
                    <div style={{ marginTop: "1.5rem", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", borderRadius: "16px", padding: "1.25rem" }}>
                        <div style={{ fontWeight: 900, color: "#34D399", marginBottom: "1rem", fontSize: "0.9rem" }}>📡 Broadcasting Status</div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                            <div>
                                <div style={{ fontSize: "0.65rem", color: "#6B7280", textTransform: "uppercase" }}>Pings Sent</div>
                                <div style={{ fontWeight: 900, fontSize: "1.4rem", color: "#34D399" }}>{pingCount}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: "0.65rem", color: "#6B7280", textTransform: "uppercase" }}>Battery</div>
                                <div style={{ fontWeight: 900, fontSize: "1.4rem", color: batteryLevel < 20 ? "#EF4444" : "white" }}>{batteryLevel ? `${batteryLevel}%` : "–"}</div>
                            </div>
                        </div>

                        {currentPos && (
                            <div style={{ marginTop: "1rem", background: "rgba(0,0,0,0.3)", borderRadius: "10px", padding: "10px", fontFamily: "monospace", fontSize: "0.75rem" }}>
                                <div>📍 {currentPos.lat}, {currentPos.lng}</div>
                                {currentPos.speed !== null && <div>🏎️ Speed: {currentPos.speed} km/h</div>}
                                {currentPos.accuracy && <div>🎯 Accuracy: ±{currentPos.accuracy}m</div>}
                            </div>
                        )}

                        {lastPing && (
                            <div style={{ marginTop: "8px", fontSize: "0.7rem", color: "#9CA3AF" }}>
                                Last ping: {lastPing.toLocaleTimeString()}
                            </div>
                        )}
                    </div>
                )}

                {/* Error state */}
                {status === "error" && (
                    <div style={{ marginTop: "1.5rem", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "16px", padding: "1.25rem", color: "#EF4444" }}>
                        <div style={{ fontWeight: 900, marginBottom: "4px" }}>❌ GPS Access Failed</div>
                        <div style={{ fontSize: "0.85rem" }}>Please enable location permissions in your browser settings and try again.</div>
                    </div>
                )}

                {/* Instructions */}
                <div style={{ marginTop: "2rem", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "1.25rem" }}>
                    <div style={{ fontWeight: 800, fontSize: "0.85rem", color: "#9CA3AF", marginBottom: "0.75rem" }}>HOW IT WORKS</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {[
                            ["📡", "Your GPS position is sent to the server every 5 seconds."],
                            ["👤", "Customers can see your live location on their tracking page."],
                            ["📋", "All pings are logged to your route history."],
                            ["🚨", "The system auto-alerts ops if you go 2km off-route or stay too long."]
                        ].map(([icon, text], i) => (
                            <div key={i} style={{ display: "flex", gap: "10px", fontSize: "0.8rem", color: "#9CA3AF" }}>
                                <span style={{ fontSize: "1rem" }}>{icon}</span>
                                <span>{text}</span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
