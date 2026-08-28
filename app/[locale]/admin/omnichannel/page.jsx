"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { useCart } from "@/context/CartContext";

const CHANNELS = [
    {
        id: "WEBSITE",
        name: "Website",
        icon: "🌐",
        color: "#06B6D4",
        description: "Swastik Medicare production website",
        isConnected: true,
        isApiAvailable: true,
        canPost: true,
        canMessage: true,
        canAnalytics: true,
        status: "ACTIVE",
        note: "Internal — always active",
    },
    {
        id: "WHATSAPP",
        name: "WhatsApp",
        icon: "💬",
        color: "#25D366",
        description: "MSG91 WhatsApp Business API",
        isConnected: true,
        isApiAvailable: true,
        canPost: false,
        canMessage: true,
        canAnalytics: false,
        status: "ACTIVE",
        note: "Transactional via MSG91 · AI Chatbot active",
    },
    {
        id: "SMS",
        name: "SMS",
        icon: "📱",
        color: "#F59E0B",
        description: "MSG91 Transactional SMS",
        isConnected: true,
        isApiAvailable: true,
        canPost: false,
        canMessage: true,
        canAnalytics: false,
        status: "ACTIVE",
        note: "OTP, Order alerts, Crons via MSG91",
    },
    {
        id: "EMAIL",
        name: "Email",
        icon: "📧",
        color: "#6366F1",
        description: "Email marketing channel",
        isConnected: false,
        isApiAvailable: false,
        canPost: false,
        canMessage: false,
        canAnalytics: false,
        status: "NOT_CONFIGURED",
        note: "No email provider configured yet",
    },
    {
        id: "FACEBOOK",
        name: "Facebook",
        icon: "📘",
        color: "#1877F2",
        description: "Meta Graph API — Pages & Ads",
        isConnected: false,
        isApiAvailable: false,
        canPost: false,
        canMessage: false,
        canAnalytics: false,
        status: "NOT_CONNECTED",
        note: "Pixel installed · Publishing API not connected",
        connectUrl: "/api/admin/omnichannel/connect/FACEBOOK"
    },
    {
        id: "INSTAGRAM",
        name: "Instagram",
        icon: "📸",
        color: "#E1306C",
        description: "Meta Graph API — Instagram Business",
        isConnected: false,
        isApiAvailable: false,
        canPost: false,
        canMessage: false,
        canAnalytics: false,
        status: "NOT_CONNECTED",
        note: "Not connected",
        connectUrl: "/api/admin/omnichannel/connect/INSTAGRAM"
    },
    {
        id: "YOUTUBE",
        name: "YouTube",
        icon: "▶️",
        color: "#FF0000",
        description: "YouTube Data API v3",
        isConnected: false,
        isApiAvailable: false,
        canPost: false,
        canMessage: false,
        canAnalytics: false,
        status: "NOT_CONNECTED",
        note: "Not connected",
    },
    {
        id: "GOOGLE_BUSINESS",
        name: "Google Business",
        icon: "🗺️",
        color: "#4285F4",
        description: "Google Business Profile API",
        isConnected: false,
        isApiAvailable: false,
        canPost: false,
        canMessage: false,
        canAnalytics: false,
        status: "NOT_CONNECTED",
        note: "Not connected",
    },
];

const STATUS_BADGE = {
    ACTIVE: { label: "Active", bg: "#064E3B", text: "#34D399", border: "#065F46" },
    NOT_CONNECTED: { label: "Not Connected", bg: "#1F2937", text: "#9CA3AF", border: "#374151" },
    NOT_CONFIGURED: { label: "Not Configured", bg: "#3B1F06", text: "#F59E0B", border: "#78350F" },
    ERROR: { label: "Error", bg: "#450A0A", text: "#F87171", border: "#7F1D1D" },
};

const OMNICHANNEL_FEATURES = [
    { icon: "📚", title: "Master Content Library", path: "/admin/omnichannel/content", description: "Create once, publish everywhere.", ready: true },
    { icon: "📅", title: "Content Calendar", path: "/admin/omnichannel/calendar", description: "Schedule and manage all posts.", ready: true },
    { icon: "🤖", title: "AI Marketing Assistant", path: "/admin/omnichannel/ai-assist", description: "AI drafts your content from real Swastik data.", ready: true },
    { icon: "📊", title: "Campaign Analytics", path: "/admin/marketing-intelligence", description: "ROI, leads, and conversions by channel.", ready: true },
    { icon: "📣", title: "Mass WhatsApp", path: "/admin/mass-whatsapp", description: "Approved broadcast campaigns.", ready: true },
    { icon: "✅", title: "Human Approval Workflow", path: "/admin/omnichannel/approvals", description: "Review AI-generated content before publishing.", ready: false },
];

function StatusDot({ active }) {
    return (
        <span style={{
            display: "inline-block",
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: active ? "#34D399" : "#6B7280",
            marginRight: 6,
            boxShadow: active ? "0 0 6px #34D399" : "none",
        }} />
    );
}

function CheckBadge({ value }) {
    return (
        <span style={{
            display: "inline-block",
            padding: "2px 10px",
            borderRadius: 99,
            fontSize: "0.72rem",
            fontWeight: 700,
            background: value ? "rgba(52,211,153,0.12)" : "rgba(107,114,128,0.15)",
            color: value ? "#34D399" : "#6B7280",
            border: `1px solid ${value ? "#34D39355" : "#374151"}`,
        }}>
            {value ? "✓ YES" : "—"}
        </span>
    );
}

export default function OmnichannelHub() {
    const { cartCount, toggleCart } = useCart();
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "unauthenticated") router.push("/login");
        else if (status === "authenticated" && session?.user?.role === "CUSTOMER") router.push("/");
    }, [status, session, router]);

    const connected = CHANNELS.filter(c => c.isConnected).length;
    const total = CHANNELS.length;

    return (
        <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0A0A0F 0%, #0D1117 50%, #0A0A0F 100%)", color: "white", fontFamily: "'Inter', sans-serif" }}>
            <Navbar cartCount={cartCount} toggleCart={toggleCart} />
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 16px" }}>

                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 32 }}>
                    <div>
                        <Link href="/admin" style={{ color: "#6B7280", fontSize: "0.85rem", textDecoration: "none", display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                            ← Back to Admin
                        </Link>
                        <h1 style={{ fontSize: "2rem", fontWeight: 800, background: "linear-gradient(90deg, #F43F5E, #EC4899, #8B5CF6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: 0 }}>
                            🌐 Omnichannel Hub
                        </h1>
                        <p style={{ color: "#9CA3AF", marginTop: 6, fontSize: "0.95rem" }}>
                            One platform · Many channels · Zero duplication
                        </p>
                    </div>
                    <div style={{ background: "rgba(244,63,94,0.08)", border: "1px solid rgba(244,63,94,0.2)", borderRadius: 16, padding: "14px 22px", textAlign: "center" }}>
                        <div style={{ fontSize: "2rem", fontWeight: 800, color: "#F43F5E" }}>{connected}/{total}</div>
                        <div style={{ fontSize: "0.75rem", color: "#9CA3AF", fontWeight: 600 }}>CHANNELS CONNECTED</div>
                    </div>
                </div>

                {/* Channel Connection Center */}
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 20, padding: "24px", marginBottom: 28 }}>
                    <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "white", marginBottom: 6 }}>
                        📡 Channel Connection Center
                    </h2>
                    <p style={{ color: "#6B7280", fontSize: "0.82rem", marginBottom: 20 }}>
                        Status reflects actual API connections. A channel is only marked "Connected" when verified.
                    </p>

                    {/* Table Header */}
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "180px 1fr 90px 100px 90px 90px 90px 130px",
                        gap: 8,
                        padding: "8px 12px",
                        background: "rgba(255,255,255,0.04)",
                        borderRadius: 8,
                        marginBottom: 8,
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        color: "#6B7280",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                    }}>
                        <div>Channel</div>
                        <div>Notes</div>
                        <div style={{ textAlign: "center" }}>Connected</div>
                        <div style={{ textAlign: "center" }}>API Available</div>
                        <div style={{ textAlign: "center" }}>Posting</div>
                        <div style={{ textAlign: "center" }}>Messaging</div>
                        <div style={{ textAlign: "center" }}>Analytics</div>
                        <div style={{ textAlign: "center" }}>Status</div>
                    </div>

                    {/* Channel Rows */}
                    {CHANNELS.map(ch => {
                        const badge = STATUS_BADGE[ch.status] || STATUS_BADGE.NOT_CONNECTED;
                        return (
                            <div key={ch.id} style={{
                                display: "grid",
                                gridTemplateColumns: "180px 1fr 90px 100px 90px 90px 90px 130px",
                                gap: 8,
                                padding: "12px 12px",
                                borderBottom: "1px solid rgba(255,255,255,0.04)",
                                alignItems: "center",
                                transition: "background 0.2s",
                            }}
                                onMouseOver={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                                onMouseOut={e => e.currentTarget.style.background = "transparent"}
                            >
                                {/* Channel */}
                                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                    <div style={{ width: 36, height: 36, borderRadius: 10, background: ch.color + "22", border: `1px solid ${ch.color}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", flexShrink: 0 }}>
                                        {ch.icon}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: "0.88rem", color: "white" }}>{ch.name}</div>
                                        <div style={{ fontSize: "0.68rem", color: "#6B7280" }}>{ch.description}</div>
                                    </div>
                                </div>
                                {/* Notes */}
                                <div style={{ fontSize: "0.75rem", color: "#9CA3AF" }}>
                                    {ch.note}
                                    {ch.status === "NOT_CONNECTED" && ch.connectUrl && (
                                        <div style={{ marginTop: 6 }}>
                                            <Link href={ch.connectUrl} style={{
                                                display: "inline-block", padding: "4px 10px", borderRadius: 6,
                                                background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.3)",
                                                color: "#60A5FA", fontSize: "0.7rem", fontWeight: 700, textDecoration: "none"
                                            }}>
                                                + Connect Account
                                            </Link>
                                        </div>
                                    )}
                                </div>
                                {/* Columns */}
                                <div style={{ textAlign: "center" }}><CheckBadge value={ch.isConnected} /></div>
                                <div style={{ textAlign: "center" }}><CheckBadge value={ch.isApiAvailable} /></div>
                                <div style={{ textAlign: "center" }}><CheckBadge value={ch.canPost} /></div>
                                <div style={{ textAlign: "center" }}><CheckBadge value={ch.canMessage} /></div>
                                <div style={{ textAlign: "center" }}><CheckBadge value={ch.canAnalytics} /></div>
                                {/* Status badge */}
                                <div style={{ textAlign: "center" }}>
                                    <span style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        padding: "4px 12px",
                                        borderRadius: 99,
                                        fontSize: "0.72rem",
                                        fontWeight: 700,
                                        background: badge.bg,
                                        color: badge.text,
                                        border: `1px solid ${badge.border}`,
                                    }}>
                                        <StatusDot active={ch.isConnected} />
                                        {badge.label}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Feature Grid */}
                <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "white", marginBottom: 16 }}>
                    🚀 Omnichannel Features
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14, marginBottom: 32 }}>
                    {OMNICHANNEL_FEATURES.map(feat => (
                        <Link
                            key={feat.title}
                            href={feat.ready ? feat.path : "#"}
                            style={{
                                display: "block",
                                background: "rgba(255,255,255,0.03)",
                                border: feat.ready ? "1px solid rgba(244,63,94,0.2)" : "1px solid rgba(255,255,255,0.06)",
                                borderRadius: 14,
                                padding: "18px 20px",
                                textDecoration: "none",
                                color: "white",
                                transition: "all 0.2s",
                                opacity: feat.ready ? 1 : 0.55,
                                cursor: feat.ready ? "pointer" : "default",
                            }}
                            onMouseOver={e => feat.ready && (e.currentTarget.style.background = "rgba(244,63,94,0.06)")}
                            onMouseOut={e => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
                        >
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                                <span style={{ fontSize: "1.4rem" }}>{feat.icon}</span>
                                <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>{feat.title}</span>
                                {!feat.ready && <span style={{ marginLeft: "auto", fontSize: "0.68rem", color: "#F59E0B", background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.2)", padding: "2px 8px", borderRadius: 99, fontWeight: 700 }}>COMING SOON</span>}
                            </div>
                            <p style={{ color: "#9CA3AF", fontSize: "0.82rem", margin: 0 }}>{feat.description}</p>
                        </Link>
                    ))}
                </div>

                {/* Architecture Diagram */}
                <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "24px", textAlign: "center" }}>
                    <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#9CA3AF", marginBottom: 16, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        Architecture: One Database → Many Channels
                    </h2>
                    <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 8, fontSize: "0.82rem" }}>
                        {["ONE SWASTIK DATABASE", "→", "MASTER CONTENT LIBRARY", "→", "AI ADAPTER", "→"].map((t, i) => (
                            <span key={i} style={{ color: i % 2 === 0 ? "white" : "#F43F5E", fontWeight: i % 2 === 0 ? 700 : 400 }}>{t}</span>
                        ))}
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
                            {["🌐 Website", "📘 Facebook", "📸 Instagram", "▶️ YouTube", "💬 WhatsApp", "📧 Email"].map(ch => (
                                <span key={ch} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "4px 12px", color: "#D1D5DB", fontWeight: 600 }}>{ch}</span>
                            ))}
                        </div>
                    </div>
                    <div style={{ marginTop: 12, color: "#F43F5E", fontWeight: 700, fontSize: "0.85rem" }}>
                        ↓ ALL CHANNELS BRING CUSTOMERS BACK TO SWASTIKMED.ONLINE ↓
                    </div>
                </div>

            </div>
        </div>
    );
}
