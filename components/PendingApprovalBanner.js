"use client";
import Link from "next/link";

export default function PendingApprovalBanner({ partnerType = "Partner", name = "", phone = "" }) {
    return (
        <div style={{
            minHeight: "100vh",
            background: "linear-gradient(135deg, #0b0f19 0%, #111827 100%)",
            color: "white",
            fontFamily: "'Inter', sans-serif",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem"
        }}>
            {/* Animated Pending Badge */}
            <div style={{
                width: "100px", height: "100px", borderRadius: "50%",
                background: "rgba(245,158,11,0.15)",
                border: "3px solid rgba(245,158,11,0.5)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "3rem", marginBottom: "2rem",
                boxShadow: "0 0 40px rgba(245,158,11,0.2)",
                animation: "pulse 2s infinite"
            }}>
                ⏳
            </div>

            <style>{`
                @keyframes pulse { 0%, 100% { box-shadow: 0 0 40px rgba(245,158,11,0.2); } 50% { box-shadow: 0 0 60px rgba(245,158,11,0.4); } }
            `}</style>

            <h1 style={{ fontSize: "1.8rem", fontWeight: 900, margin: 0, textAlign: "center" }}>
                Verification Pending
            </h1>
            <p style={{ color: "#9CA3AF", textAlign: "center", marginTop: "8px", maxWidth: "480px", lineHeight: 1.7, fontSize: "0.95rem" }}>
                Your <strong style={{ color: "white" }}>{partnerType}</strong> registration has been received and is under review by the Swastik Medicare administration team.
                You will be notified on your registered mobile number once verified.
            </p>

            {/* Status Card */}
            <div style={{
                marginTop: "2rem", background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(245,158,11,0.3)",
                borderRadius: "20px", padding: "1.75rem 2rem",
                maxWidth: "500px", width: "100%"
            }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {[
                        { icon: "📋", label: "Status", value: "Under Review", color: "#F59E0B" },
                        { icon: "🏢", label: "Application Type", value: partnerType },
                        { icon: "📞", label: "Contact for Updates", value: "+91 97549 99599" },
                        { icon: "⏱️", label: "Review Timeline", value: "24–48 business hours" }
                    ].map(({ icon, label, value, color }) => (
                        <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "0.75rem" }}>
                            <span style={{ fontSize: "0.85rem", color: "#9CA3AF" }}>{icon} {label}</span>
                            <span style={{ fontWeight: 700, fontSize: "0.9rem", color: color || "white" }}>{value}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* What Happens Next */}
            <div style={{
                marginTop: "1.5rem", background: "rgba(99,102,241,0.08)",
                border: "1px solid rgba(99,102,241,0.2)",
                borderRadius: "16px", padding: "1.5rem",
                maxWidth: "500px", width: "100%"
            }}>
                <div style={{ fontWeight: 800, fontSize: "0.85rem", color: "#A5B4FC", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    What happens next?
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {[
                        ["1️⃣", "Admin reviews your application and documents"],
                        ["2️⃣", "You receive a WhatsApp notification on approval"],
                        ["3️⃣", "Your dashboard is unlocked for full platform access"],
                    ].map(([num, text]) => (
                        <div key={num} style={{ display: "flex", gap: "10px", fontSize: "0.85rem", color: "#D1D5DB" }}>
                            <span>{num}</span><span>{text}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Support Link */}
            <div style={{ marginTop: "2rem", display: "flex", gap: "1rem" }}>
                <a
                    href="https://wa.me/919754999599?text=Hello%20Swastik%20Medicare%2C%20I%20have%20registered%20as%20a%20partner%20and%20need%20an%20update%20on%20my%20verification%20status."
                    target="_blank"
                    rel="noreferrer"
                    style={{ background: "#25D366", color: "white", padding: "12px 24px", borderRadius: "12px", fontWeight: "bold", textDecoration: "none", fontSize: "0.9rem" }}
                >
                    💬 WhatsApp Support
                </a>
                <Link href="/" style={{ background: "rgba(255,255,255,0.06)", color: "white", padding: "12px 24px", borderRadius: "12px", fontWeight: "bold", textDecoration: "none", fontSize: "0.9rem", border: "1px solid rgba(255,255,255,0.1)" }}>
                    ← Back Home
                </Link>
            </div>
        </div>
    );
}
